# Django Imports
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.db.models import Avg

# Local Imports
from rest_framework import serializers
from .models import MechanicProfile, MechanicPlatformFee, MechanicJob, MechanicReportApp, MechanicJobImage


# ********** Mechanic related serializers **********
class MechanicProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)  # Include first_name from User
    last_name = serializers.CharField(source='user.last_name', read_only=True)  # Include last_name from User
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
        model = MechanicProfile
        fields = [
            'id', 'user', 'first_name', 'last_name', 'email', 'country_code', 'phone_number',
            'bio', 'date_of_birth', 'address', 'postal_code', 'state', 'country', 'account_type',
            'expertise', 'years_of_experience', 'certifications', 'contact_phone', 'contact_email',
            'base_address', 'base_city', 'base_state', 'base_country', 'base_postal_code',
            'latitude', 'longitude', 'is_available', 'working_hours', 'bank_account_number',
            'bank_name', 'ifsc_code', 'specialization', 'service_types', 'uploaded_documents', 
            'uploaded_documents_type', 'referral_code',   
            'total_top_up', 'top_up_balance',
            'is_verified', 'created_at', 'last_modified_at', 'is_active'
        ]


class MechanicPlatformFeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MechanicPlatformFee
        fields = [
            'id', 'mechanic', 'fee_amount', 'payment_status', 'provider_transaction_id',
            'payment_id', 'signature_id', 'is_successful', 'created_at', 
            'last_modified_at', 'is_active',
        ]
        read_only_fields = [
            'id', 'provider_transaction_id', 'payment_id', 'signature_id',
            'is_successful', 'created_at', 'last_modified_at', 'is_active',
        ]


class MechanicJobImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = MechanicJobImage
        fields = [
            'id', 'mechanic_job', 'image', 'uploaded_at', 'description',
            'created_at', 'last_modified_at', 'is_active'
        ]
        read_only_fields = [
            'id', 'created_at', 'last_modified_at', 'is_active'
        ]


class MechanicJobSerializer(serializers.ModelSerializer):
    # Fields from related User model (mechanic)
    mechanic_first_name = serializers.CharField(source='mechanic.first_name', read_only=True, allow_null=True)
    mechanic_last_name = serializers.CharField(source='mechanic.last_name', read_only=True, allow_null=True)
    mechanic_email = serializers.CharField(source='mechanic.email', read_only=True, allow_null=True)
    
    # Fields from related OrderItem model
    order_id = serializers.UUIDField(source='order_item.order.id', read_only=True)
    variant_name = serializers.CharField(source='order_item.variant.product.name', read_only=True)
    quantity = serializers.IntegerField(source='order_item.quantity', read_only=True)
    order_status = serializers.CharField(source='order_item.order_status', read_only=True)

    # Use SerializerMethodField instead of direct OrderSerializer
    order_details = serializers.SerializerMethodField()

    # Nested serializer for images (read-only)
    images = MechanicJobImageSerializer(many=True, read_only=True)

    class Meta:
        model = MechanicJob
        fields = [
            'id', 'order_item', 'mechanic', 'job_type', 'mechanic_first_name', 'mechanic_last_name', 'mechanic_email',
            'order_id', 'variant_name', 'quantity', 'order_status', 'is_accepted', 'job_status', 'payment_status',
            'mechanic_fees', 'start_date', 'completion_date', 'scheduled_date', 'payment_date',
            'notes', 'decline_reason', 'review', 'rating', 'created_at', 'last_modified_at', 'is_active',
            'order_details', 'images'
        ]

    def get_order_details(self, obj):
        # Lazy import OrderSerializer to avoid circular import
        from order.serializers import OrderSerializer
        order = obj.order_item.order
        return OrderSerializer(order, context=self.context).data        


class MechanicReportAppSerializer(serializers.ModelSerializer):

    class Meta:
        model = MechanicReportApp
        fields = [
            'id', 'mechanic', 'text_type', 'text_content',
            'created_at', 'last_modified_at', 'is_active'
        ]

        read_only_fields = [
            'id', 'created_at','last_modified_at','is_active',
        ]
# ***** =====  END  ===== *****        