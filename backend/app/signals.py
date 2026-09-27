# Django Imports
from django.db.models.signals import post_save
from django.dispatch import receiver

# Local Imports
from .models import User
from wishlist.models import Wishlist
from cart.models import Cart
from vendor.models import VendorProfile
from mechanic.models import MechanicProfile


# ? This will generate Wishlist and Cart for user == customer
# ? while registration
@receiver(post_save, sender=User)
def create_wishlist_and_cart(sender, instance, created, **kwargs):
    if created and instance.account_type == 'customer':
        Wishlist.objects.get_or_create(user=instance)
        Cart.objects.get_or_create(user=instance)


# ? This will create vendorprofle for user == vendor
# ? while registration
@receiver(post_save, sender=User)
def create_vendor_profile(sender, instance, created, **kwargs):
    # Check if the user is newly created and their account type is 'vendor'
    if created and instance.account_type == 'vendor':
        # Create a VendorProfile for the user
        VendorProfile.objects.get_or_create(user=instance)


# ? This will generate MechanicProfile for user == customer
# ? while registration
@receiver(post_save, sender=User)
def create_mechanic_profile(sender, instance, created, **kwargs):
    # Check if the user is newly created and their account type is 'mechanic'
    if created and instance.account_type == 'mechanic':
        # Create a MechanicProfile for the user
        MechanicProfile.objects.get_or_create(user=instance)