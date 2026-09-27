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
from django.db.models import Avg, Sum 

# Third-party Imports
from allauth.account.adapter import get_adapter
from allauth.socialaccount.models import SocialAccount
from rest_framework import serializers

# Local Imports
from .models import Cart, CartItem
from product.serializers import ProductWithoutVariantSerializer, ProductVariantSerializer
from product.models import ProductVariant


# ********** Cart related serializers **********
class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = ['id', 'user', 'created_at', 'last_modified_at', 'is_active']


class CartItemSerializer(serializers.ModelSerializer):
    product = serializers.SerializerMethodField()
    variant = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.all(),
        write_only=True  # Only use this field during deserialization
    )
    variant_details = ProductVariantSerializer(source='variant', read_only=True)  # Full details for reading

    class Meta:
        model = CartItem
        fields = ['id', 'cart', 'product', 'variant', 'variant_details', 'quantity', 'price_at_addition', 
                    'delivery_charge', 'driver_fees', 'mechanic_fees',
                    'created_at', 'last_modified_at', 'is_active',]

    def get_product(self, obj):
        """
        Retrieve the product details associated with the variant.
        """
        product = obj.variant.product  # Access the product from the variant
        return ProductWithoutVariantSerializer(product).data
# ***** =====  END  ===== *****