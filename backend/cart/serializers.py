# Standard Library Imports
import base64
import json
import os
import subprocess
from decimal import Decimal

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
from product.pricing import available_stock_for_variant, customer_sale_price


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

    def validate(self, attrs):
        variant = attrs.get('variant') or getattr(self.instance, 'variant', None)
        if variant is None:
            return attrs
        if self.instance:
            if 'cart' in attrs and attrs['cart'] != self.instance.cart:
                raise serializers.ValidationError({'cart': 'The cart cannot be changed.'})
            if 'variant' in attrs and attrs['variant'] != self.instance.variant:
                raise serializers.ValidationError({'variant': 'The part cannot be changed.'})
        if not variant.is_active or not variant.product.is_active:
            raise serializers.ValidationError({
                'variant': 'This part is unavailable and cannot be added to the cart.'
            })
        sale_price = customer_sale_price(variant)
        if sale_price is None:
            raise serializers.ValidationError({
                'variant': 'This part has an invalid price and cannot be added to the cart.'
            })
        quantity = attrs.get('quantity', getattr(self.instance, 'quantity', None))
        if quantity is None or quantity < 1:
            raise serializers.ValidationError({'quantity': 'Quantity must be at least one.'})
        if not variant.in_stock or quantity > available_stock_for_variant(variant):
            raise serializers.ValidationError({'quantity': 'This quantity is not available in live vendor stock.'})

        product = variant.product
        requested_mechanic_fee = attrs.get(
            'mechanic_fees', getattr(self.instance, 'mechanic_fees', Decimal('0'))
        )
        if requested_mechanic_fee not in (Decimal('0'), product.mechanic_fees):
            raise serializers.ValidationError({'mechanic_fees': 'Invalid installation fee.'})

        attrs['price_at_addition'] = sale_price
        attrs['delivery_charge'] = product.delivery_charge
        attrs['driver_fees'] = product.driver_fees
        attrs['mechanic_fees'] = requested_mechanic_fee
        return attrs

    def get_product(self, obj):
        """
        Retrieve the product details associated with the variant.
        """
        product = obj.variant.product  # Access the product from the variant
        return ProductWithoutVariantSerializer(product).data
# ***** =====  END  ===== *****
