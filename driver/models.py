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


# Create your models here.


# ***** =====  Tables for Driver Data  ===== *****
class Driver(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True, blank=True)
    phone_number = models.CharField(max_length=15)
    date_of_birth = models.DateField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='driver_profiles/', null=True, blank=True)
    
    # Driver License Details
    license_number = models.CharField(max_length=50, unique=True)
    license_type = models.CharField(max_length=20, blank=True)
    license_expiry_date = models.DateField(blank=True)
    license_status = models.CharField(max_length=20, choices=[('valid', 'Valid'), ('expired', 'Expired'), ('suspended', 'Suspended')])

    # Availability and Employment Status
    is_available = models.BooleanField(default=True)
    employment_status = models.CharField(max_length=50, choices=[('full_time', 'Full Time'), ('part_time', 'Part Time'), ('contractor', 'Contractor')], default='full_time')

    # Address Details
    address_line_1 = models.CharField(max_length=255)
    address_line_2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)

    # Tracking and Performance Metrics
    total_deliveries = models.PositiveIntegerField(default=0)  # Number of deliveries the driver has completed
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.00)  # Driver rating out of 5
    
    # Emergency Contact Details
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True)
    
    # Default fields
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)  # add is_active field


    class Meta:
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name})"
    
    # * For soft delete
    def delete(self, *args, **kwargs):
        self.is_active = False  # set is_active field to False
        self.save()
# ***** =====  END  ===== *****