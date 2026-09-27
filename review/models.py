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

# Local and Other module imports
from app.models import User
from product.models import Product

# Create your models here.


# ***** =====  Tables for Store Review and Ratings by User  ===== *****
class Review(models.Model):
    """
    Model to store product reviews submitted by users.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True)  # Optional detailed review
    rating = models.DecimalField(max_digits=2, decimal_places=1)  # Rating from 0.0 to 5.0

    # Default fields
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)  # For soft delete or deactivation of reviews

    class Meta:
        unique_together = ('product', 'user')  # Prevent multiple reviews from the same user for the same product
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.rating} stars"

    # ! We will not use soft delete 
    # ! rather we will delete the data permanently
    # * For soft delete
    # def delete(self, *args, **kwargs):
    #     self.is_active = False  # Set is_active field to False instead of deleting the record
    #     self.save()

class ReviewImage(models.Model):
    """
    Model to store images associated with product reviews.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='review_images/')
    caption = models.CharField(max_length=255, blank=True)  # Optional caption for the image

    # Default fields
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)  # For soft delete

    def __str__(self):
        return f"Image for Review: {self.review.title}"
    
    # ! We will not use soft delete 
    # ! rather we will delete the data permanently
    # * For soft delete
    # def delete(self, *args, **kwargs):
    #     self.is_active = False  # Set is_active field to False instead of deleting the record
    #     self.save()
# ***** =====  END  ===== *****