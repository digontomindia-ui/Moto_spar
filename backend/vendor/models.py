# Standard Library Imports
import uuid
from datetime import datetime

# Django Imports
from django.contrib.auth.models import AbstractUser
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.db import models
from django.dispatch import receiver
from django.utils import timezone
from django.utils.translation import gettext as _
from django.http import JsonResponse
from django.conf import settings

# Local Imports
from app.models import User
from product.models import ProductVariant
# Create your models here.


# ! If the account_type is vendor then "VendorProfile" will be created by signals.py (in app folder)
# ? Here vendor will first store their details in "VendorProfile" table
# ? Then he will add those products which he have stocks and their details
# ***** =====  Tables for Vendor Related Data  ===== *****
class VendorProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="vendor_profile")
    store_name = models.CharField(max_length=255, blank=True)
    store_description = models.TextField(blank=True)
    store_logo = models.ImageField(upload_to='store_logos/', blank=True, null=True)
    store_address = models.TextField(blank=True)
    store_city = models.CharField(max_length=100, blank=True)
    store_postal_code = models.CharField(max_length=8, blank=True)
    store_state = models.CharField(max_length=16, blank=True)
    store_country = models.CharField(max_length=32, blank=True)
    store_contact_email = models.EmailField(blank=True, null=True)
    store_contact_phone = models.CharField(max_length=15, blank=True)
    website_url = models.URLField(blank=True, null=True)
    established_date = models.DateField(blank=True, null=True)

    # Geolocation fields
    latitude = models.DecimalField(max_digits=24, decimal_places=20, null=True, blank=True)
    longitude = models.DecimalField(max_digits=24, decimal_places=20, null=True, blank=True)
    
    # Bank and payment details
    bank_account_number = models.CharField(max_length=50, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    ifsc_code = models.CharField(max_length=11, blank=True)
    gst_number = models.CharField(max_length=15, blank=True)  # For Indian vendors

    # Default fields
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)  # add is_active field

    def __str__(self):
        return f"{self.user.email} - {self.store_name}"

    # * For soft delete
    def delete(self, *args, **kwargs):
        self.is_active = False  # set is_active field to False
        self.save()


# This model connects Vendor users to Products 
# they have in stock, storing stock information.
class VendorStock(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vendorprofile = models.ForeignKey(VendorProfile, on_delete=models.PROTECT)
    variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT)
    stock_quantity = models.PositiveIntegerField(default=0)
    in_stock = models.BooleanField(default=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    # Default fields
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)  # add is_active field

    class Meta:
        unique_together = ('vendorprofile', 'variant')
        ordering = ['-last_modified_at']

    def __str__(self):
        return f"{self.vendorprofile.user.get_full_name()} - {self.variant.product.name}"
    
    # * For soft delete
    def delete(self, *args, **kwargs):
        self.is_active = False  # set is_active field to False
        self.save()
# ***** =====  END  ===== *****
