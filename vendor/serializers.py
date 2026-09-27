# Standard Library Imports
import base64
import json
import os
import subprocess

# Django Imports
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.db.models import Avg

# Third-party Imports
from allauth.account.adapter import get_adapter
from allauth.socialaccount.models import SocialAccount
from rest_framework import serializers

# Local Imports
from product.models import ProductVariant
from product.serializers import (
    ProductWithoutVariantSerializer, ProductVariantSerializer
)
from .models import (
    VendorProfile, VendorStock
)


# ********** Vendor related serializers **********
class VendorProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)  # Include first_name from User
    last_name = serializers.CharField(source='user.last_name', read_only=True)  # Include last_name from User
    is_verified = serializers.BooleanField(source='user.is_verified', read_only=True)  # Custom method to check if the vendor is verified
    email = serializers.CharField(source='user.email', read_only=True)  # Include email from User
    country_code = serializers.CharField(source='user.country_code', read_only=True)  # Include country_code from User
    phone_number = serializers.CharField(source='user.phone_number', read_only=True)  # Include phone_number from User
    bio = serializers.CharField(source='user.bio', allow_blank=True, required=False)  # Include bio from User
    date_of_birth = serializers.DateField(source='user.date_of_birth', allow_null=True, required=False)  # Include date_of_birth from User
    address = serializers.CharField(source='user.address', allow_blank=True, required=False)  # Include address from User
    postal_code = serializers.CharField(source='user.postal_code', allow_blank=True, required=False)  # Include postal_code from User
    state = serializers.CharField(source='user.state', allow_blank=True, required=False)  # Include state from User
    country = serializers.CharField(source='user.country', allow_blank=True, required=False)  # Include country from User
    account_type = serializers.CharField(source='user.account_type', read_only=True)  # Include account_type from User


    class Meta:
        model = VendorProfile
        fields = ['id', 'user', 'first_name', 'last_name', 
                    'is_verified', 'email', 'country_code', 'phone_number',
                    'bio', 'date_of_birth', 'address', 'postal_code',
                    'state', 'country', 'account_type',
                    'store_name', 'store_description', 'store_logo', 
                    'store_address', 'store_city', 'store_postal_code', 
                    'store_state', 'store_country',
                    'store_contact_email', 'store_contact_phone', 
                    'website_url', 'established_date', 'latitude', 'longitude',
                    'bank_account_number', 'bank_name', 'ifsc_code', 'gst_number', 
                    'created_at', 'last_modified_at', 'is_active',]


class VendorStockSerializer(serializers.ModelSerializer):
    vendorprofile = serializers.PrimaryKeyRelatedField(queryset=VendorProfile.objects.all())
    variant = serializers.PrimaryKeyRelatedField(queryset=ProductVariant.objects.all())
    product = serializers.SerializerMethodField()  # Nested serializer for product details

    class Meta:
        model = VendorStock
        fields = ['id', 'vendorprofile', 'product', 'variant', 'stock_quantity', 
                    'in_stock', 'price', 'created_at', 'last_modified_at', 'is_active',]

    def get_product(self, obj):
        """
        Retrieve the product details associated with the variant.
        """
        product = obj.variant.product  # Access the product from the variant
        return ProductWithoutVariantSerializer(product).data
    
    def to_representation(self, instance):
        """
        Override the default representation to include nested serializer data.
        """
        representation = super().to_representation(instance)
        representation['vendorprofile'] = VendorProfileSerializer(instance.vendorprofile).data
        representation['variant'] = ProductVariantSerializer(instance.variant).data
        return representation
# ***** =====  END  ===== *****