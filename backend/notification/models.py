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


# Create your models here.


# ***** =====  Tables for Notification Related Data  ===== *****
class Notification(models.Model):
    NOTIFICATION_TYPE_CHOICES = (
        ('INFO', 'INFO'),
        ('PROMO', 'PROMO'),
        ('ORDER', 'ORDER'),
        ('PAYMENT', 'PAYMENT'),
        ('SHIPPING', 'SHIPPING'),
        ('GENERAL', 'GENERAL'),
        ('MECHANIC_JOB', 'MECHANIC_JOB'),
    )
    
    NOTIFICATION_STATUS_CHOICES = (
        ('UNREAD', 'UNREAD'),
        ('READ', 'READ'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')  # The user to receive the notification
    message = models.TextField(blank=True)  # The content of the notification
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPE_CHOICES, default='GENERAL')  # Type of notification (e.g., order status, promo, etc.)
    status = models.CharField(max_length=10, choices=NOTIFICATION_STATUS_CHOICES, default='UNREAD')  # Read or unread status
    redirect_url = models.URLField(max_length=200, blank=True, null=True)  # URL to redirect the user to upon clicking the notification
    priority = models.PositiveIntegerField(default=0)  # Priority of the notification, lower is higher priority
    is_urgent = models.BooleanField(default=False)  # To mark urgent notifications
    extra_data = models.TextField(blank=True)  # Additional data related to the notification (could be product info, order ID, etc.)

    # Default fields
    created_at = models.DateTimeField(auto_now_add=True) # Timestamp when notification is created
    last_modified_at = models.DateTimeField(auto_now=True) # Timestamp when notification is last updated
    is_active = models.BooleanField(default=True)  # To check if notification is still active or deleted

    class Meta:
        ordering = ['-created_at']  # Ensure notifications are ordered by creation time (newest first)

    def __str__(self):
        return f"Notification for {self.user.get_full_name()}: {self.message[:50]}..."

    # For soft delete
    def delete(self, *args, **kwargs):
        self.is_active = False  # Mark as inactive instead of deleting
        self.save()
# ***** =====  END  ===== *****