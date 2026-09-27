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
from decimal import Decimal

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

# Payment gateway
import razorpay
from carpal.settings import (
    RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET,
)

# Local Imports
from app.permissions import (
    IsCustomer, IsVendor, IsAdminUser
    )
from app.messages import (
    DEFAULT_ERROR_MESSAGE, INVALID_METHOD_MESSAGE, INTERNAL_SERVER_ERROR_MESSAGE, INVALID_DATA_MESSAGE,
    CATEGORY_NOT_FOUND_MESSAGE, SUBCATEGORY_NOT_FOUND_MESSAGE, PRODUCT_NOT_FOUND_MESSAGE,
    LIMIT_OFFSET_MESSAGE, PAGINATED_PRODUCTS_MESSAGE, WISHLIST_NOT_FOUND_MESSAGE, ORDER_NOT_FOUND_MESSAGE
    )
from order.models import Order, OrderItem
from order.serializers import OrderSerializer, OrderItemSerializer


from product.models import Product, ProductVariant
from cart.models import Cart, CartItem


# Create your views here.


# ***** To make payments via razorpay payment gateway *****
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
def create_payment_razorpay(request):
    # {
    # "order_id": "123e4567-e89b-12d3-a456-426614174000"
    # }
    try:
        # Extract data from the request
        data = request.data.copy()
        order_id = data.get('order_id')

        # Retrieve the order from the database
        try:
            order = Order.objects.get(id=order_id, customer=request.user)
        except Order.DoesNotExist:
            response_data = {
                'data': {
                    'details': 'Order not found or you are not authorized to access this order.',
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': ORDER_NOT_FOUND_MESSAGE,
                'status': False
            }
            return Response(response_data, status=status.HTTP_404_NOT_FOUND)
        
        # Check payment method and status
        if order.payment_method != 'PAYMENT_GATEWAY' or order.payment_status == 'SUCCESS':
            response_data = {
                'data': {
                    'details': 'Payment method is not PAYMENT_GATEWAY or payment is already successful.',
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': 'Invalid payment method or payment already successful',
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

        # Create an order in Razorpay
        razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        razorpay_order = razorpay_client.order.create({
            'amount': int(order.total_price * 100),  # Amount should be in paisa
            'currency': 'INR',
            'payment_capture': '1'  # Automatic capture
        })

        # Update the order with Razorpay details
        order.provider_order_id = razorpay_order['id']
        order.payment_status = 'PENDING'
        order.save()

        # Prepare the response
        response_data = {
            'data': {
                'order': OrderSerializer(order).data,
                'razorpay_order_id': razorpay_order['id'],
                'status': 'success',
                'code': status.HTTP_201_CREATED
            },
            "prefill": {
                "name": order.customer.get_full_name(),
                "email": order.customer.email,
                "contact": order.customer.phone_number,
                "amount": order.total_price,
                "currency": "INR",
                "razorpay_key": settings.RAZORPAY_KEY_ID,
                
            },
            'message': 'Order and payment initiated successfully',
            'status': True
        }
        return Response(response_data, status=status.HTTP_201_CREATED)

    except razorpay.errors.RazorpayError as e:
        response_data = {
            'data': {
                'details': str(e),
                'status': 'error',
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR
            },
            'message': 'Razorpay error occurred',
            'status': False
        }
        return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        response_data = {
            'data': {
                'details': str(e),
                'status': 'error',
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR
            },
            'message': 'Internal server error',
            'status': False
        }
        return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def razorpay_callback(request):
    def verify_signature(response_data):
        client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
        return client.utility.verify_payment_signature(response_data)
    
    if request.method == "POST":
        if "razorpay_signature" in request.data:
            payment_id = request.data.get("razorpay_payment_id", "")
            provider_order_id = request.data.get("razorpay_order_id", "")
            signature_id = request.data.get("razorpay_signature", "")
        
            try:
                order = Order.objects.get(provider_order_id=provider_order_id)
            except Order.DoesNotExist:
                response_data = {
                    'data': {
                        'details': 'Order not found.',
                        'status': 'error',
                        'code': status.HTTP_404_NOT_FOUND
                    },
                    'message': ORDER_NOT_FOUND_MESSAGE,
                    'status': False
                }
                return Response(response_data, status=status.HTTP_404_NOT_FOUND)
            
            order.payment_id = payment_id
            order.signature_id = signature_id
            order.save()

            # if not verify_signature(request.data):
            if verify_signature(request.data):
                order.payment_status = "SUCCESS"
                order.is_successful = True
                order.save()

                # Update the order status of all related OrderItems
                order_items = OrderItem.objects.filter(order=order)
                for item in order_items:
                    item.order_status = "ADMIN_REVIEW"
                    item.payment_status = "SUCCESS"
                    item.save()

                # Delete cart items only after successful payment
                cart = get_object_or_404(Cart, user=order.customer, is_active=True)
                cart_items = CartItem.objects.filter(cart=cart, is_active=True)
                cart_items.delete()
                    
                response_data = {
                    'data': {
                        'order': OrderSerializer(order).data,
                        'status': 'success',
                        'code': status.HTTP_200_OK
                    },
                    'message': 'Payment successful',
                    'status': True
                }
                return Response(response_data, status=status.HTTP_200_OK)   
            else:
                order.status = "FAILURE"
                order.save()

                response_data = {
                    'data': {
                        'details': 'Payment failed.',
                        'status': 'error',
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': 'Payment failed',
                    'status': False
                }
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
        else:
            payment_id = request.data.get("error[metadata][payment_id]")
            provider_order_id = request.data.get("error[metadata][order_id]")
            try:
                order = Order.objects.get(provider_order_id=provider_order_id)
            except Order.DoesNotExist:
                response_data = {
                    'data': {
                        'details': 'Order not found.',
                        'status': 'error',
                        'code': status.HTTP_404_NOT_FOUND
                    },
                    'message': ORDER_NOT_FOUND_MESSAGE,
                    'status': False
                }
                return Response(response_data, status=status.HTTP_404_NOT_FOUND)
            
            order.payment_id = payment_id
            order.status = "FAILURE"
            order.save()

            response_data = {
                'data': {
                    'details': 'Payment failed.',
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': 'Payment failed',
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
    
    response_data = {
        'data': {
            'details': 'Method not allowed.',
            'status': 'error',
            'code': status.HTTP_405_METHOD_NOT_ALLOWED
        },
        'message': 'Method not allowed',
        'status': False
    }
    return Response(response_data, status=status.HTTP_405_METHOD_NOT_ALLOWED)
# ***** =====  END  ===== ******