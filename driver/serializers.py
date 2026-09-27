from rest_framework import serializers
from .models import Driver
from django.utils import timezone


# ********** Driver related serializers **********
class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = [
            'id', 'first_name', 'last_name', 'email', 'phone_number', 
            'date_of_birth', 'profile_picture', 'license_number', 
            'license_type', 'license_expiry_date', 'license_status', 
            'is_available', 'employment_status', 'address_line_1', 
            'address_line_2', 'city', 'state', 'postal_code', 'country', 
            'total_deliveries', 'rating', 'emergency_contact_name', 
            'emergency_contact_phone', 'created_at', 'last_modified_at', 
            'is_active',
        ]
        read_only_fields = ['id', 'created_at', 'last_modified_at', 'is_active']

    def validate_license_expiry_date(self, value):
        """
        Ensure the license expiry date is not in the past.
        """
        if value < timezone.now().date():
            raise serializers.ValidationError("The license expiry date cannot be in the past.")
        return value

    def validate_rating(self, value):
        """
        Ensure the rating is between 1 and 5.
        """
        if value < 1.0 or value > 5.0:
            raise serializers.ValidationError("The rating must be between 1 and 5.")
        return value
# ***** =====  END  ===== *****
