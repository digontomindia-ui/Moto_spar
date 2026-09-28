# Standard Library Imports
import base64
import json
import os
import re
import subprocess
from decimal import Decimal  # Ensure this import is at the top of the serializers file if not already present

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
from app.models import User
from .models import (
    Category, SubCategory, Product, ProductVariant, ProductImage, 
    ProductRequest, ProductRequestImage, ProductCompatibility
)
from vendor.models import VendorStock
from wishlist.models import WishlistItem


# ********** Product related serializers **********
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'image',
                    'created_at', 'last_modified_at', 'is_active']
    
    def to_representation(self, instance):
        # Capitalize the first letter of each word
        representation = super().to_representation(instance)
        representation['name'] = representation['name'].title()
        return representation

    def update(self, instance, validated_data):
        # Ensure the name is saved in lowercase and without special characters
        if 'name' in validated_data:
            name = validated_data['name']
            name = re.sub(r'[^a-zA-Z0-9\s]', ' ', name).lower()
            name = re.sub(r'\s+', ' ', name).strip()
            validated_data['name'] = name
        return super().update(instance, validated_data)

    def create(self, validated_data):
        # Ensure the name is saved in lowercase and without special characters
        if 'name' in validated_data:
            name = validated_data['name']
            name = re.sub(r'[^a-zA-Z0-9\s]', ' ', name).lower()
            name = re.sub(r'\s+', ' ', name).strip()
            validated_data['name'] = name
        return super().create(validated_data)


class SubCategorySerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)  # Nested serializer for category
    category_id = serializers.UUIDField(write_only=True)  # Allow passing the category ID in write operations

    class Meta:
        model = SubCategory
        fields = ['id', 'category', 'category_id', 'name', 'description', 'image',
                    'created_at', 'last_modified_at', 'is_active']
    
    def to_representation(self, instance):
        # Convert the name to lowercase in the response
        representation = super().to_representation(instance)
        representation['name'] = representation['name'].lower()
        return representation

    def create(self, validated_data):
        # Ensure the name is saved in lowercase and without special characters
        if 'name' in validated_data:
            name = validated_data['name']
            name = re.sub(r'[^a-zA-Z0-9\s]', ' ', name).lower()
            name = re.sub(r'\s+', ' ', name).strip()
            validated_data['name'] = name
        category_id = validated_data.pop('category_id')  # Remove 'category_id' from validated_data
        category = Category.objects.get(id=category_id)
        
        # Create the SubCategory without passing 'name' and 'category_id' again
        subcategory = SubCategory.objects.create(category=category, **validated_data)
        return subcategory

    def update(self, instance, validated_data):
        # Ensure the name is saved in lowercase and without special characters and the category is updated if provided
        if 'name' in validated_data:
            name = validated_data['name']
            name = re.sub(r'[^a-zA-Z0-9\s]', ' ', name).lower()
            name = re.sub(r'\s+', ' ', name).strip()
            validated_data['name'] = name
        instance.name = name
        if 'category_id' in validated_data:
            category_id = validated_data.pop('category_id')
            instance.category = Category.objects.get(id=category_id)
        return super().update(instance, validated_data)


class ProductImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductImage
        fields = ['id', 'variant', 'image', 'caption', 
                    'created_at', 'last_modified_at', 'is_active']
        read_only_fields = ['id', 'created_at', 'last_modified_at', 'is_active']


class ProductVariantSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()  # Field for variant images
    quantity_in_stock = serializers.SerializerMethodField()  # Field for calculating quantity in stock
    wishlist = serializers.SerializerMethodField()  # Add wishlist field
    discounted_price = serializers.SerializerMethodField()  # New field for discounted price

    class Meta:
        model = ProductVariant
        fields = ['id', 'product', 
                    # 'price', 
                    'listing_price_for_vendor', 'cost_to_vendor', 'motospar_commission_from_vendor',
                    'markup_in_prices', 'final_listing_price_on_motospar', 'final_profit_per_part',
                    'discount', 'in_stock', 'sold_quantity', 
                    'sku', 'color', 'size', 'weight', 'dimensions', 'material', 
                    'sku', 'color', 'size', 'weight', 'dimensions', 'material', 
                    'features', 'images', 'quantity_in_stock', 'wishlist', 'discounted_price',
                    'price_excluding_gst', 'cgst', 'sgst',
                    'created_at', 'last_modified_at', 'is_active']

    def get_images(self, obj):
        """
        Retrieve the images associated with the variant.
        """
        images = obj.images.filter(is_active=True)  # Filter active images
        return ProductImageSerializer(images, many=True).data

    def get_quantity_in_stock(self, obj):
        """
        Calculate the total quantity in stock for the variant by summing up the stock_quantity
        from the VendorStock model where in_stock and is_active are True.
        """
        total_stock = VendorStock.objects.filter(
            variant=obj, 
            in_stock=True, 
            is_active=True
        ).aggregate(total_stock=Sum('stock_quantity'))['total_stock']
        
        return total_stock if total_stock is not None else 0

    def get_wishlist(self, obj):
        """
        Check if the current user has added the variant to their wishlist.
        """
        request = self.context.get('request', None)
        if request and request.user.is_authenticated:
            # Check if the variant is in the user's wishlist
            return WishlistItem.objects.filter(
                wishlist__user=request.user, 
                variant=obj, 
                is_active=True
            ).exists()
        return False

    def get_discounted_price(self, obj):
        """
        Calculate the price after applying the discount, if applicable.
        """
        # Use final_listing_price_on_motospar as the base price since listing_price_for_vendor is not provided in the request
        base_price = obj.final_listing_price_on_motospar or Decimal('0')
        if obj.discount and obj.discount > 0:
            # Ensure discount_factor is a Decimal to match base_price type
            discount_factor = Decimal('100') - obj.discount
            discount_factor = discount_factor / Decimal('100')
            discounted_price = base_price * discount_factor
            return round(float(discounted_price), 2)
        return float(base_price)


class ProductCompatibilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCompatibility
        fields = ['id', 'product', 'make', 'model', 'year_from', 'year_to', 'engine_variant']
        read_only_fields = ['id']


class ProductSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), source='category', write_only=True)
    sub_category_id = serializers.PrimaryKeyRelatedField(queryset=SubCategory.objects.all(), source='sub_category', write_only=True)
    category = CategorySerializer(read_only=True)  # Read-only field for nested representation
    sub_category = SubCategorySerializer(read_only=True)  # Read-only field for nested representation
    created_by = serializers.SerializerMethodField()  # Add a field for created_by
    average_rating = serializers.SerializerMethodField()  # Add a field for average rating
    variants = serializers.SerializerMethodField()  # Nested serializer for variants
    compatibilities = ProductCompatibilitySerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'category', 'category_id', 'sub_category', 'sub_category_id',
            'job_type', 'code', 'description', 'rating', 'average_rating', 
            'brand', 'model', 'year', 'requires_fitment', 'compatibilities', 'variants',
            'is_gst_applicable', 'gst_rate',
            'delivery_charge', 'delivery_time', 'driver_fees', 'mechanic_fees',
            'created_by', 'created_at', 'last_modified_at', 'is_active'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'last_modified_at', 'is_active']

    def get_created_by(self, obj):
        """
        Retrieve the user who created the product.
        """
        return obj.created_by.get_full_name()

    # ? This will return the all the variants associsted with this product
    def get_variants(self, obj):
        """
        Retrieve the variants associated with the product.
        """
        variants = obj.variants.filter(is_active=True)  # Filter active variants
        return ProductVariantSerializer(variants, many=True, context=self.context).data
    
    def get_average_rating(self, obj):
        """
        Calculate the average rating of the product from the Review table.
        """
        # Access the reviews related to this product (obj) and filter active reviews
        reviews = obj.reviews.filter(is_active=True)  # This queries the Review table
        
        # Calculate the average rating from the filtered reviews
        average_rating = reviews.aggregate(Avg('rating'))['rating__avg']  # Get average rating
        
        if average_rating is not None:
            # Round the average rating to 1 decimal place
            return round(average_rating, 1)
        return 0.0  # Return None if there are no active reviews
# ***** =====  END  ===== *****


# ********** Custom serializers required for other modules **********
class ProductWithoutVariantSerializer(serializers.ModelSerializer):
    category = CategorySerializer()  # Nested serializer for category
    sub_category = SubCategorySerializer()  # Nested serializer for sub_category
    average_rating = serializers.SerializerMethodField()  # Add a field for average rating

    class Meta:
        model = Product
        fields = [
            'id', 'name', 
            'category', 'sub_category', 'job_type',
            'code', 'description', 'average_rating', 
            'brand', 'model', 'year',
            'is_gst_applicable', 'gst_rate',
            'delivery_charge', 'delivery_time', 'driver_fees', 'mechanic_fees',
            'created_at', 'last_modified_at', 'is_active'
        ]
        read_only_fields = ['id', 'created_at', 'last_modified_at', 'is_active']

    def get_average_rating(self, obj):
        """
        Calculate the average rating of the product from the Review table.
        """
        # Access the reviews related to this product (obj) and filter active reviews
        reviews = obj.reviews.filter(is_active=True)  # This queries the Review table
        
        # Calculate the average rating from the filtered reviews
        average_rating = reviews.aggregate(Avg('rating'))['rating__avg']  # Get average rating
        
        if average_rating is not None:
            # Round the average rating to 1 decimal place
            return round(average_rating, 1)
        return 0.0  # Return None if there are no active reviews
# ***** =====  END  ===== *****


# ********** Product Request related serializers **********
class ProductRequestImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductRequestImage
        fields = ['id', 'productrequest', 'image',
                    'created_at', 'last_modified_at', 'is_active']


class ProductRequestSerializer(serializers.ModelSerializer):
    images = ProductRequestImageSerializer(many=True, read_only=True)
    vendor = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    sub_category = serializers.PrimaryKeyRelatedField(queryset=SubCategory.objects.all())
    
    class Meta:
        model = ProductRequest
        fields = [
            'id', 'vendor', 'category', 'sub_category', 'name', 'description', 
            'requested_at', 'status', 'brand', 'model', 'year', 'price', 'discount', 
            'color', 'size', 'weight', 'dimensions', 'material', 'features',
            'created_at', 'last_modified_at', 'is_active', 'images'
        ]
        read_only_fields = ['requested_at', 'created_at', 'last_modified_at']

    def to_representation(self, instance):
        """Custom representation for nested fields."""
        representation = super().to_representation(instance)

        # * Import the UserSerializer lazily to avoid circular imports
        from app.serializers import UserSerializer
        
        representation['vendor'] = UserSerializer(instance.vendor).data
        representation['category'] = CategorySerializer(instance.category).data
        representation['sub_category'] = SubCategorySerializer(instance.sub_category).data
        return representation

    def create(self, validated_data):
        vendor = validated_data.pop('vendor')
        category = validated_data.pop('category')
        sub_category = validated_data.pop('sub_category')

        # Create ProductRequest instance
        product_request = ProductRequest.objects.create(
            vendor=vendor,  # Already passed as an object by the serializer
            category=category,
            sub_category=sub_category,
            **validated_data
        )
        return product_request
# ***** =====  END  ===== *****
