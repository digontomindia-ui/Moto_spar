# Standard Library Imports
import base64
from collections import defaultdict
from datetime import date, datetime, timedelta
from itertools import groupby
import io
import json
import tempfile
import uuid
import requests
from PIL import Image as PILImage

# Third-party Imports
from django.conf import settings
from django.contrib.auth import login, logout, authenticate
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db import transaction
from django.db.models import Count, F, Q
from django.db.models.functions import TruncDate
from django.db.utils import IntegrityError
from django.http import JsonResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, permissions, status
from rest_framework.decorators import (
    api_view, authentication_classes, permission_classes
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_rest_passwordreset.views import ResetPasswordRequestToken, ResetPasswordConfirm
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.authentication import JWTAuthentication

# Local Imports
from app.permissions import (
    IsCustomer, IsVendor, IsAdminUser
    )
from app.messages import (
    DEFAULT_ERROR_MESSAGE, INVALID_METHOD_MESSAGE, INTERNAL_SERVER_ERROR_MESSAGE,
    CATEGORY_NOT_FOUND_MESSAGE, SUBCATEGORY_NOT_FOUND_MESSAGE, PRODUCT_NOT_FOUND_MESSAGE,
    LIMIT_OFFSET_MESSAGE, PAGINATED_PRODUCTS_MESSAGE, WISHLIST_NOT_FOUND_MESSAGE
    )
from .models import Wishlist, WishlistItem
from product.models import ProductVariant
from .serializers import WishlistItemSerializer


# Create your views here.


# ! Only account_type = "customer" can add edit view wishlist
# ***** To add / edit / view / delete categories by admin *****
# ? This will add a variant to customer's wishlist
# ? or remove an already added variant
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCustomer])
def toggle_in_wishlist_item(request, variant_id):
    try:
        # Check if the variant exists
        try:
            variant = ProductVariant.objects.get(id=variant_id)
        except ProductVariant.DoesNotExist:
            response_data = {
                'data': {
                    'details': PRODUCT_NOT_FOUND_MESSAGE, 
                    'status': 'error', 
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': PRODUCT_NOT_FOUND_MESSAGE,
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)
        
        # Get the user's wishlist
        try:
            wishlist = Wishlist.objects.get(user=request.user)
        except Wishlist.DoesNotExist:
            response_data = {
                'data': {
                    'details': WISHLIST_NOT_FOUND_MESSAGE,
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': WISHLIST_NOT_FOUND_MESSAGE,
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)
        
        # Check if the variant is already in the user's wishlist
        try:
            wishlist_item = WishlistItem.objects.get(wishlist=wishlist, variant=variant)
            # If it exists, delete the item from the wishlist
            wishlist_item.delete()

            response_data = {
                'data': {
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'Wishlist item removed successfully',
                'status': True
            }
            return JsonResponse(response_data, status=status.HTTP_200_OK)
        
        except WishlistItem.DoesNotExist:
            # If it doesn't exist, add the variant to the wishlist
            wishlist_item = WishlistItem.objects.create(wishlist=wishlist, variant=variant)

            serializer = WishlistItemSerializer(wishlist_item)
            response_data = {
                'data': {
                    'wishlist_item': serializer.data,
                    'status': 'success',
                    'code': status.HTTP_201_CREATED
                },
                'message': 'Wishlist item added successfully',
                'status': True
            }
            return JsonResponse(response_data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        # Handle any uncaught exceptions uniformly
        response_data = {
            'data': {
                'details': str(e),
                "status": "error",
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR
            },
            'message': INTERNAL_SERVER_ERROR_MESSAGE,
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ? This will return all wishlist_items for logged-in user
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
def view_user_wishlist_items(request):
    try:
        if request.method == 'POST':
            # Get paginated wishlist items based on limit and offset
            limit = int(request.data.get('limit', 10))  # Default limit is 10
            offset = int(request.data.get('offset', 0))  # Default offset is 0
            
            # Ensure limit and offset are non-negative
            if limit < 0 or offset < 0:
                response_data = {
                    'data': {
                        'details': LIMIT_OFFSET_MESSAGE,
                        'status': 'error',
                        'code': status.HTTP_500_INTERNAL_SERVER_ERROR
                    },
                    'message': INTERNAL_SERVER_ERROR_MESSAGE,
                    'status': False
                }
                return JsonResponse(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Get the user's wishlist
            try:
                wishlist = Wishlist.objects.get(user=request.user)
            except Wishlist.DoesNotExist:
                response_data = {
                    'data': {
                        'details': WISHLIST_NOT_FOUND_MESSAGE,
                        'status': 'error',
                        'code': status.HTTP_404_NOT_FOUND
                    },
                    'message': WISHLIST_NOT_FOUND_MESSAGE,
                    'status': False
                }
                return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)
            
            # Retrieve wishlist items with pagination
            wishlist_items = WishlistItem.objects.filter(wishlist=wishlist).order_by('-created_at')
            
            # Slice the queryset using limit and offset
            paginated_data = list(wishlist_items[offset:offset + limit])

            # Pass the paginated_data into associated serializer
            serializer = WishlistItemSerializer(paginated_data, context={'request': request}, many=True)

            # Get the total number of items
            total_items = wishlist_items.count()

            # Calculate page_count and current_page
            if limit > 0:
                page_count = (total_items + limit - 1) // limit  # Round up the division
                current_page = (offset // limit) + 1  # Determine the current page
            else:
                page_count = 0
                current_page = 0

            # Check if there's a next page
            has_next = (offset + limit) < total_items

            response_data = {
                'data': {
                    'wishlist_items': serializer.data,
                    'total_count': total_items,
                    'page_count': page_count,
                    'current_page': current_page,
                    'limit': limit,
                    'offset': offset,
                    'has_next': has_next,
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'Paginated wishlist items fetched successfully',
                'status': True
            }
            return JsonResponse(response_data, status=status.HTTP_200_OK)

        else:
            response_data = {
                'data': {
                    "status": "error",
                    'code': status.HTTP_400_BAD_REQUEST,
                },
                'message': INVALID_METHOD_MESSAGE,
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        # Handle any uncaught exceptions uniformly
        response_data = {
            'data': {
                'details': str(e),
                "status": "error",
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR
            },
            'message': INTERNAL_SERVER_ERROR_MESSAGE,
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ***** =====  END  ===== ******