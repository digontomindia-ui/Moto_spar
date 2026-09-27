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
from app.models import User
from .models import Order, OrderItem
from driver.models import Driver
from product.models import ProductVariant
from shipping.models import ShippingAddress, BillingAddress
from product.serializers import ProductVariantSerializer, ProductWithoutVariantSerializer
from app.serializers import UserSerializer
from shipping.serializers import ShippingAddressSerializer, BillingAddressSerializer
from driver.serializers import DriverSerializer


# ********** Order related serializers **********
class OrderItemSerializer(serializers.ModelSerializer):
    variant = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.all(), write_only=True, required=False, allow_null=True
    )
    variant_details = ProductVariantSerializer(source='variant', read_only=True)
    assigned_vendor = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, required=False, allow_null=True
    )
    assigned_vendor_details = UserSerializer(source='assigned_vendor', read_only=True)
    product = serializers.SerializerMethodField(read_only=True)  # Nested serializer for product details
    driver_for_me_url = serializers.CharField(source='order.driver_for_me_url', read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id', 'order', 'product', 'variant', 'variant_details', 'quantity', 'price', 
            'order_status', 'payment_status', 'vendor_payment_status', 'driver_for_me_url',
            'mechanic', 'mechanic_fees_for_customer', 'mechanic_fees_for_mechanic',
            'mechanic_otp', 'installation_required', 'assigned_vendor', 'assigned_vendor_details',
            'created_at', 'last_modified_at', 'is_active'
        ]

    def get_product(self, obj):
        """
        Retrieve the product details associated with the variant.
        """
        product = obj.variant.product  # Access the product from the variant
        return ProductWithoutVariantSerializer(product).data
    

class OrderSerializer(serializers.ModelSerializer):
    # Custom field to include all order items related to the order using the related_name 'order_items'
    order_items = OrderItemSerializer(many=True, read_only=True)
    
    # Configure customer to accept ID or provide nested user details in the response
    customer = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, required=False
    )
    customer_details = UserSerializer(source='customer', read_only=True)
    
    # Configure shipping_address to accept ID or provide nested address details in the response
    shipping_address = serializers.PrimaryKeyRelatedField(
        queryset=ShippingAddress.objects.all(), write_only=True, required=False
    )
    shipping_address_details = ShippingAddressSerializer(source='shipping_address', read_only=True)
    
    # Configure billing_address to accept ID or provide nested address details in the response
    billing_address = serializers.PrimaryKeyRelatedField(
        queryset=BillingAddress.objects.all(), write_only=True, required=False, allow_null=True
    )
    billing_address_details = BillingAddressSerializer(source='billing_address', read_only=True)
    
    order_code = serializers.CharField(read_only=True)  # Add order_code field
    
    driver_details = serializers.PrimaryKeyRelatedField(
        queryset=Driver.objects.all(), write_only=True, required=False, allow_null=True
    )
    driver_details_data = DriverSerializer(source='driver_details', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'customer_details', 
            'shipping_address', 'shipping_address_details', 
            'billing_address', 'billing_address_details',
            'total_price', 'payment_method', 'payment_status',
            'delivery_charge', 'driver_fees', 'driver_otp', 'driver_details',
            'provider_order_id', 'payment_id', 'signature_id', 'is_successful',
            'driver_details_data', 'order_code', 'order_items', 'driver_for_me_url',
            'created_at', 'last_modified_at', 'is_active'
        ]

    def create(self, validated_data):
        # 'order_items' is not part of validated_data, so don't pop it here.
        order = Order.objects.create(**validated_data)
        return order


# class VendorRequestLogSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = VendorRequestLog
#         fields = [
#             'id', 'order_item', 'vendor', 'price', 'distance',
#             'is_accpeted', 'created_at', 'last_modified_at', 'is_active',
#         ]
#         read_only_fields = ['id', 'created_at', 'last_modified_at', 'is_active']
# ***** =====  END  ===== *****