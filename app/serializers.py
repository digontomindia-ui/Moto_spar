# app/serializers.py

# Django Imports
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

# Third-party Imports
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Local Imports
# * Models
from .models import User
from wishlist.models import Wishlist, WishlistItem
from cart.models import Cart, CartItem
from vendor.models import VendorProfile
from mechanic.models import MechanicProfile

# * Serializers
from wishlist.serializers import WishlistItemSerializer
from cart.serializers import CartItemSerializer
from vendor.serializers import VendorProfileSerializer
from mechanic.serializers import MechanicProfileSerializer


# ********** Authentication and User Table related serializers **********
# ! For Generating New TOKEN
# ? REF: https://medium.com/django-rest/django-rest-framework-jwt-authentication-94bee36f2af8
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    
    def validate(self, attrs):
        email = attrs.get("email", None)
        password = attrs.get("password", None)
        if email is None or password is None:
            raise serializers.ValidationError(
                "Both email and password are required to log in."
            )

        user = authenticate(username=email, password=password)

        if user is None:
            raise serializers.ValidationError(
                "No user with the given email and password found."
            )
        
        if not user.is_active:
            raise serializers.ValidationError(
                "User account is disabled."
            )

        refresh = self.get_token(user)

        return {
            "email": email,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
    

# ! Serializer For User Model for Registration
class RegistrationSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    full_name = serializers.SerializerMethodField()
    confirm_password = serializers.CharField(write_only=True)
    
    country_code = serializers.CharField(required=False, allow_blank=True)  # Make country_code optional
    phone_number = serializers.CharField(required=False, allow_blank=True)  # Make phone_number optional
    
    account_type = serializers.ChoiceField(
        choices=User.USER_TYPE_CHOICES, required=True
        )

    wishlist_items = serializers.SerializerMethodField()
    cart_items = serializers.SerializerMethodField()
    vendor_profile = serializers.SerializerMethodField()
    mechanic_profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields =[
            'id', 'email', 'password', 'confirm_password', 'first_name', 'last_name', 'full_name',
            'country_code', 'phone_number', 'profile_picture', 'bio', 'date_of_birth', 'address', 
            'postal_code', 'state', 'country', 'city', 'device_token', 'is_voice_alert', 'is_push_notification',
            'account_type', 'date_joined', 'is_verified', 'is_active', 
            'wishlist_items', 'cart_items', 'vendor_profile', 'mechanic_profile'
            ]
        extra_kwargs = {
            'password': {'write_only': True}, 
            'id': {'read_only': True}, 
            'date_joined': {'read_only': True},
            'is_verified': {'read_only': True},
            'is_active': {'read_only': True},
            'country_code': {'required': False, 'allow_blank': True},  # Optional country_code
            'phone_number': {'required': False, 'allow_blank': True},  # Optional phone_number
        }
        
    def validate(self, data):
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        email = data.get('email')
        if email:
            data['email'] = email.strip().lower()
        phone = data.get('phone_number')
        code = data.get('country_code')

        if not all([password, confirm_password, email]):
            raise serializers.ValidationError({"required_fields": "Email, password, and confirm password are required"})

        if password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})

        # Check for unique email using static method
        if User.is_email_registered(email):
            raise serializers.ValidationError({"email": "Email is already registered"})

        # Check for unique phone number using static method
        if phone and code and User.is_phone_registered(phone, code):
            raise serializers.ValidationError({"phone_number": "Phone number already registered with this country code"})

        data['email'] = email.strip().lower()  # Normalize email
        return data
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('confirm_password', None)
        email = validated_data.pop('email')
        validated_data['username'] = email.strip().lower()

        user = User(**validated_data)
        user.email = email.strip().lower()
        user.set_password(password)

        user.save()
        return user

    def get_full_name(self, obj):
        return obj.get_full_name() if obj.get_full_name() else None

    def get_wishlist_items(self, obj):
        if obj.account_type == 'customer':
            wishlist = Wishlist.objects.filter(user=obj).first()  # Get the wishlist
            if wishlist:
                wishlist_items = WishlistItem.objects.filter(wishlist=wishlist)  # Get the items in the wishlist
                return WishlistItemSerializer(wishlist_items, many=True).data  # Pass the wishlist items to the serializer
        return None

    def get_cart_items(self, obj):
        if obj.account_type == 'customer':
            cart = Cart.objects.filter(user=obj).first()  # Get the cart
            if cart:
                cart_items = CartItem.objects.filter(cart=cart)  # Get the items in the cart
                return CartItemSerializer(cart_items, many=True).data  # Pass the cart items to the serializer
        return None
    
    def get_vendor_profile(self, obj):
        if obj.account_type == 'vendor':
            vendor_profile = VendorProfile.objects.filter(user=obj).first()
            if vendor_profile:
                return VendorProfileSerializer(vendor_profile).data
        return None
    
    def get_mechanic_profile(self, obj):
        if obj.account_type == 'mechanic':
            mechanic_profile = MechanicProfile.objects.filter(user=obj).first()
            if mechanic_profile:
                return MechanicProfileSerializer(mechanic_profile).data
        return None


# ! To Change Password if the user remember his password
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)

    def validate(self, data):
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')

        if new_password != confirm_password:
            raise serializers.ValidationError("The new passwords do not match.")

        # Validate password strength
        try:
            validate_password(new_password)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
        
        return data


# ! Serializer for User Profile
class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()  # Use SerializerMethodField for custom representation
    wishlist_items = serializers.SerializerMethodField()
    cart_items = serializers.SerializerMethodField()
    vendor_profile = serializers.SerializerMethodField()
    mechanic_profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [ 
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'country_code', 'phone_number', 'profile_picture', 'bio', 'date_of_birth', 'address', 
            'postal_code', 'state', 'country', 'city', 'device_token', 'is_voice_alert', 'is_push_notification',
            'account_type', 'date_joined', 'is_verified', 'is_active', 
            'wishlist_items', 'cart_items', 'vendor_profile', 'mechanic_profile'
            ]

        read_only_fields = ['id', 'is_active', 'date_joined']  # Mark fields as read-only
    
    def get_full_name(self, obj):
        return obj.get_full_name() if obj.get_full_name() else None

    def get_wishlist_items(self, obj):
        if obj.account_type == 'customer':
            wishlist = Wishlist.objects.filter(user=obj).first()  # Get the wishlist
            if wishlist:
                wishlist_items = WishlistItem.objects.filter(wishlist=wishlist)  # Get the items in the wishlist
                return WishlistItemSerializer(wishlist_items, many=True).data  # Pass the wishlist items to the serializer
        return None
    
    def get_cart_items(self, obj):
        if obj.account_type == 'customer':
            cart = Cart.objects.filter(user=obj).first()  # Get the cart
            if cart:
                cart_items = CartItem.objects.filter(cart=cart)  # Get the items in the cart
                return CartItemSerializer(cart_items, many=True).data  # Pass the cart items to the serializer
        return None

    def get_vendor_profile(self, obj):
        if obj.account_type == 'vendor':
            vendor_profile = VendorProfile.objects.filter(user=obj).first()
            if vendor_profile:
                return VendorProfileSerializer(vendor_profile).data
        return None
    
    def get_mechanic_profile(self, obj):
        if obj.account_type == 'mechanic':
            mechanic_profile = MechanicProfile.objects.filter(user=obj).first()
            if mechanic_profile:
                return MechanicProfileSerializer(mechanic_profile).data
        return None
# ***** =====  END  ===== *****