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
from django.db import transaction, models
from django.db.models import Count, Sum, F, Q, Case, When, FloatField, Value, DecimalField
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
from app.models import User
from product.models import Product, ProductVariant
from cart.models import Cart, CartItem
from vendor.models import VendorProfile, VendorStock
from order.models import Order, OrderItem

from app.serializers import UserSerializer
from order.serializers import OrderSerializer, OrderItemSerializer
from product.serializers import ProductSerializer
from vendor.serializers import VendorStockSerializer
from .utils import notify_vendor_about_verification
from app.messages import (
    EMAIL_EXIST_MESSAGE, PHONE_NUMBER_EXIST_MESSAGE, REGISTER_SUCCESS_MESSAGE, INVALID_DATA_MESSAGE, 
    DEFAULT_ERROR_MESSAGE, INVALID_METHOD_MESSAGE, LOGIN_MESSAGE, USER_NOT_EXIST_MESSAGE,
    EMAIL_REQUIRED_MESSAGE, PHONE_OTP_MESSAGE, EMAIL_OTP_MESSAGE, INTERNAL_SERVER_ERROR_MESSAGE,
    LIMIT_OFFSET_MESSAGE, PAGINATED_PRODUCTS_MESSAGE, PRODUCT_NOT_FOUND_MESSAGE,
)

# Create your views here.


# ? The following views are related to admin 
# ? and can be access from admin panel only

# ***** Views for admin panel *****
# ! To view all users data from admin panel
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def view_users_admin_panel(request):
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
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': INVALID_DATA_MESSAGE,
                    'status': False
                }
                return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

            # Extract search filters from request
            email = request.data.get('email', '').strip()
            phone_number = request.data.get('phone_number', '').strip()
            country = request.data.get('country', '').strip()
            state = request.data.get('state', '').strip()
            postal_code = request.data.get('postal_code', '').strip()
            account_type = request.data.get('account_type', '').strip()

            # Construct the Q object for complex filtering
            filters = Q()

            if email:
                filters &= Q(email__icontains=email)

            if phone_number:
                filters &= Q(phone_number__icontains=phone_number)

            if country:
                filters &= Q(country__icontains=country)

            if state:
                filters &= Q(state__icontains=state)

            if postal_code:
                filters &= Q(postal_code__icontains=postal_code)

            if account_type:
                filters &= Q(account_type__iexact=account_type)

            # Retrieve and paginate users based on filters
            users = User.objects.filter(filters).order_by('date_joined', 'account_type')

            # Paginate the queryset using limit and offset
            paginated_data = list(users[offset:offset + limit])

            # Serialize the paginated data
            serializer = UserSerializer(paginated_data, many=True, context={'request': request})

            # Get the total number of items
            total_items = users.count()

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
                    'users': serializer.data,
                    'total_count': total_items,
                    'page_count': page_count,
                    'current_page': current_page,
                    'limit': limit,
                    'offset': offset,
                    'has_next': has_next,
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'Users retrieved successfully.',
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


