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
    LIMIT_OFFSET_MESSAGE, PAGINATED_PRODUCTS_MESSAGE, WISHLIST_NOT_FOUND_MESSAGE, CART_ITEM_NOT_FOUND_MESSAGE
    )
from .models import Cart, CartItem
from product.models import Product
from .serializers import CartItemSerializer


# Create your views here.


# ! Only account_type = "customer" can add edit view Cart
# ***** To add / edit / view / delete Items in cart by customer *****
# ? This will add a product to customer's with quantity
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
def add_cart_item(request):
    try:
        if request.method == 'POST':
            user = request.user
            # Get or create the user's cart
            cart, _ = Cart.objects.get_or_create(user=user, is_active=True)
            
            # Deserialize the request data
            data = request.data.copy()  # Make a copy of the request data
            data['cart'] = cart.id  # Inject the cart ID for serializer validation

            # Deserialize the request data
            serializer = CartItemSerializer(data=data)
            
            # Validate and save the cart item
            if serializer.is_valid():
                # Extract necessary fields from the deserialized data
                variant = serializer.validated_data.get('variant')
                quantity = serializer.validated_data.get('quantity')
                price_at_addition = serializer.validated_data.get('price_at_addition')

                # Check if the variant already exists in the user's cart
                try:
                    # Attempt to retrieve the existing CartItem
                    existing_cart_item = CartItem.objects.get(cart=cart, variant=variant, is_active=True)
                    # Update the quantity and price_at_addition
                    existing_cart_item.quantity += quantity
                    existing_cart_item.price_at_addition = round(price_at_addition,2)
                    existing_cart_item.save()

                    # Serialize the updated CartItem
                    updated_serializer = CartItemSerializer(existing_cart_item)
                    
                    response_data = {
                        'data': {
                            'cart_item': updated_serializer.data,
                            'status': 'success',
                            'code': status.HTTP_200_OK
                        },
                        'message': 'Cart item updated successfully',
                        'status': True
                    }
                    return JsonResponse(response_data, status=status.HTTP_200_OK)
                except CartItem.DoesNotExist:
                    # If the CartItem does not exist, create a new one
                    # Perform any additional validation if necessary (e.g., checking if the cart exists)
                    serializer.save(is_active=True)  # Calls the create method of the serializer
                    response_data = {
                        'data': {
                            'cart_item': serializer.data,
                            'status': 'success',
                            'code': status.HTTP_201_CREATED
                        },
                        'message': 'Cart item added successfully',
                        'status': True
                    }
                    return JsonResponse(response_data, status=status.HTTP_201_CREATED)
            else:
                # Handling validation errors
                error_messages = [f'{field}: {", ".join(messages)}' for field, messages in serializer.errors.items()]
                formatted_message = ', '.join(error_messages)
                response_data = {
                    'data': {
                        'details': formatted_message,
                        'status': 'error',
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': 'Invalid data',
                    'status': False
                }
                return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)
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


# ? This will for edit cart item quantity
@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsCustomer])
def edit_cart_item(request, cart_item_id):
    try:
        if request.method == 'PATCH':
            # Try to get the cart item by ID
            try:
                cart_item = CartItem.objects.get(id=cart_item_id, is_active=True)
            except CartItem.DoesNotExist:
                response_data = {
                    'data': {
                        'details': CART_ITEM_NOT_FOUND_MESSAGE,
                        'status': 'error',
                        'code': status.HTTP_404_NOT_FOUND
                    },
                    'message': CART_ITEM_NOT_FOUND_MESSAGE,
                    'status': False
                }
                return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

            # Deserialize the request data with partial updates
            serializer = CartItemSerializer(cart_item, data=request.data, partial=True)

            # Validate and save the updated cart item
            if serializer.is_valid():
                serializer.save()
                response_data = {
                    'data': {
                        'cart_item': serializer.data,
                        'status': 'success',
                        'code': status.HTTP_200_OK
                    },
                    'message': 'Cart item updated successfully',
                    'status': True
                }
                return JsonResponse(response_data, status=status.HTTP_200_OK)
            else:
                # Handling validation errors
                error_messages = [f'{field}: {", ".join(messages)}' for field, messages in serializer.errors.items()]
                formatted_message = ', '.join(error_messages)
                response_data = {
                    'data': {
                        'details': formatted_message,
                        'status': 'error',
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': 'Invalid data',
                    'status': False
                }
                return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)
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


# ? This is for viewing cart item by the user
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCustomer])
def view_cart_item(request):
    try:
        if request.method == 'GET':
            # Retrieve all active cart items for the authenticated user
            # cart_items = CartItem.objects.filter(cart__user=request.user, is_active=True).values('id', 'cart', 'product', 'quantity', 'price_at_addition', 'created_at', 'last_modified_at', 'is_active')
            cart_items = CartItem.objects.filter(cart__user=request.user, is_active=True).order_by('-created_at')
            serializer = CartItemSerializer(cart_items, many=True)
            response_data = {
                'data': {
                    'cart_item': serializer.data,
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'Cart items fetched successfully',
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


# ? To delete a particular cart item
@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsCustomer])
def delete_cart_item(request, cart_item_id):
    try:
        if request.method == 'DELETE':
            # Try to get the cart item by ID
            try:
                cart_item = CartItem.objects.get(id=cart_item_id, is_active=True)
            except CartItem.DoesNotExist:
                response_data = {
                    'data': {
                        'details': CART_ITEM_NOT_FOUND_MESSAGE,
                        'status': 'error',
                        'code': status.HTTP_404_NOT_FOUND
                    },
                    'message': CART_ITEM_NOT_FOUND_MESSAGE,
                    'status': False
                }
                return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

            # delete the cart item
            cart_item.delete()

            response_data = {
                'data': {
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'Cart item deleted successfully',
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