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
from .models import ShippingAddress, BillingAddress


# ********** Shipping related serializers **********
class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = ['id', 'user', 'name', 'email', 'address_type', 'street_address', 
                    'city', 'state', 'postal_code', 'country', 
                    'phone_number', 'alternate_phone_number', 'latitude', 'longitude', 
                    'created_at', 'last_modified_at', 'is_active'
                    ]


class BillingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillingAddress
        fields = ['id', 'user', 'name', 'email', 'address_type', 'street_address', 
                    'city', 'state', 'postal_code', 'country', 
                    'phone_number', 'alternate_phone_number', 
                    'created_at', 'last_modified_at', 'is_active'
                    ]
# ***** =====  END  ===== *****