# ! To view all users detail data from admin panel
# ! data will be different as per account_type
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def detail_user_view_admin(request, user_id):
    try:
        # Retrieve the user object based on the provided user_id
        user = get_object_or_404(User, id=user_id)

        # Serialize the user object
        serializer = UserSerializer(user, context={'request': request})

        # Prepare the response data
        response_data = {
            'data': {
                'user': serializer.data,
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'User details retrieved successfully.',
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


# ! To view order data from admin panel
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def view_orders_admin(request):
    try:
        if request.method == 'POST':
            # Extract and validate pagination parameters
            limit = int(request.data.get('limit', 10))
            offset = int(request.data.get('offset', 0))

            if limit < 0 or offset < 0:
                return JsonResponse(
                    {
                        'data': {
                            'details': "Limit and offset must be non-negative.",
                            'status': 'error',
                            'code': status.HTTP_400_BAD_REQUEST
                        },
                        'message': "Invalid pagination parameters.",
                        'status': False
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Extract search filters from request
            customer_name = request.data.get('customer_name', '').strip()
            order_code = request.data.get('order_code', '').strip()
            payment_method = request.data.get('payment_method', '').strip()
            payment_status = request.data.get('payment_status', '').strip()
            phone_number = request.data.get('phone_number', '').strip()
            address_fields = request.data.get('address', '').strip()

            # Construct the Q object for complex filtering
            filters = Q(is_active=True)

            if customer_name:
                filters &= Q(customer__first_name__icontains=customer_name) | Q(customer__last_name__icontains=customer_name)
            
            if order_code:
                filters &= Q(order_code__icontains=order_code)

            if payment_method:
                filters &= Q(payment_method__iexact=payment_method)

            if payment_status:
                filters &= Q(payment_status__iexact=payment_status)

            if phone_number:
                filters &= (
                    Q(shipping_address__phone_number__icontains=phone_number) |
                    Q(billing_address__phone_number__icontains=phone_number)
                )

            if address_fields:
                filters &= (
                    Q(shipping_address__street_address__icontains=address_fields) |
                    Q(shipping_address__city__icontains=address_fields) |
                    Q(shipping_address__state__icontains=address_fields) |
                    Q(shipping_address__postal_code__icontains=address_fields) |
                    Q(shipping_address__country__icontains=address_fields) |
                    Q(billing_address__street_address__icontains=address_fields) |
                    Q(billing_address__city__icontains=address_fields) |
                    Q(billing_address__state__icontains=address_fields) |
                    Q(billing_address__postal_code__icontains=address_fields) |
                    Q(billing_address__country__icontains=address_fields)
                )

            # Retrieve and paginate orders based on filters
            orders = Order.objects.filter(filters).select_related('customer', 'shipping_address', 'billing_address').order_by('-created_at')
            
            # Slice the queryset using limit and offset
            paginated_orders = list(orders[offset:offset + limit])
            
            # Get the total number of items
            total_items = orders.count()

            # Serialize the paginated data
            serializer = OrderSerializer(paginated_orders, many=True, context={'request': request})

            # Calculate page count and current page
            page_count = (total_items + limit - 1) // limit if limit > 0 else 0
            current_page = (offset // limit) + 1 if limit > 0 else 0

            # Check if there's a next page
            has_next = (offset + limit) < total_items

            # Build the response
            response_data = {
                'data': {
                    'orders': serializer.data,
                    'total_count': total_items,
                    'page_count': page_count,
                    'current_page': current_page,
                    'limit': limit,
                    'offset': offset,
                    'has_next': has_next,
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': "Orders retrieved successfully.",
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
            'message': "An internal server error occurred.",
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ! Product View for admin as it consist 
# ! both is active = true and false products
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def view_products_admin_panel(request):
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
            # ! 'is_active': This ensures that products with is_active=False are ordered last, 
            # ! since False values will come after True values in ascending order.
            products = Product.objects.all().order_by('is_active', '-created_at')

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


# ! This will return all the vendors 
# ! who have a particular product in stock
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def vendors_with_product_in_stock(request, product_id):
    try:
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

        # Get the product by the passed product_id or return 404 if not found
        product = get_object_or_404(Product, id=product_id, is_active=True)
        
        # Query VendorStock for vendors who have the product
        vendor_stocks = VendorStock.objects.filter(product=product, is_active=True)

        # Slice the queryset using limit and offset
        paginated_data = list(vendor_stocks[offset:offset + limit])

        # Serialize the results
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
    
    except Product.DoesNotExist:
        # Return an error response if the product does not exist or is not active
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


# ! To view all unverified vendor users from admin panel
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def view_unverified_vendors(request):
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
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': INVALID_DATA_MESSAGE,
                    'status': False
                }
                return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

            # Retrieve unverified vendors
            unverified_vendors = User.objects.filter(account_type='vendor', is_verified=False).order_by('date_joined')

            # Paginate the queryset using limit and offset
            paginated_data = list(unverified_vendors[offset:offset + limit])

            # Serialize the paginated data
            serializer = UserSerializer(paginated_data, many=True, context={'request': request})

            # Get the total number of unverified vendors
            total_items = unverified_vendors.count()

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
                    'users': serializer.data,
                    'total_count': total_items,
                    'page_count': page_count,
                    'current_page': current_page,
                    'limit': limit,
                    'offset': offset,
                    'has_next': has_next,
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'Unverified vendors retrieved successfully.',
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


# ! To update is_verified status for a vendor user
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_vendor_verification(request, user_id):
    try:
        # Retrieve the user by ID
        user = User.objects.get(id=user_id)

        # Check if the user is a vendor and is_verified is False
        if user.account_type == 'vendor' and not user.is_verified:
            user.is_verified = True
            user.save()

            # Notify the vendor about the completion of their account verification
            notify_vendor_about_verification(user)

            response_data = {
                'data': {
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'User verification status updated successfully.',
                'status': True
            }
            return JsonResponse(response_data, status=status.HTTP_200_OK)
        else:
            response_data = {
                'data': {
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': 'User is either not a vendor or already verified.',
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

    except User.DoesNotExist:
        response_data = {
            'data': {
                'status': 'error',
                'code': status.HTTP_404_NOT_FOUND
            },
            'message': 'User not found.',
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)
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
# ***** =====  END  ===== ******



# ***** Views for admin panel to show sale related data *****
# ! This will return all the purchase made by an user
# ! providing the user id in url
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def view_user_orders_admin_panel(request, user_id):
    try:
        # Extract and validate pagination parameters
        limit = int(request.data.get('limit', 10))
        offset = int(request.data.get('offset', 0))

        if limit < 0 or offset < 0:
            response_data = {
                'data': {
                    'details': LIMIT_OFFSET_MESSAGE,
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': INVALID_DATA_MESSAGE,
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve the user's orders
        orders = Order.objects.filter(customer_id=user_id).order_by('-created_at')

        # Paginate the queryset using limit and offset
        paginated_orders = list(orders[offset:offset + limit])

        # Serialize the paginated orders
        serializer = OrderSerializer(paginated_orders, many=True, context={'request': request})

        # Calculate the total number of items purchased where payment_status is 'SUCCESS'
        total_items_purchased = OrderItem.objects.filter(
            order__customer_id=user_id, payment_status='SUCCESS'
        ).aggregate(total_quantity=Sum('quantity'))['total_quantity'] or 0

        # Calculate the total purchase amount where payment_status is 'SUCCESS'
        total_purchase_amount = OrderItem.objects.filter(
            order__customer_id=user_id, payment_status='SUCCESS'
        ).aggregate(total_price=Sum('item_total_price'))['total_price'] or 0

        # Get the total number of orders
        total_orders = orders.count()

        # Calculate page_count and current_page
        if limit > 0:
            page_count = (total_orders + limit - 1) // limit
            current_page = (offset // limit) + 1
        else:
            page_count = 0
            current_page = 0

        # Check if there's a next page
        has_next = (offset + limit) < total_orders

        response_data = {
            'data': {
                'orders': serializer.data,
                'total_orders_count': total_orders,
                'total_purchase_amount': total_purchase_amount,
                'total_items_purchased': total_items_purchased,
                'page_count': page_count,
                'current_page': current_page,
                'limit': limit,
                'offset': offset,
                'has_next': has_next,
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'Orders retrieved successfully.',
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


# ! This will provide all the sell done by an vendor
# ! providing the user id in url
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def view_vendor_order_items_admin_panel(request, user_id):
    try:
        # Extract and validate pagination parameters
        limit = int(request.data.get('limit', 10))
        offset = int(request.data.get('offset', 0))

        if limit < 0 or offset < 0:
            response_data = {
                'data': {
                    'details': LIMIT_OFFSET_MESSAGE,
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': INVALID_DATA_MESSAGE,
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve the OrderItems where assigned_vendor matches user_id
        order_items = OrderItem.objects.filter(assigned_vendor_id=user_id).order_by('-created_at')

        # Paginate the queryset using limit and offset
        paginated_order_items = list(order_items[offset:offset + limit])

        # Serialize the paginated order items
        serializer = OrderItemSerializer(paginated_order_items, many=True, context={'request': request})

        # Calculate the total item_total_price, vendor_selling_price and total_items_sold with additional filters
        total_item_total_price = order_items.filter(
            order_status='DELIVERED', payment_status='SUCCESS'
        ).aggregate(total_item_total=Sum('item_total_price'))['total_item_total'] or 0

        total_vendor_selling_price = order_items.filter(
            order_status='DELIVERED', payment_status='SUCCESS'
        ).aggregate(total_vendor_selling=Sum('vendor_selling_price'))['total_vendor_selling'] or 0

        total_items_sold = order_items.filter(
            order_status='DELIVERED', payment_status='SUCCESS'
        ).aggregate(total_quantity=Sum('quantity'))['total_quantity'] or 0

        # Get the total number of order items
        total_order_items = order_items.count()

        # Calculate page_count and current_page
        if limit > 0:
            page_count = (total_order_items + limit - 1) // limit
            current_page = (offset // limit) + 1
        else:
            page_count = 0
            current_page = 0

        # Check if there's a next page
        has_next = (offset + limit) < total_order_items

        response_data = {
            'data': {
                'order_items': serializer.data,
                'total_order_items_count': total_order_items,
                'total_item_total_price': total_item_total_price,
                'total_vendor_selling_price': total_vendor_selling_price,
                'total_items_sold': total_items_sold,
                'page_count': page_count,
                'current_page': current_page,
                'limit': limit,
                'offset': offset,
                'has_next': has_next,
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'Order items retrieved successfully.',
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
            'message': 'An internal server error occurred.',
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ! This will show all stats for the admin panel
# ! to show in the home page top part
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_panel_statistics(request):
    try:
        # Current date and time
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)
        seven_days_ago = today - timedelta(days=7)

        # 1. User statistics
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        active_customers = User.objects.filter(is_active=True, account_type='customer').count()
        active_vendors = User.objects.filter(is_active=True, account_type='vendor').count()

        # 2. Order statistics
        total_orders = Order.objects.count()
        today_orders = Order.objects.filter(created_at__date=today).count()
        yesterday_orders = Order.objects.filter(created_at__date=yesterday).count()

        # Calculate the % change in orders from yesterday
        if yesterday_orders > 0:
            order_change_percentage = ((today_orders - yesterday_orders) / yesterday_orders) * 100
        else:
            order_change_percentage = 0  # Avoid division by zero

        # 3. Last 7 days revenue and profit per day
        last_7_days_data = (
            OrderItem.objects.filter(payment_status='SUCCESS', order__created_at__date__gte=seven_days_ago)
            .annotate(day=models.functions.TruncDate('order__created_at'))
            .values('day')
            .annotate(
                daily_revenue=Sum('item_total_price', output_field=DecimalField()),
                daily_profit=Sum(F('item_total_price') - F('vendor_selling_price'), output_field=DecimalField())
            )
            .order_by('day')
        )

        # Format the daily revenue into a dictionary with dates as keys
        daily_revenue_data = {entry['day'].strftime('%Y-%m-%d'): entry['daily_revenue'] for entry in last_7_days_data}

        # 4. Total revenue and total profit (for all-time)
        total_revenue = OrderItem.objects.filter(payment_status='SUCCESS').aggregate(
            total_revenue=Sum('item_total_price', output_field=DecimalField())
        )['total_revenue'] or 0

        total_profit = OrderItem.objects.filter(payment_status='SUCCESS').aggregate(
            total_profit=Sum(F('item_total_price') - F('vendor_selling_price'), output_field=DecimalField())
        )['total_profit'] or 0

        # 6. Current day revenue and % change from previous day
        current_day_revenue = OrderItem.objects.filter(
            payment_status='SUCCESS', order__created_at__date=today
        ).aggregate(
            current_revenue=Sum('item_total_price', output_field=DecimalField())
        )['current_revenue'] or 0

        previous_day_revenue = OrderItem.objects.filter(
            payment_status='SUCCESS', order__created_at__date=yesterday
        ).aggregate(
            previous_revenue=Sum('item_total_price', output_field=DecimalField())
        )['previous_revenue'] or 0

        if previous_day_revenue > 0:
            revenue_change_percentage = ((current_day_revenue - previous_day_revenue) / previous_day_revenue) * 100
        else:
            revenue_change_percentage = 0  # Avoid division by zero

        # 7. Category and sub-category wise revenue distribution in %
        category_distribution = (
            OrderItem.objects.filter(payment_status='SUCCESS')
            # .values('variant__product__category', 'variant__product__sub_category')
            .values(
                'variant__product__category__name',  # Get the category name
                'variant__product__sub_category__name'  # Get the sub-category name
            )
            .annotate(category_revenue=Sum('item_total_price', output_field=DecimalField()))
        )

        total_revenue_for_distribution = sum(item['category_revenue'] for item in category_distribution)
        # for item in category_distribution:
        #     item['revenue_percentage'] = (
        #         (item['category_revenue'] / total_revenue_for_distribution) * 100
        #         if total_revenue_for_distribution > 0 else 0
        #     )

        for item in category_distribution:
            item['revenue_percentage'] = round(
                (item['category_revenue'] / total_revenue_for_distribution) * 100, 2
            ) if total_revenue_for_distribution > 0 else 0.00

        # Prepare response data
        response_data = {
            'data': {
                'user_statistics': {
                    'total_users': total_users,
                    'active_users': active_users,
                    'active_customers': active_customers,
                    'active_vendors': active_vendors,
                },
                'order_statistics': {
                    'total_orders': total_orders,
                    'today_orders': today_orders,
                    'order_change_percentage': order_change_percentage,
                },
                'revenue_and_profit': {
                    'last_7_days_data': list(last_7_days_data),
                    'daily_revenue_formatted': daily_revenue_data,  # Added formatted daily revenue
                    'total_revenue': total_revenue,
                    'total_profit': total_profit,
                    'current_day_revenue': current_day_revenue,
                    'revenue_change_percentage': revenue_change_percentage,
                },
                'category_distribution': list(category_distribution),
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'data retrieved successfully.',
            'status': True,
        }
        return JsonResponse(response_data, safe=False, status=status.HTTP_200_OK)

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


# ! This will show all the stats for vendor panel
# ! to show in the home page top part
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsVendor])
def vendor_statistics_view(request):
    try:
        # Get the current user
        user = request.user

        # 1. Calculate total revenue for the user where payment_status is SUCCESS
        total_revenue = OrderItem.objects.filter(
            assigned_vendor=user,
            payment_status='SUCCESS'
        ).aggregate(total=Sum('vendor_selling_price'))['total'] or 0

        # 2. Calculate total vendor_selling_price for the user where payment_status is SUCCESS
        total_revenue_today = OrderItem.objects.filter(
            assigned_vendor=user,
            payment_status='SUCCESS',
            created_at__date=timezone.now().date()
        ).aggregate(total=Sum('vendor_selling_price'))['total'] or 0

        # 3. Calculate total vendor_selling_price for the previous day
        previous_day_total_revenue = OrderItem.objects.filter(
            assigned_vendor=user,
            payment_status='SUCCESS',
            created_at__date=(timezone.now() - timedelta(days=1)).date()
        ).aggregate(total=Sum('vendor_selling_price'))['total'] or 0

        # 3a. Calculate the percentage change
        percentage_change = 0
        if previous_day_total_revenue > 0:
            percentage_change = ((total_revenue_today - previous_day_total_revenue) / previous_day_total_revenue) * 100

        # 4. Count the total number of OrderItems for the user
        total_order_count = OrderItem.objects.filter(
            assigned_vendor=user
        ).count()

        # 5. Count delivered and vendor accepted items
        delivered_count = OrderItem.objects.filter(
            assigned_vendor=user,
            order_status='DELIVERED'
        ).count()

        vendor_accepted_count = OrderItem.objects.filter(
            assigned_vendor=user,
            order_status='VENDOR_ACCEPTED'
        ).count()

        # 6. Calculate last 7 days revenue for each day
        last_7_days = timezone.now().date() - timedelta(days=7)
        daily_revenue = OrderItem.objects.filter(
            assigned_vendor=user,
            payment_status='SUCCESS',
            created_at__date__gte=last_7_days
        ).annotate(date=F('created_at__date')).values('date').annotate(
            daily_total=Sum('vendor_selling_price')
        ).order_by('date')

        # Format the daily revenue into a dictionary with dates as keys
        daily_revenue_data = {entry['date'].strftime('%Y-%m-%d'): entry['daily_total'] for entry in daily_revenue}

        # Response payload
        response_data = {
            'data': {
                'total_revenue': total_revenue,
                'total_revenue_today': total_revenue_today,
                'previous_day_total_revenue': previous_day_total_revenue,
                'percentage_change': percentage_change,
                'total_order_count': total_order_count,
                'delivered_count': delivered_count,
                'vendor_accepted_count': vendor_accepted_count,
                'daily_revenue_last_7_days': daily_revenue_data,
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'data retrieved successfully.',
            'status': True,
        }
        return JsonResponse(response_data, safe=False, status=status.HTTP_200_OK)

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
# ***** =====  END  ===== ******



# ***** Views for admin panel get unverified mechanic and verify them *****
# ! To view all unverified mechanic users from admin panel
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def view_unverified_mechanics(request):
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
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': INVALID_DATA_MESSAGE,
                    'status': False
                }
                return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

            # Retrieve unverified mechanics
            unverified_mechanics = User.objects.filter(account_type='mechanic', is_verified=False).order_by('date_joined')

            # Paginate the queryset using limit and offset
            paginated_data = list(unverified_mechanics[offset:offset + limit])

            # Serialize the paginated data
            serializer = UserSerializer(paginated_data, many=True, context={'request': request})

            # Get the total number of unverified mechanics
            total_items = unverified_mechanics.count()

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
                    'users': serializer.data,
                    'total_count': total_items,
                    'page_count': page_count,
                    'current_page': current_page,
                    'limit': limit,
                    'offset': offset,
                    'has_next': has_next,
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'Unverified mechanics retrieved successfully.',
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


# ! To update is_verified status for a mechanic user
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_mechanic_verification(request, user_id):
    try:
        # Retrieve the user by ID
        user = User.objects.get(id=user_id)

        # Check if the user is a mechanic and is_verified is False
        if user.account_type == 'mechanic' and not user.is_verified:
            user.is_verified = True
            user.save()

            # Notify the mechanic about the completion of their account verification
            notify_vendor_about_verification(user)

            response_data = {
                'data': {
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'User verification status updated successfully.',
                'status': True
            }
            return JsonResponse(response_data, status=status.HTTP_200_OK)
        else:
            response_data = {
                'data': {
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': 'User is either not a mechanic or already verified.',
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

    except User.DoesNotExist:
        response_data = {
            'data': {
                'status': 'error',
                'code': status.HTTP_404_NOT_FOUND
            },
            'message': 'User not found.',
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)
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
# ***** =====  END  ===== ******