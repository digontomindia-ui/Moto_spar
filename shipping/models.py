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

# * Models
from app.models import User


# Create your models here.


# ***** =====  Tables for Delivery Data  ===== *****
class ShippingAddress(models.Model):
    ADDRESS_TYPE_CHOICES = [
        ('Home', 'Home'),
        ('Office', 'Office'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    # Customer fields
    name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(max_length=100, null=True, blank=True)
    address_type = models.CharField(max_length=10, choices=ADDRESS_TYPE_CHOICES, default='Home')

    # Address fields
    street_address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, blank=True)

    # Phone Number field
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    alternate_phone_number = models.CharField(max_length=20, blank=True, null=True)

    # Geolocation fields
    latitude = models.DecimalField(max_digits=24, decimal_places=20, null=True, blank=True)
    longitude = models.DecimalField(max_digits=24, decimal_places=20, null=True, blank=True)
    
    # Default fields
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)  # add is_active field

    def __str__(self):
        return f"{self.user.get_full_name()}, {self.city}, {self.state}, {self.postal_code}"

    # * For soft delete
    def delete(self, *args, **kwargs):
        self.is_active = False  # set is_active field to False
        self.save()


class BillingAddress(models.Model):
    ADDRESS_TYPE_CHOICES = [
        ('Home', 'Home'),
        ('Office', 'Office'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    # Customer fields
    name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(max_length=100, null=True, blank=True)
    address_type = models.CharField(max_length=10, choices=ADDRESS_TYPE_CHOICES, default='Home')
    
    # Address fields
    street_address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, blank=True)

    # Phone Number field
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    alternate_phone_number = models.CharField(max_length=20, blank=True, null=True)

    # Default fields
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)  # add is_active field
    
    def __str__(self):
        return f"{self.user.get_full_name()}, {self.city}, {self.state}, {self.postal_code}"
    
    # * For soft delete
    def delete(self, *args, **kwargs):
        self.is_active = False  # set is_active field to False
        self.save()
# ***** =====  END  ===== *****
