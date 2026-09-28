# Standard Library Imports
import base64
from collections import defaultdict
from datetime import date, datetime, timedelta
from itertools import groupby
import io
import json
import math
import re
import tempfile
import uuid
from decimal import Decimal, InvalidOperation
import requests
from PIL import Image as PILImage

# Third-party Imports
from django.conf import settings
from django.contrib.auth import login, logout, authenticate
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db import transaction
from django.db.models import Case, Count, F, IntegerField, Prefetch, Q, Value, When
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
    LIMIT_OFFSET_MESSAGE, PAGINATED_PRODUCTS_MESSAGE
    )
from .models import (
    Category, SubCategory, Product, ProductCompatibility, ProductVariant, ProductImage,
    ProductRequest, ProductRequestImage
    )
from .serializers import (
    CategorySerializer, SubCategorySerializer, ProductImageSerializer, 
    ProductSerializer, ProductVariantSerializer, ProductRequestSerializer,
    ProductRequestImageSerializer
    )
from .utils import ( 
    notify_admin_about_product_request
    )
from .authentication import ChatbotAPIKeyAuthentication


# Create your views here.

# ! All the "view" functions can be access by all 
# ! as anyone without having an account 
# ! will able to view or search products

# ***** To add / edit / view / delete categories by admin *****
# ! Only ADMIN can add / edit / delete categories
# ! but anyone without token can view categories
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def add_category(request):
    try:
        if request.method == 'POST':
            # Deserialize the request data
            serializer = CategorySerializer(data=request.data)
            
            # Validate and save the category
            if serializer.is_valid():
                serializer.save(is_active=True)  # Calls the create method of the serializer
                response_data = {
                    'data': {
                        'category': serializer.data,
                        'status': 'success',
                        'code': status.HTTP_201_CREATED
                    },
                    'message': 'Category added successfully',
                    'status': True
                }
                return JsonResponse(response_data, status=status.HTTP_201_CREATED)
            else:
                # Handling validation errors
                error_messages = []
                for field, messages in serializer.errors.items():
                    error_messages.append(f'{field}: {", ".join(messages)}')
                formatted_message = ', '.join(error_messages)
                # Issue an error response
                response_data = {
                    'data': {
                        'details': formatted_message,
                        'status': 'error',
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': DEFAULT_ERROR_MESSAGE,
                    'status': False
                }
                return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Issue an error response
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


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdminUser])
def edit_category(request, category_id):
    try:
        if request.method == 'PATCH':
            # Try to get the category by ID
            try:
                category = Category.objects.get(id=category_id)
            except Category.DoesNotExist:
                response_data = {
                    'data': {
                        'details': CATEGORY_NOT_FOUND_MESSAGE,
                        'status': 'error',
                        'code': status.HTTP_404_NOT_FOUND
                    },
                    'message': CATEGORY_NOT_FOUND_MESSAGE,
                    'status': False
                }
                return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

            # Deserialize the request data with partial updates
            serializer = CategorySerializer(category, data=request.data, partial=True)

            # Validate and save the updated category
            if serializer.is_valid():
                serializer.save(is_active=True)
                response_data = {
                    'data': {
                        'category': serializer.data,
                        'status': 'success',
                        'code': status.HTTP_200_OK
                    },
                    'message': 'Category updated successfully',
                    'status': True
                }
                return JsonResponse(response_data, status=status.HTTP_200_OK)
            else:
                # Handling validation errors
                error_messages = []
                for field, messages in serializer.errors.items():
                    error_messages.append(f'{field}: {", ".join(messages)}')
                formatted_message = ', '.join(error_messages)
                # Issue an error response
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


