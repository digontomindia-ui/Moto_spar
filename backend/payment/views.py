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

        # Reuse the same provider order on retry. Replacing it while a prior
        # payment is still being verified can produce a second charge.
        if not order.provider_order_id:
            razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            razorpay_order = razorpay_client.order.create({
                'amount': int(order.total_price * 100),
                'currency': 'INR',
                'payment_capture': '1',
            })
            order.provider_order_id = razorpay_order['id']
            order.payment_status = 'PENDING'
            order.save(update_fields=['provider_order_id', 'payment_status'])

        # Prepare the response
        response_data = {
            'data': {
                'order': OrderSerializer(order).data,
                'razorpay_order_id': order.provider_order_id,
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


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
def razorpay_callback(request):
    payment_id = request.data.get('razorpay_payment_id')
    provider_order_id = request.data.get('razorpay_order_id')
    signature = request.data.get('razorpay_signature')
    if not all(isinstance(value, str) and value for value in (
        payment_id, provider_order_id, signature,
    )):
        return Response({'message': 'Complete payment verification details are required.'}, status=400)

    order = Order.objects.filter(
        provider_order_id=provider_order_id,
        customer=request.user,
        payment_method='PAYMENT_GATEWAY',
    ).first()
    if order is None:
        return Response({'message': 'Payment order not found.'}, status=404)

    client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    try:
        client.utility.verify_payment_signature({
            'razorpay_payment_id': payment_id,
            'razorpay_order_id': provider_order_id,
            'razorpay_signature': signature,
        })
    except razorpay.errors.SignatureVerificationError:
        return Response({'message': 'Payment signature verification failed.'}, status=400)

    try:
        provider_payment = client.payment.fetch(payment_id)
    except razorpay.errors.RazorpayError:
        return Response({'message': 'Payment status could not be confirmed. Retry verification later.'}, status=502)
    expected_amount = int(order.total_price * 100)
    if (provider_payment.get('order_id') != provider_order_id
            or provider_payment.get('status') != 'captured'
            or provider_payment.get('currency') != 'INR'
            or provider_payment.get('amount') != expected_amount):
        return Response({'message': 'Payment is not captured for this order and amount.'}, status=409)

    with transaction.atomic():
        order = Order.objects.select_for_update().get(pk=order.pk)
        if order.payment_status == 'SUCCESS':
            if order.payment_id != payment_id:
                return Response({'message': 'Order was paid by a different payment.'}, status=409)
        else:
            if Order.objects.filter(payment_id=payment_id).exclude(pk=order.pk).exists():
                return Response({'message': 'Payment is already linked to another order.'}, status=409)
            order.payment_id = payment_id
            order.signature_id = signature
            order.payment_status = 'SUCCESS'
            order.is_successful = True
            order.save(update_fields=['payment_id', 'signature_id', 'payment_status', 'is_successful'])
            order_items = list(OrderItem.objects.filter(order=order))
            for item in order_items:
                item.order_status = 'ADMIN_REVIEW'
                item.payment_status = 'SUCCESS'
                item.save(update_fields=['order_status', 'payment_status'])

            # Preserve unrelated items added since this order was placed.
            cart = Cart.objects.filter(user=order.customer, is_active=True).first()
            if cart and order.checkout_source == 'FROM_CART':
                for item in order_items:
                    cart_item = CartItem.objects.filter(
                        cart=cart, variant=item.variant, is_active=True,
                    ).first()
                    if cart_item:
                        if cart_item.quantity > item.quantity:
                            cart_item.quantity -= item.quantity
                            cart_item.save(update_fields=['quantity'])
                        else:
                            cart_item.delete()

    return Response({
        'data': {
            'order': OrderSerializer(order).data,
            'status': 'success',
            'code': status.HTTP_200_OK,
        },
        'message': 'Payment verified and captured.',
        'status': True,
    })
# ***** =====  END  ===== ******
