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
    CATEGORY_NOT_FOUND_MESSAGE, SUBCATEGORY_NOT_FOUND_MESSAGE,
    LIMIT_OFFSET_MESSAGE, PAGINATED_PRODUCTS_MESSAGE, VENDOR_NOT_FOUND_MESSAGE
    )
from .models import (
    VendorProfile, VendorStock
    )
from .serializers import (
    VendorProfileSerializer, VendorStockSerializer
    )
from product.models import Product


# Create your views here.


# ***** To add / edit / view / Vendor Profile Data *****
# ? Only VENDOR can add his profile data
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsVendor])
def add_vendor_profile(request):
    try:
        if request.method == 'POST':
            # Deserialize the request data
            serializer = VendorProfileSerializer(data=request.data)
            
            # Validate and save the vendor profile
            if serializer.is_valid():
                serializer.save(user=request.user, is_active=True)  # Calls the create method of the serializer
                response_data = {
                    'data': {
                        'vendor_profile': serializer.data,
                        'status': 'success',
                        'code': status.HTTP_201_CREATED
                    },
                    'message': 'Vendor profile added successfully',
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


# ? Only VENDOR can add his profile data
@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsVendor])
def edit_vendor_profile(request, vendor_profile_id):
    try:
        if request.method == 'PATCH':
            try:
                vendor_profile = VendorProfile.objects.get(id=vendor_profile_id)
            except VendorProfile.DoesNotExist:
                response_data = {
                    'data': {
                        'details': VENDOR_NOT_FOUND_MESSAGE,
                        'status': 'error',
                        'code': status.HTTP_404_NOT_FOUND
                    },
                    'message': VENDOR_NOT_FOUND_MESSAGE,
                    'status': False
                }
                return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

            # Check if the request user is the owner of the vendor profile
            if vendor_profile.user != request.user:
                response_data = {
                    'data': {
                        'details': 'Permission denied. You do not own this profile.',
                        'status': 'error',
                        'code': status.HTTP_403_FORBIDDEN
                    },
                    'message': 'You do not have permission to edit this profile.',
                    'status': False
                }
                return JsonResponse(response_data, status=status.HTTP_403_FORBIDDEN)

            serializer = VendorProfileSerializer(vendor_profile, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                response_data = {
                    'data': {
                        'vendor_profile': serializer.data,
                        'status': 'success',
                        'code': status.HTTP_200_OK
                    },
                    'message': 'Vendor profile updated successfully',
                    'status': True
                }
                return JsonResponse(response_data, status=status.HTTP_200_OK)
            else:
                error_messages = []
                for field, messages in serializer.errors.items():
                    error_messages.append(f'{field}: {", ".join(messages)}')
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


# ? Any logged in user can view vendor profiles
# ? No particular account_type is required
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def view_vendor_profiles(request, user_id=None):
    try:
        if request.method == 'GET':
            try:
                vendors = VendorProfile.objects.get(user_id=user_id, is_active=True)
            except VendorProfile.DoesNotExist:
                response_data = {
                    'data': {
                        'details': VENDOR_NOT_FOUND_MESSAGE,
                        'status': 'error',
                        'code': status.HTTP_404_NOT_FOUND
                    },
                    'message': VENDOR_NOT_FOUND_MESSAGE,
                    'status': False
                }
                return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)
            
            # Serialize the vendor profile
            serializer = VendorProfileSerializer(vendors)
            response_data = {
                'data': {
                    'vendor': serializer.data,
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'Vendor profiles fetched successfully',
                'status': True
            }
            return JsonResponse(response_data, status=status.HTTP_200_OK)

        elif request.method == 'POST':
            # ! This is for the admin user to check vendors list
            limit = int(request.data.get('limit', 10))
            offset = int(request.data.get('offset', 0))
            
            if limit < 0 or offset < 0:
                response_data = {
                    'data': {
                        'details': 'Invalid limit or offset',
                        'status': 'error',
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': 'Invalid limit or offset',
                    'status': False
                }
                return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

            # Retrive vendors with pagination
            vendors = VendorProfile.objects.filter(is_active=True).order_by('-created_at')
            
            # Slice the queryset using limit and offset
            paginated_data = list(vendors[offset:offset + limit])

            # Pass the paginated_data into associated serializer
            serializer = VendorProfileSerializer(paginated_data, many=True)
            
            # Get the total number of items
            total_items = vendors.count()

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
                    'vendor_profiles': serializer.data,
                    'total_count': total_items,
                    'page_count': page_count,
                    'current_page': current_page,
                    'limit': limit,
                    'offset': offset,
                    'has_next': has_next,
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'Paginated vendor profiles fetched successfully',
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


# ? Only Admin Can Delete vendor profile
@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def delete_vendor_profile(request, vendor_profile_id):
    try:
        if request.method == 'DELETE':
            try:
                vendor_profile = VendorProfile.objects.get(id=vendor_profile_id, is_active=True)
            except VendorProfile.DoesNotExist:
                response_data = {
                    'data': {
                        'details': VENDOR_NOT_FOUND_MESSAGE,
                        'status': 'error',
                        'code': status.HTTP_404_NOT_FOUND
                    },
                    'message': VENDOR_NOT_FOUND_MESSAGE,
                    'status': False
                }
                return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

            vendor_profile.delete()

            response_data = {
                'data': {
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'Vendor profile deleted successfully',
                'status': True
            }
            return JsonResponse(response_data, status=status.HTTP_200_OK)
        else:
            response_data = {
                'data': {
                    "status": "error",
                    'code': status.HTTP_400_BAD_REQUEST,
                },
                'message': 'Invalid request method',
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
            'message': 'Internal server error',
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ***** =====  END  ===== ******


# ***** To add / edit / view / Vendor Stock Data *****
# ? While adding stock data the data will be added
# ? to logged in user stock only
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsVendor])
def add_vendor_stock(request):
    try:
        vendor_profile = VendorProfile.objects.get(user=request.user)
        data = request.data.copy()
        data['vendorprofile'] = vendor_profile.id

        serializer = VendorStockSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            response_data = {
                'data': {
                    'vendor_stock': serializer.data,
                    'status': 'success',
                    'code': status.HTTP_201_CREATED
                },
                'message': 'Stock added successfully',
                'status': True
            }
            return JsonResponse(response_data, status=status.HTTP_201_CREATED)
        else:
            error_messages = [f'{field}: {", ".join(messages)}' for field, messages in serializer.errors.items()]
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

    except VendorProfile.DoesNotExist:
        response_data = {
            'data': {
                'details': VENDOR_NOT_FOUND_MESSAGE,
                'status': 'error',
                'code': status.HTTP_404_NOT_FOUND
            },
            'message': VENDOR_NOT_FOUND_MESSAGE,
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

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


# ? A vendor can edit his stocks only
@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsVendor])
def edit_vendor_stock(request, stock_id):
    try:
        vendor_profile = VendorProfile.objects.get(user=request.user)
        try:
            vendor_stock = VendorStock.objects.get(id=stock_id, vendorprofile=vendor_profile)
        except VendorStock.DoesNotExist:
            response_data = {
                'data': {
                    'details': 'Vendor profile not found! or Stock Data not found!',
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': DEFAULT_ERROR_MESSAGE,
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

        serializer = VendorStockSerializer(vendor_stock, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save(is_active=True)
            response_data = {
                'data': {
                    'vendor_stock': serializer.data,
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'Stock updated successfully',
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

    except VendorProfile.DoesNotExist:
        response_data = {
            'data': {
                'details': VENDOR_NOT_FOUND_MESSAGE,
                'status': 'error',
                'code': status.HTTP_404_NOT_FOUND
            },
            'message': VENDOR_NOT_FOUND_MESSAGE,
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

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


# ? Make in_stock true or false
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsVendor])
def toggle_in_vendor_stock(request, stock_id):
    """
    Toggle the in_stock field of a product by vendor from his stock.
    """
    try:
        vendor_profile = VendorProfile.objects.get(user=request.user)
        try:
            vendor_stock = VendorStock.objects.get(id=stock_id, vendorprofile=vendor_profile)
        except VendorStock.DoesNotExist:
            response_data = {
                'data': {
                    'details': 'Vendor profile not found! or Stock Data not found!',
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': DEFAULT_ERROR_MESSAGE,
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

        # Toggle the in_stock field
        vendor_stock.in_stock = not vendor_stock.in_stock
        vendor_stock.save()

        serializer = VendorStockSerializer(vendor_stock)
        message = 'Item has been marked as in stock!' if vendor_stock.in_stock else 'Item has been marked as out of stock!'

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

    except VendorProfile.DoesNotExist:
        response_data = {
            'data': {
                'details': VENDOR_NOT_FOUND_MESSAGE,
                'status': 'error',
                'code': status.HTTP_404_NOT_FOUND
            },
            'message': VENDOR_NOT_FOUND_MESSAGE,
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

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


# ***** This will return all the listed Products for an verdor *****
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def list_vendor_stock(request, user_id):
    try:
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

        try:
            vendor_profile = VendorProfile.objects.get(user=user_id)
        except VendorProfile.DoesNotExist:
            response_data = {
                'data': {
                    'details': VENDOR_NOT_FOUND_MESSAGE,
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': VENDOR_NOT_FOUND_MESSAGE,
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

        # Getting the vendor_stock
        vendor_stocks = VendorStock.objects.filter(vendorprofile=vendor_profile)

        # Slice the queryset using limit and offset
        paginated_data = list(vendor_stocks[offset:offset + limit])

        # Pass the paginated_data into associated serializer
        serializer = VendorStockSerializer(paginated_data, many=True)

        # Get the total number of items
        total_items = vendor_stocks.count()

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
                'variants': serializer.data,
                'total_items': total_items,
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
# ***** =====  END  ===== ******