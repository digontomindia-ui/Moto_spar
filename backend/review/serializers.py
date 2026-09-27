# Standard Library Imports
import base64
import json
import os
import re
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
# * Models
from .models import (
    Review, ReviewImage
)



# ********** Review related serializers **********
class ReviewImageSerializer(serializers.ModelSerializer):
    """
    Serializer for the ReviewImage model to handle images associated with a review.
    """
    class Meta:
        model = ReviewImage
        fields = ['id', 'image', 'caption', 'created_at', 'is_active']

class ReviewSerializer(serializers.ModelSerializer):
    """
    Serializer for the Review model to include all review details along with user full name and associated images.
    """
    images = ReviewImageSerializer(many=True, read_only=True)  # Nested serializer for related images
    user_full_name = serializers.SerializerMethodField()  # Custom field to fetch user's full name

    class Meta:
        model = Review
        fields = [
            'id', 'product', 'user', 'user_full_name',  # Adding user full name field
            'title', 'body', 'rating', 
            'created_at', 'last_modified_at', 'is_active', 
            'images'  # Adding nested images
        ]
    
    def get_user_full_name(self, obj):
        """
        Fetch full name of the user associated with the review.
        """
        return obj.user.get_full_name()
# ***** =====  END  ===== *****