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
from .models import Notification


# ********** Notification related serializers **********
class NotificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'notification_type', 'status', 
                    'redirect_url', 'priority', 'is_urgent', 'extra_data', 
                    'created_at', 'last_modified_at', 'is_active',
                    ]
        read_only_fields = ['created_at', 'last_modified_at', 'is_active']

    def validate(self, data):
        """
        Custom validation for Notification fields if necessary.
        """
        # Example: Ensure that 'message' is not empty.
        if not data.get('message'):
            raise serializers.ValidationError("Message field cannot be empty.")
        return data

    def create(self, validated_data):
        """
        Custom create method to handle any additional processing if needed during creation.
        """
        # Any custom logic on create can go here (e.g., modifying fields before saving).
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """
        Custom update method to handle any additional processing if needed during update.
        """
        # Any custom logic on update can go here (e.g., modifying fields before saving).
        return super().update(instance, validated_data)
# ***** =====  END  ===== *****