# ? GET method will return all the categories
# ? POST method has limit offset functionality
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def view_category(request):
    try:
        if request.method == 'GET':
            # Return all categories without serializer, only with selected fields
            categories = Category.objects.filter(is_active=True).values('id', 'name', 'description', 'image')
            response_data = {
                'data': {
                    'categories': list(categories),
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'Categories fetched successfully',
                'status': True
            }
            return JsonResponse(response_data, status=status.HTTP_200_OK)

        elif request.method == 'POST':
            # Get paginated categories based on limit and offset
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

            # Retrive categories with pagination
            categories = Category.objects.filter(is_active=True).order_by('-created_at')
            
            # Slice the queryset using limit and offset
            paginated_data = list(categories[offset:offset + limit])

            # Pass the paginated_data into associated serializer
            serializer = CategorySerializer(paginated_data, many=True)

            # Get the total number of items
            total_items = categories.count()

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
                    'categories': serializer.data,
                    'total_count': total_items,
                    'page_count': page_count,
                    'current_page': current_page,
                    'limit': limit,
                    'offset': offset,
                    'has_next': has_next,
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'Paginated categories fetched successfully',
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


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def delete_category(request, category_id):
    try:
        if request.method == 'DELETE':
            # Try to get the category by ID
            try:
                category = Category.objects.get(id=category_id, is_active=True)
            except Category.DoesNotExist:
                response_data = {
                    'data': {
                        'details': CATEGORY_NOT_FOUND_MESSAGE,
                        'status': 'error',
                        'code': status.HTTP_404_NOT_FOUND
                    },
                    'message': CATEGORY_NOT_FOUND_MESSAGE,
                    'status': False
                }
                return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

            # Soft delete the category
            category.delete()

            response_data = {
                'data': {
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'Category deleted successfully',
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


# ***** To add / edit / view / delete sub-categories by admin *****
# ! Only ADMIN can add / edit / delete sub-categories
# ! but anyone without token can view sub-categories
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def add_subcategory(request):
    try:
        serializer = SubCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(is_active=True)
            response_data = {
                'data': {
                    'subcategory': serializer.data,
                    'status': 'success',
                    'code': status.HTTP_201_CREATED
                },
                'message': 'SubCategory added successfully',
                'status': True
            }
            return JsonResponse(response_data, status=status.HTTP_201_CREATED)
        else:
            error_messages = [f'{field}: {", ".join(messages)}' for field, messages in serializer.errors.items()]
            formatted_message = ', '.join(error_messages)
            response_data = {
                'data': {
                    'details': formatted_message, 
                    'status': 'error', 
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': DEFAULT_ERROR_MESSAGE,
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        response_data = {
            'data': {
                'details': str(e), 
                'status': 'error', 
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR
            },
            'message': INTERNAL_SERVER_ERROR_MESSAGE,
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdminUser])
def edit_subcategory(request, subcategory_id):
    try:
        try:
            subcategory = SubCategory.objects.get(id=subcategory_id, is_active=True)
        except SubCategory.DoesNotExist:
            response_data = {
                'data': {
                    'details': SUBCATEGORY_NOT_FOUND_MESSAGE, 
                    'status': 'error', 
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': SUBCATEGORY_NOT_FOUND_MESSAGE,
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

        serializer = SubCategorySerializer(subcategory, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(is_active=True)
            response_data = {
                'data': {
                    'subcategory': serializer.data,
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'SubCategory updated successfully',
                'status': True
            }
            return JsonResponse(response_data, status=status.HTTP_200_OK)
        else:
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


# ? GET method will return all the sub-categories
# ? POST method has limit offset functionality
# * Also added category_id realted sorting in GET method 
# * so that we can use those while we need to have 
# * categories ~ sub-categories relational search
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def view_subcategory(request, category_id=None):
    try:
        if request.method == 'GET':
            if category_id:
                subcategories = SubCategory.objects.filter(category_id=category_id, is_active=True).values('id', 'name', 'description', 'image', 'category')
            else:
                subcategories = SubCategory.objects.filter(is_active=True).values('id', 'name', 'description', 'image', 'category')
            response_data = {
                'data': {
                    'subcategories': list(subcategories), 
                    'status': 'success', 
                    'code': status.HTTP_200_OK
                },
                'message': 'SubCategories fetched successfully',
                'status': True
            }
            return JsonResponse(response_data, status=status.HTTP_200_OK)

        elif request.method == 'POST':
            limit = int(request.data.get('limit', 10))
            offset = int(request.data.get('offset', 0))

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
            
            # Retrive Sub-categories with pagination
            if category_id:
                subcategories = SubCategory.objects.filter(category_id=category_id, is_active=True).order_by('-created_at')
            else:
                subcategories = SubCategory.objects.filter(is_active=True).order_by('-created_at')

            # Slice the queryset using limit and offset
            paginated_data = list(subcategories[offset:offset + limit])

            # Pass the paginated_data into associated serializer
            serializer = SubCategorySerializer(paginated_data, many=True)

            # Get the total number of items
            total_items = subcategories.count()
            
            # Calculate page_count and current_page
            if limit > 0:
                page_count = (total_items + limit - 1) // limit # Round up the division
                current_page = (offset // limit) + 1 # Determine the current page
            else:
                page_count = 0
                current_page = 0

            # Check if there's a next page
            has_next = (offset + limit) < total_items

            response_data = {
                'data': {
                    'subcategories': serializer.data,
                    'total_count': total_items,
                    'page_count': page_count,
                    'current_page': current_page,
                    'limit': limit,
                    'offset': offset,
                    'has_next': has_next,
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'Paginated subcategories fetched successfully',
                'status': True
            }
            return JsonResponse(response_data, status=status.HTTP_200_OK)
    except Exception as e:
        response_data = {
            'data': {
                'details': str(e), 
                'status': 'error', 
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR
            },
            'message': INTERNAL_SERVER_ERROR_MESSAGE,
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def delete_subcategory(request, subcategory_id):
    try:
        try:
            subcategory = SubCategory.objects.get(id=subcategory_id, is_active=True)
        except SubCategory.DoesNotExist:
            response_data = {
                'data': {
                    'details': SUBCATEGORY_NOT_FOUND_MESSAGE, 
                    'status': 'error', 
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': SUBCATEGORY_NOT_FOUND_MESSAGE,
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

        subcategory.delete()
        response_data = {
            'data': {
                'status': 'success', 
                'code': status.HTTP_200_OK
            },
            'message': 'SubCategory deleted successfully',
            'status': True
        }
        return JsonResponse(response_data, status=status.HTTP_200_OK)
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


# ***** To add / edit / view / delete Products *****
# ? Admin will add products using this from admin panel
# ? He will add a single variant and all images associated 
# ? with the variant in array and the product details
# ? in a single API call
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def add_product(request):
    try:
        if request.method == 'POST':
            # Check if the SKU already exists in ProductVariant before proceeding
            variant_data = request.data.get('variant', {})
            sku = variant_data.get('sku', None)

            if sku and ProductVariant.objects.filter(sku=sku).exists():
                # If SKU exists, return error response and do not proceed
                response_data = {
                    'data': {
                        'status': 'error',
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': 'SKU already exists for another product variant.',
                    'status': False
                }
                return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)
            
            with transaction.atomic():
                product_serializer = ProductSerializer(data=request.data, context={'request': request})
                if product_serializer.is_valid():
                    # * Save the product instance
                    product_instance = product_serializer.save(created_by=request.user, is_active=True)

                    # Handle single product variant
                    variant_data = request.data.get('variant', {})

                    # Parse the variant JSON string into a dictionary
                    # try:
                    #     variant_data = json.loads(variant_data)
                    # except json.JSONDecodeError:
                    #     return JsonResponse({
                    #         'data': {
                    #             'status': 'error',
                    #             'code': status.HTTP_400_BAD_REQUEST
                    #         },
                    #         'message': 'Invalid variant data format.',
                    #         'status': False
                    #     }, status=status.HTTP_400_BAD_REQUEST)

                    # Check if variant_data is a string and parse it, or use it directly if it's a dict
                    if not isinstance(variant_data, dict):
                        return JsonResponse({
                            'data': {
                                'status': 'error',
                                'code': status.HTTP_400_BAD_REQUEST
                            },
                            'message': 'Variant data must be a valid JSON object.',
                            'status': False
                        }, status=status.HTTP_400_BAD_REQUEST)


                    # Pass the product ID in the variant data explicitly
                    variant_data['product'] = product_instance.id

                    if not variant_data:
                        return JsonResponse({
                            'data': {
                                'status': 'error',
                                'code': status.HTTP_400_BAD_REQUEST
                            },
                            'message': 'Variant data is required.',
                            'status': False
                        }, status=status.HTTP_400_BAD_REQUEST)

                    # * Validate and save the variant
                    variant_serializer = ProductVariantSerializer(data=variant_data, context={'request': request})
                    if variant_serializer.is_valid():
                        variant_instance = variant_serializer.save(product=product_instance)

                        # * To Upload Multiple Images associated with the variant
                        # images = request.FILES.getlist('images')                    # ? request.data
                        # request.data.getlist('images')
                        images = request.data.get('images', [])  # Expect a list of image URLs
                        image_error_messages = []
                        for image in images:
                            image_data = {
                                'variant': variant_instance.id,
                                'image': image,    
                            }
                            image_serializer = ProductImageSerializer(data=image_data)
                            if image_serializer.is_valid():
                                image_serializer.save(is_active=True)
                            else:
                                # Log the error but continue processing remaining files
                                for field, messages in image_serializer.errors.items():
                                    image_error_messages.append(f'{field}: {", ".join(messages)}')

                        # If there were errors, include them in the response but do not fail the entire request
                        if image_error_messages:
                            response_data = {
                                'data': {
                                    'details': image_error_messages, 
                                    'product': product_serializer.data, 
                                    'status': 'error', 
                                    'code': status.HTTP_400_BAD_REQUEST
                                    },
                                'message': 'Product added but some invalid image data found',
                                'status': False
                            }
                            return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)
                        else:
                            response_data = {
                                'data': {
                                    'product': product_serializer.data, 
                                    'status': 'success', 
                                    'code': status.HTTP_201_CREATED
                                },
                                'message': 'Product added successfully',
                                'status': True
                            }
                            return JsonResponse(response_data, status=status.HTTP_201_CREATED)
                    else:
                        # Handling validation errors
                        variant_error_messages = []
                        for field, messages in variant_serializer.errors.items():
                            variant_error_messages.append(f'{field}: {", ".join(messages)}')
                        formatted_message = ', '.join(variant_error_messages)
                        # Issue an error response
                        response_data = {
                            'data': {
                                'details': formatted_message,
                                'status': 'error',
                                'code': status.HTTP_400_BAD_REQUEST
                            },
                            'message': DEFAULT_ERROR_MESSAGE,
                            'status': False
                        }
                        return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)
                else:
                    # Handling validation errors
                    error_messages = []
                    for field, messages in product_serializer.errors.items():
                        error_messages.append(f'{field}: {", ".join(messages)}')
                    formatted_message = ', '.join(error_messages)
                    # Issue an error response
                    response_data = {
                        'data': {
                            'details': formatted_message,
                            'status': 'error',
                            'code': status.HTTP_400_BAD_REQUEST
                        },
                        'message': DEFAULT_ERROR_MESSAGE,
                        'status': False
                    }
                    return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Issue an error response
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


# ? Admin will add variant and images associated with the
# ? variant sending the product_id on the URL 
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def add_variant_and_images(request, product_id):
    try:
        if request.method == 'POST':
            # Check if the product exists
            product_instance = Product.objects.filter(id=product_id).first()
            if not product_instance:
                return JsonResponse({
                    'data': {
                        'status': 'error',
                        'code': status.HTTP_404_NOT_FOUND
                    },
                    'message': 'Product not found.',
                    'status': False
                }, status=status.HTTP_404_NOT_FOUND)

            with transaction.atomic():
                # Handle the variant data
                variant_data = request.data.get('variant', {})

                # Parse the variant JSON string into a dictionary
                # try:
                #     variant_data = json.loads(variant_data)
                # except json.JSONDecodeError:
                #     return JsonResponse({
                #         'data': {
                #             'status': 'error',
                #             'code': status.HTTP_400_BAD_REQUEST
                #         },
                #         'message': 'Invalid variant data format.',
                #         'status': False
                #     }, status=status.HTTP_400_BAD_REQUEST)

                # Check if variant_data is a string and parse it, or use it directly if it's a dict
                if not isinstance(variant_data, dict):
                    return JsonResponse({
                        'data': {
                            'status': 'error',
                            'code': status.HTTP_400_BAD_REQUEST
                        },
                        'message': 'Variant data must be a valid JSON object.',
                        'status': False
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                if not variant_data:
                    return JsonResponse({
                        'data': {
                            'status': 'error',
                            'code': status.HTTP_400_BAD_REQUEST
                        },
                        'message': 'Variant data is required.',
                        'status': False
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Create a mutable copy and add product key
                variant_data_copy = variant_data.copy()  # Ensure it's mutable
                variant_data_copy['product'] = product_instance.id

                # Validate and save the variant
                variant_serializer = ProductVariantSerializer(data=variant_data_copy , context={'request': request})
                if variant_serializer.is_valid():
                    variant_instance = variant_serializer.save(product=product_instance)

                    # Handle the images for the variant
                    # images = request.FILES.getlist('images')
                    images = request.data.get('images', [])  # Expect a list of image URLs                    
                    error_messages = []
                    for image in images:
                        image_data = {
                            'variant': variant_instance.id,
                            'image': image
                        }
                        image_serializer = ProductImageSerializer(data=image_data)
                        if image_serializer.is_valid():
                            image_serializer.save(is_active=True)
                        else:
                            # Log the error but continue processing remaining files
                            for field, messages in image_serializer.errors.items():
                                error_messages.append(f'{field}: {", ".join(messages)}')

                    # If there were errors, include them in the response but do not fail the entire request
                    if error_messages:
                        response_data = {
                            'data': {
                                'details': error_messages,
                                'status': 'error',
                                'code': status.HTTP_400_BAD_REQUEST
                            },
                            'message': 'Variant added but some invalid image data found',
                            'status': False
                        }
                        return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        response_data = {
                            'data': {
                                'variant': variant_serializer.data,
                                'status': 'success',
                                'code': status.HTTP_201_CREATED
                            },
                            'message': 'Variant and images added successfully',
                            'status': True
                        }
                        return JsonResponse(response_data, status=status.HTTP_201_CREATED)

                else:
                    # Handling validation errors for the variant
                    variant_error_messages = []
                    for field, messages in variant_serializer.errors.items():
                        variant_error_messages.append(f'{field}: {", ".join(messages)}')
                    formatted_message = ', '.join(variant_error_messages)
                    return JsonResponse({
                        'data': {
                            'details': formatted_message,
                            'status': 'error',
                            'code': status.HTTP_400_BAD_REQUEST
                        },
                        'message': DEFAULT_ERROR_MESSAGE,
                        'status': False
                    }, status=status.HTTP_400_BAD_REQUEST)

        else:
            return JsonResponse({
                'data': {
                    "status": "error",
                    'code': status.HTTP_400_BAD_REQUEST,
                },
                'message': INVALID_METHOD_MESSAGE,
                'status': False
            }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        # Handle any uncaught exceptions uniformly
        return JsonResponse({
            'data': {
                'details': str(e),
                "status": "error",
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR
            },
            'message': INTERNAL_SERVER_ERROR_MESSAGE,
            'status': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ? By this view admin can edit product details only
# ! To make changes in the variant and images use the next API
@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdminUser])
def edit_product(request, product_id):
    try:
        if request.method == 'PATCH':    
            product = Product.objects.get(id=product_id, is_active=True)
            product_serializer = ProductSerializer(product, data=request.data, partial=True, context={'request': request})
            if product_serializer.is_valid():
                with transaction.atomic():
                    product_serializer.save(is_active=True)
                    response_data = {
                        'data': {
                            'product': product_serializer.data, 
                            'status': 'success', 
                            'code': status.HTTP_201_CREATED
                        },
                        'message': 'Product updated successfully',
                        'status': True
                    }
                    return JsonResponse(response_data, status=status.HTTP_201_CREATED)
            else:
                # Handling validation errors
                error_messages = []
                for field, messages in product_serializer.errors.items():
                    error_messages.append(f'{field}: {", ".join(messages)}')
                formatted_message = ', '.join(error_messages)
                # Issue an error response
                response_data = {
                    'data': {
                        'details': formatted_message,
                        'status': 'error',
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': DEFAULT_ERROR_MESSAGE,
                    'status': False
                }
                return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Issue an error response
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


# ? By this view admin can edit variant details
# ? OR can add new images. For deleting existing images
# ? use "delete_product_image" fucntion
@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdminUser])
def edit_variant_and_images(request, variant_id):
    try:
        if request.method == 'PATCH':
            product_variant = ProductVariant.objects.get(id=variant_id, is_active=True)
            variant_serializer = ProductVariantSerializer(product_variant, data=request.data, partial=True, context={'request': request})
            if variant_serializer.is_valid():
                with transaction.atomic():
                    variant_serializer.save(is_active=True)
                    # Handle the images for the variant
                    # images = request.FILES.getlist('images')
                    # images = request.data.get('images', [])  # Expect a list of image URLs
                    # error_messages = []
                    # for image in images:
                    #     image_data = {
                    #         'variant': product_variant.id,
                    #         'image': image
                    #     }
                    #     image_serializer = ProductImageSerializer(data=image_data)
                    #     if image_serializer.is_valid():
                    #         image_serializer.save(is_active=True)
                    #     else:
                    #         # Log the error but continue processing remaining files
                    #         for field, messages in image_serializer.errors.items():
                    #             error_messages.append(f'{field}: {", ".join(messages)}')
                    
                    # Normalize incoming images to a list
                    new_images = request.data.get('images', []) or []
                    if isinstance(new_images, str):
                        new_images = [new_images]

                    # Current images for the variant (only active ones)
                    existing_images_qs = ProductImage.objects.filter(variant=product_variant, is_active=True)
                    existing_images = list(existing_images_qs.values_list('image', flat=True))

                    # Compute what to add (preserve order from request) and what to delete
                    images_to_add = [img for img in new_images if img not in existing_images]
                    images_to_delete = [img for img in existing_images if img not in new_images]

                    # Add new images
                    error_messages = []
                    # Add new images
                    for image in images_to_add:
                        image_data = {'variant': product_variant.id, 'image': image}
                        image_serializer = ProductImageSerializer(data=image_data)
                        if image_serializer.is_valid():
                            image_serializer.save(is_active=True)
                        else:
                            for field, messages in image_serializer.errors.items():
                                error_messages.append(f'{field}: {", ".join(messages)}')

                    # Hard-delete images that were removed in the request
                    if images_to_delete:
                        ProductImage.objects.filter(variant=product_variant, image__in=images_to_delete).delete()
                            
                    # If there were errors, include them in the response but do not fail the entire request
                    if error_messages:
                        response_data = {
                            'data': {
                                'details': error_messages,
                                'status': 'error',
                                'code': status.HTTP_400_BAD_REQUEST
                            },
                            'message': 'Variant updated but some invalid image data found',
                            'status': False
                        }
                        return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        response_data = {
                            'data': {
                                'variant': variant_serializer.data,
                                'status': 'success',
                                'code': status.HTTP_201_CREATED
                            },
                            'message': 'Variant and images updated successfully',
                            'status': True
                        }
                        return JsonResponse(response_data, status=status.HTTP_201_CREATED)
            else:
                # Handling validation errors for the variant
                variant_error_messages = []
                for field, messages in variant_serializer.errors.items():
                    variant_error_messages.append(f'{field}: {", ".join(messages)}')
                formatted_message = ', '.join(variant_error_messages)
                return JsonResponse({
                    'data': {
                        'details': formatted_message,
                        'status': 'error',
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': DEFAULT_ERROR_MESSAGE,
                    'status': False
                }, status=status.HTTP_400_BAD_REQUEST)    
        else:
            # Issue an error response
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


# ? This will return all the products with limit and offset
@api_view(['POST'])
@permission_classes([AllowAny])
def view_products(request):
    try:
        if request.method == 'POST':
            limit = int(request.data.get('limit', 10))
            offset = int(request.data.get('offset', 0))
            
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

            # Retrive Product with pagination 
            products = Product.objects.filter(is_active=True).order_by('-created_at')

            # Slice the queryset using limit and offset
            paginated_data = list(products[offset:offset + limit])

            # Pass the paginated_data into associated serializer
            serializer = ProductSerializer(paginated_data, many=True, context={'request': request})

            # Get the total number of items
            total_items = products.count()

            # Calculate page_count and current_page
            if limit > 0:
                page_count = (total_items + limit - 1) // limit
                current_page = (offset // limit) + 1
            else:
                page_count = 0
                current_page = 0

            # Check if there's a next page
            has_next = (offset + limit) < total_items

            response_data = {
                'data': {
                    'products': serializer.data, 
                    'total_count': total_items, 
                    'page_count': page_count,
                    'current_page': current_page, 
                    'limit': limit, 
                    'offset': offset, 
                    'has_next': has_next, 
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': PAGINATED_PRODUCTS_MESSAGE,
                'status': True
            }
            return JsonResponse(response_data, status=status.HTTP_200_OK)
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


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def delete_product(request, product_id):
    try:
        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
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

        product.delete()
        response_data = {
            'data': {
                'status': 'success', 
                'code': status.HTTP_200_OK
            },
            'message': 'Product deleted successfully',
            'status': True
        }
        return JsonResponse(response_data, status=status.HTTP_200_OK)
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


# ***** View related to Product and ProductImage tables *****
# ? To delete a product image from admin panel by admin
@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def delete_product_image(request, product_image_id):
    """
    Delete a product image (soft delete by setting is_active to False).
    """
    try:
        # Retrieve the ProductImage instance
        product_image = get_object_or_404(ProductImage, id=product_image_id, is_active=True)

        # Perform the soft delete
        product_image.delete()

        # Return a success response
        response_data = {
            'data': {
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'Product image deleted successfully',
            'status': True
        }
        return JsonResponse(response_data, status=status.HTTP_200_OK)
    except Exception as e:
        # Handle any uncaught exceptions uniformly
        response_data = {
            'data': {
                'details': str(e),
                'status': 'error',
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR
            },
            'message': INTERNAL_SERVER_ERROR_MESSAGE,
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ? To search products by all
@api_view(['POST'])
@permission_classes([AllowAny])
def search_product(request):
    """
    Filter products by name, category_name, sub_category_name, in_stock, rating 
    Only returns products with is_active=True.
    """
    try:
        if request.method == 'POST':
            limit = int(request.data.get('limit', 10))
            offset = int(request.data.get('offset', 0))

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

            name = request.data.get('name', None)
            category_id = request.data.get('category_id', None)
            sub_category_id = request.data.get('sub_category_id', None)
            category_name = request.data.get('category', None)
            sub_category_name = request.data.get('sub_category', None)
            rating = request.data.get('rating', None)

            brand = request.data.get('brand', None)
            model = request.data.get('model', None)
            year = request.data.get('year', None)

            # Base query: only active  products
            products = Product.objects.filter(
                                    is_active=True, 
                                ).order_by('-created_at')

            # Filter by name (case-insensitive)
            if name:
                products = products.filter(name__icontains=name)
            
            # Filter by category id (if provided)
            if category_id:
                products = products.filter(category_id=category_id)

            # Filter by subcategory id (if provided)
            if sub_category_id:
                products = products.filter(sub_category_id=sub_category_id)
                
            # Filter by category name (if provided)
            if category_name:
                products = products.filter(category__name__icontains=category_name.lower())
            
            # Filter by subcategory name (if provided)
            if sub_category_name:
                products = products.filter(sub_category__name__icontains=sub_category_name.lower())
            
            # Filter by rating (if provided)
            if rating is not None:  # Ensure rating is not None
                try:
                    rating_value = float(rating)
                    products = products.filter(rating__gte=rating_value)
                except ValueError:
                    response_data = {
                        'data': {
                            'details': "Invalid rating value",
                            'status': 'error',
                            'code': status.HTTP_400_BAD_REQUEST
                        },
                        'message': INTERNAL_SERVER_ERROR_MESSAGE,
                        'status': False
                    }
                    return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

            # Filter by brand (case-insensitive)
            if brand:
                products = products.filter(brand__icontains=brand)

            # Filter by model (case-insensitive)
            if model:
                products = products.filter(model__icontains=model)

            # Filter by year (case-insensitive)
            if year:
                products = products.filter(year__icontains=year)
                
            # Slice the queryset using limit and offset
            paginated_data = list(products[offset:offset + limit])

            # Pass the paginated_data into associated serializer
            serializer = ProductSerializer(paginated_data, many=True, context={'request': request})

            # Get the total number of items
            total_items = products.count()

            # Calculate page_count and current_page
            if limit > 0:
                page_count = (total_items + limit - 1) // limit
                current_page = (offset // limit) + 1
            else:
                page_count = 0
                current_page = 0

            # Check if there's a next page
            has_next = (offset + limit) < total_items

            response_data = {
                'data': {
                    'products': serializer.data, 
                    'total_count': total_items, 
                    'page_count': page_count,
                    'current_page': current_page, 
                    'limit': limit, 
                    'offset': offset, 
                    'has_next': has_next, 
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': PAGINATED_PRODUCTS_MESSAGE,
                'status': True
            }
            return JsonResponse(response_data, status=status.HTTP_200_OK)

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


# ? Compact live-catalog search intended for an n8n chatbot tool.
def _chatbot_product_url(request, product):
    """Return the storefront URL when configured, otherwise the public API detail URL."""
    api_url = request.build_absolute_uri(
        reverse('product:product_details', kwargs={'product_id': product.id})
    )
    template = getattr(settings, 'PRODUCT_PAGE_URL_TEMPLATE', '')
    if not template:
        return api_url, api_url

    try:
        return template.format(product_id=product.id), api_url
    except (KeyError, ValueError):
        # A bad deployment setting must not stop the bot from recommending products.
        return api_url, api_url


def _chatbot_product_payload(request, product):
    """Keep the chatbot response small while returning current price and availability."""
    variants = [variant for variant in product.variants.all() if variant.is_active]
    in_stock_variants = [variant for variant in variants if variant.in_stock]
    is_in_stock = bool(in_stock_variants)
    variant = min(
        in_stock_variants or variants,
        key=lambda item: item.final_listing_price_on_motospar,
        default=None,
    )
    image = None
    if variant:
        first_image = next((item for item in variant.images.all() if item.is_active), None)
        if first_image:
            image = first_image.image

    product_url, product_api_url = _chatbot_product_url(request, product)
    return {
        'id': str(product.id),
        'name': product.name,
        'description': product.description,
        'category': product.category.name if product.category else None,
        'sub_category': product.sub_category.name if product.sub_category else None,
        'brand': product.brand,
        'model': product.model,
        'year': product.year,
        'rating': str(product.rating),
        'in_stock': is_in_stock,
        'requires_fitment': product.requires_fitment,
        # Core n8n product fields. Keep price numeric and return a real, database-derived link.
        'price': float(variant.final_listing_price_on_motospar) if variant else None,
        'link': product_url,
        'status': 'in_stock' if is_in_stock else 'out_of_stock',
        'image': image,
        'product_url': product_url,
        'product_api_url': product_api_url,
    }


CHATBOT_DEFAULT_FIELDS = (
    'id', 'name', 'category', 'price', 'link', 'status', 'in_stock',
    'requires_fitment',
)
CHATBOT_ALLOWED_FIELDS = (
    'id', 'name', 'description', 'category', 'sub_category', 'brand', 'model',
    'year', 'rating', 'in_stock', 'price', 'link', 'status', 'requires_fitment',
    'image', 'product_url', 'product_api_url',
)


def _chatbot_error(details, http_status=status.HTTP_400_BAD_REQUEST):
    return JsonResponse({
        'data': {'details': details, 'status': 'error', 'code': http_status},
        'message': 'Invalid chatbot product request',
        'status': False,
    }, status=http_status)


def _chatbot_params(request):
    """Keep the legacy POST search usable while n8n uses the documented GET contract."""
    return request.query_params if request.method == 'GET' else request.data


def _chatbot_parse_bool(value, default=True):
    if value in (None, ''):
        return default
    if isinstance(value, bool):
        return value
    values = {'true': True, '1': True, 'yes': True, 'false': False, '0': False, 'no': False}
    try:
        return values[str(value).strip().lower()]
    except KeyError as error:
        raise ValueError('in_stock must be a boolean') from error


def _chatbot_parse_integer(params, name, default, minimum=1, maximum=None):
    value = params.get(name)
    if value in (None, ''):
        return default
    try:
        value = int(value)
    except (TypeError, ValueError) as error:
        raise ValueError(f'{name} must be an integer') from error
    if value < minimum or (maximum is not None and value > maximum):
        range_message = f'between {minimum} and {maximum}' if maximum else f'at least {minimum}'
        raise ValueError(f'{name} must be {range_message}')
    return value


def _chatbot_parse_filters(params, page_size_default=20, page_size_max=50):
    try:
        min_price = (
            Decimal(str(params.get('min_price')))
            if params.get('min_price') not in (None, '') else None
        )
        max_price = (
            Decimal(str(params.get('max_price')))
            if params.get('max_price') not in (None, '') else None
        )
    except (InvalidOperation, TypeError, ValueError) as error:
        raise ValueError('min_price and max_price must be numbers') from error

    if min_price is not None and min_price < 0:
        raise ValueError('min_price must be non-negative')
    if max_price is not None and max_price < 0:
        raise ValueError('max_price must be non-negative')
    if min_price is not None and max_price is not None and min_price > max_price:
        raise ValueError('min_price cannot exceed max_price')

    year = params.get('year')
    if year in (None, ''):
        year = None
    else:
        try:
            year = int(year)
        except (TypeError, ValueError) as error:
            raise ValueError('year must be an integer') from error
        if year < 1:
            raise ValueError('year must be a positive integer')

    requested_fields = (params.get('fields') or '').strip()
    if requested_fields:
        fields = tuple(
            field.strip() for field in requested_fields.split(',') if field.strip()
        )
        invalid_fields = set(fields) - set(CHATBOT_ALLOWED_FIELDS)
        if invalid_fields:
            raise ValueError(
                f'Unsupported fields: {", ".join(sorted(invalid_fields))}'
            )
    else:
        fields = CHATBOT_DEFAULT_FIELDS

    return {
        'category': (params.get('category') or '').strip(),
        'make': (params.get('make') or '').strip(),
        'model': (params.get('model') or '').strip(),
        'engine_variant': (
            params.get('engine_variant') or params.get('engine') or ''
        ).strip(),
        'year': year,
        'min_price': min_price,
        'max_price': max_price,
        'in_stock': _chatbot_parse_bool(params.get('in_stock'), default=True),
        'fields': fields,
        'page': _chatbot_parse_integer(params, 'page', default=1),
        'page_size': _chatbot_parse_integer(
            params, 'page_size', default=page_size_default, maximum=page_size_max
        ),
    }


def _chatbot_filtered_products(filters):
    """
    Apply all hard filters in SQL. Fitment-locked products are eligible only when
    make, model, and year are all known and match ProductCompatibility.
    """
    products = Product.objects.filter(is_active=True).select_related(
        'category', 'sub_category'
    )

    if filters['category']:
        products = products.filter(category__name__iexact=filters['category'])

    # This project currently has no Product.fuel_type field. Keep the public
    # parameter contract forwards-compatible by intentionally ignoring it.
    if filters['in_stock']:
        products = products.filter(variants__is_active=True, variants__in_stock=True)
    elif filters['min_price'] is not None or filters['max_price'] is not None:
        products = products.filter(variants__is_active=True)

    if filters['min_price'] is not None:
        products = products.filter(
            variants__final_listing_price_on_motospar__gte=filters['min_price']
        )
    if filters['max_price'] is not None:
        products = products.filter(
            variants__final_listing_price_on_motospar__lte=filters['max_price']
        )

    vehicle_info_complete = all(
        (filters['make'], filters['model'], filters['year'] is not None)
    )
    if vehicle_info_complete:
        compatibility = Q(
            compatibilities__make__iexact=filters['make'],
            compatibilities__model__iexact=filters['model'],
            compatibilities__year_from__lte=filters['year'],
            compatibilities__year_to__gte=filters['year'],
        )
        if filters['engine_variant']:
            compatibility &= Q(
                compatibilities__engine_variant__iexact=filters['engine_variant']
            )
        products = products.filter(
            Q(requires_fitment=False) | (Q(requires_fitment=True) & compatibility)
        ).distinct()
        needs_vehicle_info = Product.objects.none()
    else:
        needs_vehicle_info = products.filter(requires_fitment=True).distinct()
        products = products.filter(requires_fitment=False).distinct()

    return products, needs_vehicle_info, vehicle_info_complete


def _chatbot_with_catalog_data(products):
    return products.prefetch_related(
        Prefetch(
            'variants',
            queryset=ProductVariant.objects.filter(is_active=True).prefetch_related('images'),
        )
    )


def _chatbot_select_fields(payload, fields):
    return {field: payload.get(field) for field in fields}


def _chatbot_needs_vehicle_info(products, limit):
    return [
        {
            'id': str(product.id),
            'name': product.name,
            'category': product.category.name if product.category else None,
            'requires_fitment': True,
        }
        for product in products.select_related('category').order_by('-rating', '-created_at')[:limit]
    ]


def _chatbot_vehicle_note(needs_vehicle_info, vehicle_info_complete):
    if needs_vehicle_info and not vehicle_info_complete:
        return (
            'Vehicle make, model, and year are required before fitment-locked '
            'products can be recommended.'
        )
    return None


@api_view(['GET'])
@authentication_classes([ChatbotAPIKeyAuthentication])
@permission_classes([IsAuthenticated])
def chatbot_all_products(request):
    """
    GET /api/chatbot/products/

    Supports category, make, model, year, engine_variant, min_price, max_price,
    in_stock, fields, page, and page_size. Results are hard-filtered in SQL and
    capped at 50 products per page for LLM-safe catalog retrieval.
    """
    try:
        filters = _chatbot_parse_filters(request.query_params)
        products, locked_products, vehicle_info_complete = _chatbot_filtered_products(filters)
        total_count = products.count()
        start = (filters['page'] - 1) * filters['page_size']
        page_products = _chatbot_with_catalog_data(
            products.order_by('-rating', '-created_at')[start:start + filters['page_size']]
        )
        results = [
            _chatbot_select_fields(
                _chatbot_product_payload(request, product), filters['fields']
            )
            for product in page_products
        ]
        needs_vehicle_info = _chatbot_needs_vehicle_info(
            locked_products, filters['page_size']
        )
        note = _chatbot_vehicle_note(needs_vehicle_info, vehicle_info_complete)

        data = {
            'products': results,
            'needs_vehicle_info': needs_vehicle_info,
            'pagination': {
                'page': filters['page'],
                'page_size': filters['page_size'],
                'total_count': total_count,
                'total_pages': math.ceil(total_count / filters['page_size']) if total_count else 0,
            },
            'count': len(results),
            'status': 'success',
            'code': status.HTTP_200_OK,
        }
        if note:
            data['note'] = note
        return JsonResponse({
            'data': data,
            'message': 'Chatbot products fetched successfully',
            'status': True,
        }, status=status.HTTP_200_OK)
    except ValueError as error:
        return _chatbot_error(str(error))
    except Exception as error:
        return JsonResponse({
            'data': {
                'details': str(error),
                'status': 'error',
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
            },
            'message': INTERNAL_SERVER_ERROR_MESSAGE,
            'status': False,
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _chatbot_rank_products(products, query):
    """
    TODO(pgvector): add a Product.embedding VectorField, generate embeddings when
    products change, and order this already hard-filtered queryset by cosine distance.

    pgvector is not installed in this project yet, so this SQL lexical fallback only
    ranks the hard-filtered candidates; it never broadens the candidate set.
    """
    query_terms = [term for term in re.findall(r'[\\w-]+', query.lower()) if len(term) > 1]
    if not query_terms:
        return products.order_by('-rating', '-created_at')

    score = Value(0, output_field=IntegerField())
    for term in query_terms:
        score += Case(
            When(name__icontains=term, then=Value(4)),
            default=Value(0),
            output_field=IntegerField(),
        )
        score += Case(
            When(description__icontains=term, then=Value(2)),
            default=Value(0),
            output_field=IntegerField(),
        )
        score += Case(
            When(brand__icontains=term, then=Value(2)),
            default=Value(0),
            output_field=IntegerField(),
        )

    return products.annotate(
        chatbot_lexical_score=score
    ).order_by('-chatbot_lexical_score', '-rating', '-created_at')


@api_view(['GET', 'POST'])
@authentication_classes([ChatbotAPIKeyAuthentication])
@permission_classes([IsAuthenticated])
def chatbot_product_search(request):
    """
    GET /api/chatbot/products/search/?q=quiet+street+exhaust

    Hard filters (fitment, category, price, and stock) are applied in SQL before
    ranking. The current implementation uses a documented lexical fallback until
    Product.embedding is added with pgvector.
    """
    try:
        params = _chatbot_params(request)
        filters = _chatbot_parse_filters(params, page_size_default=10, page_size_max=20)
        limit = _chatbot_parse_integer(
            params, 'limit', default=10, minimum=1, maximum=20
        )
        query = (params.get('q') or params.get('query') or '').strip()

        products, locked_products, vehicle_info_complete = _chatbot_filtered_products(filters)
        hard_filter_count = products.count()
        needs_vehicle_info = _chatbot_needs_vehicle_info(locked_products, limit)
        note = _chatbot_vehicle_note(needs_vehicle_info, vehicle_info_complete)

        if hard_filter_count == 0:
            data = {
                'products': [],
                'needs_vehicle_info': needs_vehicle_info,
                'count': 0,
                'no_match': True,
                'semantic_search_mode': 'lexical_fallback_no_pgvector',
                'status': 'success',
                'code': status.HTTP_200_OK,
            }
            if note:
                data['note'] = note
            return JsonResponse({
                'data': data,
                'message': 'No products matched the requested hard filters',
                'status': True,
            }, status=status.HTTP_200_OK)

        ranked_products = _chatbot_with_catalog_data(
            _chatbot_rank_products(products, query)[:limit]
        )
        results = [
            _chatbot_select_fields(
                _chatbot_product_payload(request, product), filters['fields']
            )
            for product in ranked_products
        ]
        data = {
            'products': results,
            'needs_vehicle_info': needs_vehicle_info,
            'count': len(results),
            'no_match': False,
            'semantic_search_mode': 'lexical_fallback_no_pgvector',
            'status': 'success',
            'code': status.HTTP_200_OK,
        }
        if note:
            data['note'] = note
        return JsonResponse({
            'data': data,
            'message': 'Chatbot search completed with hard filters applied first',
            'status': True,
        }, status=status.HTTP_200_OK)
    except ValueError as error:
        return _chatbot_error(str(error))
    except Exception as error:
        return JsonResponse({
            'data': {
                'details': str(error),
                'status': 'error',
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
            },
            'message': INTERNAL_SERVER_ERROR_MESSAGE,
            'status': False,
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@authentication_classes([ChatbotAPIKeyAuthentication])
@permission_classes([IsAuthenticated])
def chatbot_validate_products(request):
    """
    Validate LLM-selected IDs against live inventory before n8n sends a reply.

    Request body: {"product_ids": ["uuid", ...]}. At most 100 IDs are accepted.
    """
    product_ids = request.data.get('product_ids')
    if not isinstance(product_ids, list):
        return _chatbot_error('product_ids must be a JSON list')
    if len(product_ids) > 100:
        return _chatbot_error('product_ids cannot contain more than 100 values')

    parsed_ids = []
    invalid_products = []
    for product_id in product_ids:
        try:
            parsed_ids.append(uuid.UUID(str(product_id)))
        except (TypeError, ValueError, AttributeError):
            invalid_products.append({
                'id': str(product_id),
                'reason': 'invalid_product_id',
            })

    products = _chatbot_with_catalog_data(
        Product.objects.filter(id__in=parsed_ids).select_related('category', 'sub_category')
    )
    products_by_id = {str(product.id): product for product in products}
    valid_products = []

    for product_id in product_ids:
        normalized_id = str(product_id)
        try:
            normalized_id = str(uuid.UUID(normalized_id))
        except (TypeError, ValueError, AttributeError):
            continue

        product = products_by_id.get(normalized_id)
        if not product:
            invalid_products.append({'id': normalized_id, 'reason': 'not_found'})
            continue
        if not product.is_active:
            invalid_products.append({'id': normalized_id, 'reason': 'inactive'})
            continue

        payload = _chatbot_product_payload(request, product)
        if not payload['in_stock']:
            invalid_products.append({'id': normalized_id, 'reason': 'out_of_stock'})
            continue

        valid_products.append(
            _chatbot_select_fields(payload, CHATBOT_DEFAULT_FIELDS)
        )

    return JsonResponse({
        'data': {
            'valid_products': valid_products,
            'invalid_products': invalid_products,
            'count': len(valid_products),
            'status': 'success',
            'code': status.HTTP_200_OK,
        },
        'message': 'Chatbot product validation completed',
        'status': True,
    }, status=status.HTTP_200_OK)
# ? To toggle in stock for a variant pass id on URL
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def toggle_in_variant_stock(request, variant_id):
    """
    Toggle the in_stock field of a product.
    """
    try:
        variant = ProductVariant.objects.get(id=variant_id)
        
        # Toggle the in_stock field
        variant.in_stock = not variant.in_stock
        variant.save()
        
        serializer = ProductVariantSerializer(variant, context={'request': request})
        message = 'Item has been marked as in stock!' if variant.in_stock else 'Item has been marked as out of stock!'

        response_data = {
            'data': {
                'products': serializer.data, 
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': message,
            'status': True
        }
        return JsonResponse(response_data, status=status.HTTP_200_OK)

    except Product.DoesNotExist:
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


# ? To view a single product in product details page
@api_view(['GET'])
@permission_classes([AllowAny])
def product_details(request, product_id):
    """
    Retrieve details of a specific product.
    """
    try:
        product = Product.objects.get(id=product_id, is_active=True)
        serializer = ProductSerializer(product, context={'request': request})

        response_data = {
            'data': {
                'products': serializer.data,
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'Product details fetched successfully',
            'status': True
        }
        return JsonResponse(response_data, status=status.HTTP_200_OK)

    except Product.DoesNotExist:
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


def public_product_page(request, product_id):
    """A lightweight public product page used by chatbot recommendation links."""
    product = get_object_or_404(
        Product.objects.select_related('category', 'sub_category').prefetch_related('variants__images'),
        id=product_id,
        is_active=True,
    )
    variants = product.variants.filter(is_active=True).order_by('final_listing_price_on_motospar')
    in_stock_variant = variants.filter(in_stock=True).first()
    primary_variant = in_stock_variant or variants.first()
    primary_image = None
    if primary_variant:
        image = primary_variant.images.filter(is_active=True).first()
        primary_image = image.image if image else None

    return render(request, 'product/public_product_page.html', {
        'product': product,
        'primary_variant': primary_variant,
        'primary_image': primary_image,
        'in_stock': in_stock_variant is not None,
    })


# ? To toggle between in Product status from is_active true to false and vice versa
# ? By admin from admin panel and its associated ProductImages as well
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def toggle_product_active_status(request, product_id):
    """
    Toggle the is_active field of a product.
    """
    try:
        product = Product.objects.get(id=product_id)

        # Toggle the is_active field
        product.is_active = not product.is_active
        product.save()

        # Toggle the is_active field of the associated ProductVariant objects
        product.variants.update(is_active=product.is_active)

        # Toggle the is_active field of the associated ProductImage objects
        ProductImage.objects.filter(variant__in=product.variants.all()).update(is_active=product.is_active)

        serializer = ProductSerializer(product, context={'request': request})
        message = 'Product and its images have been activated!' if product.is_active else 'Product and its images have been deactivated!'

        response_data = {
            'data': {
                'products': serializer.data,
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': message,
            'status': True
        }
        return JsonResponse(response_data, status=status.HTTP_200_OK)

    except Product.DoesNotExist:
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


# ***** View related to Product Request *****
# ? Vendors will add product request
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsVendor])
def add_product_request(request):
    try:
        if request.method == 'POST':
            # Atomic transaction ensures all or nothing approach
            with transaction.atomic():
                # Copy request.data and add vendorprofile field
                request_data = request.data.copy()
                request_data['vendor'] = str(request.user.id)  # Add vendorprofile ID to the request data

                # Validate and save ProductRequest
                product_serializer = ProductRequestSerializer(data=request_data, context={'request': request})
                if product_serializer.is_valid():
                    # Save product request instance
                    product_instance = product_serializer.save()
                    
                    # Notify admin about the new product request
                    notify_admin_about_product_request(request.user, product_instance)

                    # Handle multiple images for the product request
                    images = request.FILES.getlist('images')
                    image_error_messages = []

                    if images:
                        for image in images:
                            image_data = {
                                'productrequest': product_instance.id,
                                'image': image
                            }
                            image_serializer = ProductRequestImageSerializer(data=image_data)
                            if image_serializer.is_valid():
                                image_serializer.save(is_active=True)
                            else:
                                # Log the error but continue processing remaining files
                                for field, messages in image_serializer.errors.items():
                                    image_error_messages.append(f'{field}: {", ".join(messages)}')

                    # If there were errors with some images, include that in the response
                    if image_error_messages:
                        response_data = {
                            'data': {
                                'details': image_error_messages,
                                'product': product_serializer.data,
                                'status': 'partial_success',
                                'code': status.HTTP_206_PARTIAL_CONTENT
                            },
                            'message': 'Product request created, but some images had errors.',
                            'status': True
                        }
                        return JsonResponse(response_data, status=status.HTTP_206_PARTIAL_CONTENT)

                    # If no image errors, return success response
                    response_data = {
                        'data': {
                            'product': product_serializer.data,
                            'status': 'success',
                            'code': status.HTTP_201_CREATED
                        },
                        'message': 'Product request created successfully.',
                        'status': True
                    }
                    return JsonResponse(response_data, status=status.HTTP_201_CREATED)
                
                # Handle validation errors for product request
                else:
                    error_messages = []
                    for field, messages in product_serializer.errors.items():
                        error_messages.append(f'{field}: {", ".join(messages)}')
                    formatted_message = ', '.join(error_messages)
                    response_data = {
                        'data': {
                            'details': formatted_message,
                            'status': 'error',
                            'code': status.HTTP_400_BAD_REQUEST
                        },
                        'message': DEFAULT_ERROR_MESSAGE,
                        'status': False
                    }
                    return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

        # If method is not POST, return an error
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
        # Handle any uncaught exceptions
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


# ? Vendor can view his all requested products
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsVendor])
def view_product_request_vendor(request):
    try:
        if request.method == 'POST':
            limit = int(request.data.get('limit', 10))
            offset = int(request.data.get('offset', 0))
            
            # Ensure limit and offset are non-negative
            if limit < 0 or offset < 0:
                response_data = {
                    'data': {
                        'details': 'Limit and offset must be non-negative.',
                        'status': 'error',
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': DEFAULT_ERROR_MESSAGE,
                    'status': False
                }
                return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

            # Retrieve Product Requests where the user is the vendor
            vendor_product_requests = ProductRequest.objects.filter(vendor=request.user).order_by('is_active', '-requested_at')

            # Slice the queryset using limit and offset
            paginated_data = list(vendor_product_requests[offset:offset + limit])

            # Pass the paginated_data into the associated serializer
            serializer = ProductRequestSerializer(paginated_data, many=True, context={'request': request})

            # Get the total number of items
            total_items = vendor_product_requests.count()

            # Calculate page_count and current_page
            if limit > 0:
                page_count = (total_items + limit - 1) // limit
                current_page = (offset // limit) + 1
            else:
                page_count = 0
                current_page = 0

            # Check if there's a next page
            has_next = (offset + limit) < total_items

            response_data = {
                'data': {
                    'product_requests': serializer.data,
                    'total_count': total_items,
                    'page_count': page_count,
                    'current_page': current_page,
                    'limit': limit,
                    'offset': offset,
                    'has_next': has_next,
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'Retrieved product requests successfully.',
                'status': True
            }
            return JsonResponse(response_data, status=status.HTTP_200_OK)
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


# ? Admin can view all the requested products from all vendors
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def view_product_request_admin(request):
    try:
        limit = int(request.data.get('limit', 10))
        offset = int(request.data.get('offset', 0))

        # Ensure limit and offset are non-negative
        if limit < 0 or offset < 0:
            response_data = {
                'data': {
                    'details': 'Limit and offset must be non-negative.',
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': DEFAULT_ERROR_MESSAGE,
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve all Product Requests
        product_requests = ProductRequest.objects.all().order_by('is_active', '-requested_at')

        # Slice the queryset using limit and offset
        paginated_data = list(product_requests[offset:offset + limit])

        # Pass the paginated_data into the associated serializer
        serializer = ProductRequestSerializer(paginated_data, many=True, context={'request': request})

        # Get the total number of items
        total_items = product_requests.count()

        # Calculate page_count and current_page
        if limit > 0:
            page_count = (total_items + limit - 1) // limit
            current_page = (offset // limit) + 1
        else:
            page_count = 0
            current_page = 0

        # Check if there's a next page
        has_next = (offset + limit) < total_items

        response_data = {
            'data': {
                'product_requests': serializer.data,
                'total_count': total_items,
                'page_count': page_count,
                'current_page': current_page,
                'limit': limit,
                'offset': offset,
                'has_next': has_next,
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'Retrieved product requests successfully.',
            'status': True
        }
        return JsonResponse(response_data, status=status.HTTP_200_OK)
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


# ? Admin and Vendor can view a specific product
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_specific_product_request(request, product_request_id):
    try:
        # Retrieve the ProductRequest by ID
        product_request = ProductRequest.objects.filter(id=product_request_id).first()
        
        if not product_request:
            return JsonResponse({
                'data': {
                    'details': 'Product request not found.',
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': 'Not Found',
                'status': False
            }, status=status.HTTP_404_NOT_FOUND)

        # Check if the user is a vendor for this ProductRequest or an admin
        user = request.user
        if user.account_type == 'admin' or (user.account_type == 'vendor' and product_request.vendor == user):
            # Serialize the product request data
            serializer = ProductRequestSerializer(product_request)
            return JsonResponse({
                'data': {
                    'product_request': serializer.data,
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'Retrieved product request successfully.',
                'status': True
            }, status=status.HTTP_200_OK)
        else:
            return JsonResponse({
                'data': {
                    'details': 'You do not have permission to view this product request.',
                    'status': 'error',
                    'code': status.HTTP_403_FORBIDDEN
                },
                'message': 'Forbidden',
                'status': False
            }, status=status.HTTP_403_FORBIDDEN)

    except Exception as e:
        # Handle any uncaught exceptions uniformly
        return JsonResponse({
            'data': {
                'details': str(e),
                'status': 'error',
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR
            },
            'message': INTERNAL_SERVER_ERROR_MESSAGE,
            'status': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ? Admin can update the status of a product request
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_specific_product_request(request, product_request_id):
    try:
        # Retrieve the ProductRequest by ID
        product_request = ProductRequest.objects.filter(id=product_request_id).first()
        
        if not product_request:
            return JsonResponse({
                'data': {
                    'details': 'Product request not found.',
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': 'Not Found',
                'status': False
            }, status=status.HTTP_404_NOT_FOUND)

        # Check if the user is a vendor for this ProductRequest or an admin
        user = request.user
        if user.account_type == 'admin' or (user.account_type == 'vendor' and product_request.vendor == user):
            # Update the ProductRequest with the provided data
            serializer = ProductRequestSerializer(product_request, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()  # Save the changes to the database
                return JsonResponse({
                    'data': {
                        'product_request': serializer.data,
                        'status': 'success',
                        'code': status.HTTP_200_OK
                    },
                    'message': 'Product request updated successfully.',
                    'status': True
                }, status=status.HTTP_200_OK)
            else:
                return JsonResponse({
                    'data': {
                        'details': serializer.errors,
                        'status': 'error',
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': DEFAULT_ERROR_MESSAGE,
                    'status': False
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return JsonResponse({
                'data': {
                    'details': 'You do not have permission to update this product request.',
                    'status': 'error',
                    'code': status.HTTP_403_FORBIDDEN
                },
                'message': 'Forbidden',
                'status': False
            }, status=status.HTTP_403_FORBIDDEN)

    except Exception as e:
        # Handle any uncaught exceptions uniformly
        return JsonResponse({
            'data': {
                'details': str(e),
                'status': 'error',
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR
            },
            'message': 'Internal Server Error',
            'status': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ***** =====  END  ===== ******
