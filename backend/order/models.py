# Standard Library Imports
import uuid
import random
import string
from datetime import datetime

# Django Imports
from django.contrib.auth.models import AbstractUser
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.core.exceptions import ValidationError
from django.utils.html import strip_tags
from django.db import models
from django.dispatch import receiver
from django.utils import timezone
from django.utils.translation import gettext as _
from django.http import JsonResponse
from django.conf import settings

# * Models
from app.models import User
from shipping.models import ShippingAddress, BillingAddress
from product.models import ProductVariant
from driver.models import Driver


# Create your models here.


# ? When a Customer places an order, 
# ? the order is created and associated 
# ? with ProductVariant. The order is first assigned 
# ? to the Admin, and after review, the Admin assigns 
# ? it to a Vendor.

# ***** =====  Tables for Order Related Data  ===== *****
class Order(models.Model):
    PAYMENT_METHOD_CHOICES = (
        ('PAYMENT_GATEWAY', 'PAYMENT_GATEWAY'),
        ('CASH_ON_DELIVERY', 'CASH_ON_DELIVERY'),
    )
    PAYMENT_STATUS_CHOICES = (
        ('PENDING', 'PENDING'),
        ('SUCCESS', 'SUCCESS'),
        ('FAILURE', 'FAILURE'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(User, on_delete=models.PROTECT, related_name='customer_orders')
    order_code = models.CharField(max_length=20, unique=True, null=True, editable=False)

    shipping_address = models.ForeignKey(ShippingAddress, on_delete=models.PROTECT)
    billing_address = models.ForeignKey(BillingAddress, null=True, blank=True, on_delete=models.PROTECT)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, default='CASH_ON_DELIVERY')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    
    # Delivery Fields
    delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    driver_fees = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)

    driver_details = models.ForeignKey(Driver, on_delete=models.PROTECT, related_name='driver_orders', null=True, blank=True)
    driver_otp = models.CharField(max_length=6, blank=True)
    driver_for_me_url = models.URLField(max_length=500, blank=True, null=True)

    # * Fields for payment gateway
    provider_order_id = models.CharField(max_length=64, blank=True)
    payment_id = models.CharField(max_length=64, blank=True)
    signature_id = models.CharField(max_length=128, blank=True)
    is_successful = models.BooleanField(default=False)
    
    # Default fields
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)  # add is_active field

    def __str__(self):
        return f"Order {self.id} by {self.customer.get_full_name()}"

    def generate_order_code(self):
        """Generate a unique order code with the format DDMMYY followed by random letters and numbers."""
        date_prefix = datetime.now().strftime('%d%m%y')
        random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"{date_prefix}{random_suffix}"

    def save(self, *args, **kwargs):
        if not self.order_code:
            while True:
                code = self.generate_order_code()
                if not Order.objects.filter(order_code=code).exists():
                    self.order_code = code
                    break
        super().save(*args, **kwargs)

    # * For soft delete
    def delete(self, *args, **kwargs):
        self.is_active = False  # set is_active field to False
        self.save()


# ? An OrderItem model tracks the individual products 
# ? within an order, including quantity and price.
class OrderItem(models.Model):
    ORDER_STATUS_CHOICES = (
        ('PENDING', 'PENDING'),
        ('ADMIN_REVIEW', 'ADMIN_REVIEW'),
        ('ASSIGNED_TO_VENDOR', 'ASSIGNED_TO_VENDOR'),
        ('VENDOR_ACCEPTED', 'VENDOR_ACCEPTED'),
        ('DRIVER_FOR_PICK', 'DRIVER_FOR_PICK'),
        ('DRIVER_FOR_DROP', 'DRIVER_FOR_DROP'),
        ('WORK_COMPLETED', 'WORK_COMPLETED'),
        ('DELIVERED', 'DELIVERED'),
        ('CANCELLED', 'CANCELLED'),
    )
    PAYMENT_STATUS_CHOICES = (
        ('PENDING', 'PENDING'),
        ('SUCCESS', 'SUCCESS'),
        ('FAILURE', 'FAILURE'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name='order_items')
    variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    assigned_vendor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='vendor_orders')
    order_status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='PENDING')
    
    item_total_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='PENDING')

    # Installation Charges related fields
    mechanic = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='mechanic_orders')
    mechanic_fees_for_customer = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    mechanic_fees_for_mechanic = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    mechanic_otp = models.CharField(max_length=6, blank=True)
    installation_required = models.BooleanField(default=False)

    # vendor payment related fields
    vendor_selling_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    vendor_payment_status = models.BooleanField(default=False)

    # Default fields
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)  # add is_active field

    class Meta:
        # Ensures that the same variant can't be added to the same order multiple times
        constraints = [
            models.UniqueConstraint(fields=['order', 'variant'], name='unique_variant_in_order')
        ]

    def __str__(self):
        return f"{self.variant.product.name} x {self.quantity}"
    
    def total_price(self):
        return self.quantity * self.price

    # Ensure quantity is greater than zero
    def clean(self):
        if self.quantity <= 0:
            raise ValidationError("Quantity must be greater than zero.")
    
    def save(self, *args, **kwargs):
        # Automatically calculate item_total_price based on quantity and price
        if self.price and self.quantity:
            self.item_total_price = self.quantity * self.price
        super().save(*args, **kwargs)
    
    # * For soft delete
    def delete(self, *args, **kwargs):
        self.is_active = False  # set is_active field to False
        self.save()


# This will store vendor details, whom admin send request
# for an order varient
# class VendorRequestLog(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, related_name='order_requests')
#     vendor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vendor_requests')
#     price = models.DecimalField(max_digits=10, decimal_places=2)
#     distance = models.FloatField()
#     is_accpeted = models.BooleanField(default=False)

#     # Default fields
#     created_at = models.DateTimeField(auto_now_add=True)
#     last_modified_at = models.DateTimeField(auto_now=True)
#     is_active = models.BooleanField(default=True)  # add is_active field

#     def __str__(self):
#         return f"Request for OrderItem {self.order_item.id} to Vendor {self.vendor.store_name}"

#     # * For soft delete
#     def delete(self, *args, **kwargs):
#         self.is_active = False  # set is_active field to False
#         self.save()
# ***** =====  END  ===== *****