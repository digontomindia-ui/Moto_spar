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
    LIMIT_OFFSET_MESSAGE, PAGINATED_PRODUCTS_MESSAGE, WISHLIST_NOT_FOUND_MESSAGE, CART_ITEM_NOT_FOUND_MESSAGE,
    SHIPPING_ADDRESS_NOT_FOUND_MESSAGE, BILLING_ADDRESS_NOT_FOUND_MESSAGE, INVALID_DATA_MESSAGE
    )
from .models import ShippingAddress, BillingAddress
from .serializers import ShippingAddressSerializer, BillingAddressSerializer


# Create your views here.


# ! Only account_type = "customer" can add edit view These views
# ***** To add / edit / view / delete shipping address by customer *****
# ? This will add shipping address for a customer
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
def add_shipping_address(request):
    try:
        if request.method == 'POST':
            allowed_pincodes = ['7000076', '700104', '711101', '700135', '700125']
            postal_code = request.data.get('postal_code')
            if postal_code and str(postal_code) not in allowed_pincodes:
                response_data = {
                    'data': {
                        'details': 'Delivery is not available for this pincode.',
                        'status': 'error',
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': 'Delivery is not available for this pincode.',
                    'status': False
                }
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

            serializer = ShippingAddressSerializer(data=request.data)
            
            if serializer.is_valid():
                # Save the shipping address
                serializer.save()
                response_data = {
                    'data': {
                        'shipping_address': serializer.data,
                        'status': 'success',
                        'code': status.HTTP_201_CREATED
                    },
                    'message': 'Shipping address added successfully',
                    'status': True
                }
                return Response(response_data, status=status.HTTP_201_CREATED)
            else:
                error_messages = [f'{field}: {", ".join(messages)}' for field, messages in serializer.errors.items()]
                formatted_message = ', '.join(error_messages)
                response_data = {
                    'data': {
                        'details': formatted_message,
                        'status': 'error',
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': INVALID_DATA_MESSAGE,
                    'status': False
                }
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
        else:
            response_data = {
                'data': {
                    "status": "error",
                    'code': status.HTTP_400_BAD_REQUEST,
                },
                'message': INVALID_METHOD_MESSAGE,
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

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
        return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ? This will for edit an existing shipping address
@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsCustomer])
def edit_shipping_address(request, address_id):
    try:
        if request.method == 'PATCH':
            allowed_pincodes = ['7000076', '700104', '711101', '700135', '700125']
            postal_code = request.data.get('postal_code')
            if postal_code and str(postal_code) not in allowed_pincodes:
                response_data = {
                    'data': {
                        'details': 'Delivery is not available for this pincode.',
                        'status': 'error',
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': 'Delivery is not available for this pincode.',
                    'status': False
                }
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

            try:
                address = ShippingAddress.objects.get(id=address_id, is_active=True)
            except ShippingAddress.DoesNotExist:
                response_data = {
                    'data': {
                        'details': SHIPPING_ADDRESS_NOT_FOUND_MESSAGE,
                        'status': 'error',
                        'code': status.HTTP_404_NOT_FOUND
                    },
                    'message': SHIPPING_ADDRESS_NOT_FOUND_MESSAGE,
                    'status': False
                }
                return Response(response_data, status=status.HTTP_404_NOT_FOUND)

            serializer = ShippingAddressSerializer(address, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                response_data = {
                    'data': {
                        'shipping_address': serializer.data,
                        'status': 'success',
                        'code': status.HTTP_200_OK
                    },
                    'message': 'Shipping address updated successfully',
                    'status': True
                }
                return Response(response_data, status=status.HTTP_200_OK)
            else:
                error_messages = [f'{field}: {", ".join(messages)}' for field, messages in serializer.errors.items()]
                formatted_message = ', '.join(error_messages)
                response_data = {
                    'data': {
                        'details': formatted_message,
                        'status': 'error',
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': INVALID_DATA_MESSAGE,
                    'status': False
                }
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
        else:
            response_data = {
                'data': {
                    "status": "error",
                    'code': status.HTTP_400_BAD_REQUEST,
                },
                'message': INVALID_METHOD_MESSAGE,
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

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
        return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ? View all shipping addresses for the authenticated user
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCustomer])
def view_shipping_addresses(request):
    try:
        if request.method == 'GET':
            addresses = ShippingAddress.objects.filter(user=request.user, is_active=True)
            serializer = ShippingAddressSerializer(addresses, many=True)
            response_data = {
                'data': {
                    'shipping_addresses': serializer.data,
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'Shipping addresses fetched successfully',
                'status': True
            }
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            response_data = {
                'data': {
                    "status": "error",
                    'code': status.HTTP_400_BAD_REQUEST,
                },
                'message': INVALID_METHOD_MESSAGE,
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

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
        return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ? To Delete a shipping address
@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsCustomer])
def delete_shipping_address(request, address_id):
    try:
        if request.method == 'DELETE':
            try:
                address = ShippingAddress.objects.get(id=address_id, is_active=True)
            except ShippingAddress.DoesNotExist:
                response_data = {
                    'data': {
                        'details': SHIPPING_ADDRESS_NOT_FOUND_MESSAGE,
                        'status': 'error',
                        'code': status.HTTP_404_NOT_FOUND
                    },
                    'message': SHIPPING_ADDRESS_NOT_FOUND_MESSAGE,
                    'status': False
                }
                return Response(response_data, status=status.HTTP_404_NOT_FOUND)

            address.delete()

            response_data = {
                'data': {
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'Shipping address deleted successfully',
                'status': True
            }
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            response_data = {
                'data': {
                    "status": "error",
                    'code': status.HTTP_400_BAD_REQUEST,
                },
                'message': INVALID_METHOD_MESSAGE,
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

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
        return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ***** =====  END  ===== ******


# ***** To add / edit / view / delete billing address by customer *****
# ? This will add billing address for a customer
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
def add_billing_address(request):
    try:
        if request.method == 'POST':
            serializer = BillingAddressSerializer(data=request.data)
            
            if serializer.is_valid():
                # Save the billing address
                serializer.save()
                response_data = {
                    'data': {
                        'billing_address': serializer.data,
                        'status': 'success',
                        'code': status.HTTP_201_CREATED
                    },
                    'message': 'Billing address added successfully',
                    'status': True
                }
                return Response(response_data, status=status.HTTP_201_CREATED)
            else:
                error_messages = [f'{field}: {", ".join(messages)}' for field, messages in serializer.errors.items()]
                formatted_message = ', '.join(error_messages)
                response_data = {
                    'data': {
                        'details': formatted_message,
                        'status': 'error',
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': INVALID_DATA_MESSAGE,
                    'status': False
                }
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
        else:
            response_data = {
                'data': {
                    "status": "error",
                    'code': status.HTTP_400_BAD_REQUEST,
                },
                'message': INVALID_METHOD_MESSAGE,
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

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
        return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ? This will edit an existing billing address
@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsCustomer])
def edit_billing_address(request, address_id):
    try:
        if request.method == 'PATCH':
            try:
                address = BillingAddress.objects.get(id=address_id, is_active=True)
            except BillingAddress.DoesNotExist:
                response_data = {
                    'data': {
                        'details': BILLING_ADDRESS_NOT_FOUND_MESSAGE,
                        'status': 'error',
                        'code': status.HTTP_404_NOT_FOUND
                    },
                    'message': BILLING_ADDRESS_NOT_FOUND_MESSAGE,
                    'status': False
                }
                return Response(response_data, status=status.HTTP_404_NOT_FOUND)

            serializer = BillingAddressSerializer(address, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                response_data = {
                    'data': {
                        'billing_address': serializer.data,
                        'status': 'success',
                        'code': status.HTTP_200_OK
                    },
                    'message': 'Billing address updated successfully',
                    'status': True
                }
                return Response(response_data, status=status.HTTP_200_OK)
            else:
                error_messages = [f'{field}: {", ".join(messages)}' for field, messages in serializer.errors.items()]
                formatted_message = ', '.join(error_messages)
                response_data = {
                    'data': {
                        'details': formatted_message,
                        'status': 'error',
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': INVALID_DATA_MESSAGE,
                    'status': False
                }
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
        else:
            response_data = {
                'data': {
                    "status": "error",
                    'code': status.HTTP_400_BAD_REQUEST,
                },
                'message': INVALID_METHOD_MESSAGE,
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

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
        return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ? View all billing addresses for the authenticated user
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCustomer])
def view_billing_addresses(request):
    try:
        if request.method == 'GET':
            addresses = BillingAddress.objects.filter(user=request.user, is_active=True)
            serializer = BillingAddressSerializer(addresses, many=True)
            response_data = {
                'data': {
                    'billing_addresses': serializer.data,
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'Billing addresses fetched successfully',
                'status': True
            }
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            response_data = {
                'data': {
                    "status": "error",
                    'code': status.HTTP_400_BAD_REQUEST,
                },
                'message': INVALID_METHOD_MESSAGE,
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

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
        return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ? To delete a billing address
@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsCustomer])
def delete_billing_address(request, address_id):
    try:
        if request.method == 'DELETE':
            try:
                address = BillingAddress.objects.get(id=address_id, is_active=True)
            except BillingAddress.DoesNotExist:
                response_data = {
                    'data': {
                        'details': BILLING_ADDRESS_NOT_FOUND_MESSAGE,
                        'status': 'error',
                        'code': status.HTTP_404_NOT_FOUND
                    },
                    'message': BILLING_ADDRESS_NOT_FOUND_MESSAGE,
                    'status': False
                }
                return Response(response_data, status=status.HTTP_404_NOT_FOUND)

            address.delete()

            response_data = {
                'data': {
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'Billing address deleted successfully',
                'status': True
            }
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            response_data = {
                'data': {
                    "status": "error",
                    'code': status.HTTP_400_BAD_REQUEST,
                },
                'message': INVALID_METHOD_MESSAGE,
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

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
        return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ***** =====  END  ===== ******