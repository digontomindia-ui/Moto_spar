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
    LIMIT_OFFSET_MESSAGE, PAGINATED_PRODUCTS_MESSAGE, DRIVER_NOT_FOUND_MESSAGE
    )
from .models import Driver
from .serializers import DriverSerializer

# Create your views here.


# ***** To add / edit / view / delete Driver data by admin *****
# ! Only ADMIN can add / edit / delete driver related data
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def add_driver(request):
    try:
        if request.method == 'POST':
            # Deserialize the request data
            serializer = DriverSerializer(data=request.data)

            # Validate and save the driver
            if serializer.is_valid():
                serializer.save(is_active=True)
                response_data = {
                    'data': {
                        'driver': serializer.data,
                        'status': 'success',
                        'code': status.HTTP_201_CREATED
                    },
                    'message': 'Driver added successfully',
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
def edit_driver(request, driver_id):
    try:
        try:
            driver = Driver.objects.get(id=driver_id, is_active=True)
        except Driver.DoesNotExist:
            response_data = {
                'data': {
                    'details': DRIVER_NOT_FOUND_MESSAGE,
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': DRIVER_NOT_FOUND_MESSAGE,
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

        serializer = DriverSerializer(driver, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(is_active=True)
            response_data = {
                'data': {
                    'driver': serializer.data,
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'Driver updated successfully',
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



@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def view_drivers(request):
    try:
        if request.method == 'POST':
            # Get paginated drivers based on limit and offset
            limit = int(request.data.get('limit', 10))
            offset = int(request.data.get('offset', 0))
            search_query = request.data.get('search', '').strip()

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

            # Retrive drivers with pagination
            drivers = Driver.objects.filter(is_active=True).order_by('-created_at')
            if search_query:
                drivers = drivers.filter(
                    Q(first_name__icontains=search_query) |
                    Q(last_name__icontains=search_query) |
                    Q(email__icontains=search_query) |
                    Q(phone_number__icontains=search_query) |
                    Q(license_number__icontains=search_query) |
                    Q(city__icontains=search_query) |
                    Q(state__icontains=search_query) |
                    Q(postal_code__icontains=search_query) |
                    Q(country__icontains=search_query)
                )

            # Slice the queryset using limit and offset
            paginated_drivers = list(drivers[offset:offset + limit])

            # Pass the paginated_data into associated serializer
            serializer = DriverSerializer(paginated_drivers, many=True)

            # Get the total number of items
            total_items = drivers.count()

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
                    'drivers': serializer.data,
                    'total_count': total_items,
                    'page_count': page_count,
                    'current_page': current_page,
                    'limit': limit,
                    'offset': offset,
                    'has_next': has_next,
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'Paginated drivers fetched successfully',
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



@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def delete_driver(request, driver_id):
    try:
        try:
            driver = Driver.objects.get(id=driver_id, is_active=True)
        except Driver.DoesNotExist:
            response_data = {
                'data': {
                    'details': DRIVER_NOT_FOUND_MESSAGE,
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': DRIVER_NOT_FOUND_MESSAGE,
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)
        # Soft delete the category
        driver.delete()

        response_data = {
            'data': {
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'Driver deleted successfully',
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