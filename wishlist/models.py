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
from product.models import ProductVariant
from app.models import User

# Create your models here


# ? The Wishlist for user.account_type == 'customer' will be created while creation of user
# ? by signals.py in "app" module. The WishlistItem will be added by user and an user can't add 
# ? same product twice at a same time for his wishlist item.
# ***** =====  Tables for Wishlist Related Data  ===== *****
class Wishlist(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Default fields
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)  # add is_active field

    def __str__(self):
        return f"Wishlist of {self.user.email}"

    # * For soft delete
    def delete(self, *args, **kwargs):
        self.is_active = False  # set is_active field to False
        self.save()


class WishlistItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wishlist = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name='items')
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)

    # Default fields
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)  # add is_active field

    class Meta:
        # Ensures that the same variant can't be added to the same wishlist multiple times
        constraints = [
            models.UniqueConstraint(fields=['wishlist', 'variant'], name='unique_variant_in_wishlist')
        ]

    def __str__(self):
        return f"{self.variant.product.name} in {self.wishlist.user.email}'s wishlist"
# ***** =====  END  ===== *****