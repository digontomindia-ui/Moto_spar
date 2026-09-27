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
from decimal import Decimal, ROUND_HALF_UP

# Third-party Imports
from django.conf import settings
from django.contrib.auth import login, logout, authenticate
from django.core.exceptions import ObjectDoesNotExist, PermissionDenied
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db import transaction
from django.db.models import Count, F, Q, ExpressionWrapper, FloatField
from django.db.models.functions import ACos, Cos, Radians, Sin, TruncDate
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
    DEFAULT_ERROR_MESSAGE, INVALID_METHOD_MESSAGE, INTERNAL_SERVER_ERROR_MESSAGE, INVALID_DATA_MESSAGE,
    CATEGORY_NOT_FOUND_MESSAGE, SUBCATEGORY_NOT_FOUND_MESSAGE, PRODUCT_NOT_FOUND_MESSAGE, PERMISSION_DENIED_MESSAGE,
    LIMIT_OFFSET_MESSAGE, PAGINATED_PRODUCTS_MESSAGE, WISHLIST_NOT_FOUND_MESSAGE, ORDER_ITEM_NOT_FOUND_MESSAGE, 
    DRIVER_NOT_FOUND_MESSAGE
    )
from app.utils import (
    generate_otp
    )
from .utils import notify_vendor_about_order_assignment
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderItemSerializer
from driver.serializers import DriverSerializer
from cart.serializers import CartItemSerializer

from product.models import Product, ProductVariant
from cart.models import Cart, CartItem
from vendor.models import VendorProfile, VendorStock
from app.models import User
from driver.models import Driver


# Create your views here.

# {
#     "customer": 1,  // User ID
#     "shipping_address": 1,  // ShippingAddress ID
#     "billing_address": 2,  // BillingAddress ID
#     "payment_method": "CASH_ON_DELIVERY",  // Payment method
#     "order_items": [
#         {
#             "variant": "8fcf89ec-8eeb-4a2b-8771-2f1937c1eabd",  // ProductVariant ID
#             "quantity": 2
#         },
#         {
#             "variant": "5dbf90ec-8f4c-4d2a-8771-3f1957c1eabd",  // ProductVariant ID
#             "quantity": 1
#         }
#     ]
# }


# ***** To create order by customer *****
# ? To create order directly without adding to cart
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
def create_order(request):
    try:
        if request.method == 'POST':
            # Copy and manipulate request data
            data = request.data.copy()
            user = request.user

            # Extracting order items data to manipulate
            order_items_data = data.pop('order_items', [])

            # Initialize total_price to calculate
            total_price = Decimal('0.0')

            # Initialize total mechanic fees
            total_mechanic_fees = Decimal('0.0')

            # Extract delivery_charge and driver_fees
            delivery_charge = Decimal(str(data.get('delivery_charge', 0)))
            driver_fees = Decimal(str(data.get('driver_fees', 0)))

            # Determine the initial order status for items based on payment method
            payment_method = data.get('payment_method')
            if payment_method == 'CASH_ON_DELIVERY':
                initial_order_status = 'ADMIN_REVIEW'
            else:
                initial_order_status = 'PENDING'

            # Process each order item
            for item in order_items_data:
                variant_id = item.get('variant')
                quantity = item.get('quantity')
                mechanic_fees = Decimal(str(item.get('mechanic_fees', 0)))  # Mechanic fees per item
                mechanic_fees_for_customer = mechanic_fees  # Mechanic fees for customer per item
                mechanic_fees_for_mechanic = mechanic_fees * Decimal('0.9')  # Mechanic fees for mechanic per item

                # Retrieve the variant object
                variant = get_object_or_404(ProductVariant, id=variant_id, is_active=True)

                # Calculate price after discount (using Decimal for precise financial math)
                discount_decimal = Decimal(variant.discount) / Decimal(100) if variant.discount else Decimal(0)
                price = variant.final_listing_price_on_motospar * (Decimal(1) - discount_decimal)
                
                # Calculate item_total_price for the current item
                item_total_price = price * Decimal(quantity)

                # Update item data with calculated price, item_total_price, and initial order status
                item['price'] = float(price.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))
                item['item_total_price'] = float(item_total_price.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))
                # item['mechanic_fees'] = mechanic_fees  # Add mechanic_fees to the item data
                item['mechanic_fees_for_customer'] = float(mechanic_fees_for_customer)
                item['mechanic_fees_for_mechanic'] = float(mechanic_fees_for_mechanic)
                item['order_status'] = initial_order_status

                # Add to total price and total mechanic fees
                total_price += item_total_price
                total_mechanic_fees += mechanic_fees * Decimal(quantity)  # Accumulate mechanic fees per item

            # Add all charges (mechanic_fees, delivery_charge, driver_fees) to total price
            total_price += total_mechanic_fees + delivery_charge + driver_fees

            # Add calculated total_price to data
            data['total_price'] = float(total_price.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))
            data['customer'] = user.id
            data['delivery_charge'] = float(delivery_charge)
            data['driver_fees'] = float(driver_fees)

            # Serialize the order data
            serializer = OrderSerializer(data=data)

            # Validate and save the order along with order items
            if serializer.is_valid():
                with transaction.atomic():
                    order = serializer.save()

                    # Create order items
                    for item in order_items_data:
                        item['order'] = order.id
                        order_item_serializer = OrderItemSerializer(data=item)
                        if order_item_serializer.is_valid():
                            order_item_serializer.save()
                        else:
                            # Gather error messages from order item serializer
                            error_messages = [f'{field}: {", ".join(messages)}' for field, messages in order_item_serializer.errors.items()]
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
                            return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)


                    # ! If payment method is not CASH_ON_DELIVERY, add items back to cart
                    if payment_method != 'CASH_ON_DELIVERY':
                        cart, _ = Cart.objects.get_or_create(user=user, is_active=True)
                        for item in order_items_data:
                            # Add each item to the cart
                            cart_item_data = {
                                'cart': cart.id,
                                'variant': item['variant'],
                                'quantity': item['quantity'],
                                'price_at_addition': item['price']
                            }
                            cart_item_serializer = CartItemSerializer(data=cart_item_data)
                            if cart_item_serializer.is_valid():
                                cart_item_serializer.save()
                            else:
                                # Handle cart item serializer errors
                                error_messages = [f'{field}: {", ".join(messages)}' for field, messages in cart_item_serializer.errors.items()]
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
                                return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)


                response_data = {
                    'data': {
                        'order': serializer.data,
                        'status': 'success',
                        'code': status.HTTP_201_CREATED
                    },
                    'message': 'Order created successfully',
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
                    'message': INVALID_DATA_MESSAGE,
                    'status': False
                }
                return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)
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
            'message': INTERNAL_SERVER_ERROR_MESSAGE,
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ? To create order from cart
# ? This will take the variants from cart to place order
# ? also delete the cart items while order is confirmed
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
def create_order_from_cart(request):
    try:
        # Copy and manipulate request data
        data = request.data.copy()
        user = request.user

        # Get the user's cart and cart items
        cart = get_object_or_404(Cart, user=user, is_active=True)
        cart_items = CartItem.objects.filter(cart=cart, is_active=True)

        # Initialize total_price to calculate
        total_price = Decimal('0.0')
        
        # Initialize total mechanic fees
        total_mechanic_fees = Decimal('0.0')
        
        # Initialize total delivery charge and driver fees
        total_delivery_charge = Decimal('0.0')
        total_driver_fees = Decimal('0.0')

        # Determine the initial order status for items based on payment method
        payment_method = data.get('payment_method')
        if payment_method == 'CASH_ON_DELIVERY':
            initial_order_status = 'ADMIN_REVIEW'
        else:
            initial_order_status = 'PENDING'

        # List to hold order items data
        order_items_data = []

        # Process each cart item
        for cart_item in cart_items:
            variant = cart_item.variant
            quantity = cart_item.quantity
            delivery_charge = Decimal(str(cart_item.delivery_charge)) if cart_item.delivery_charge else Decimal('0.0')
            driver_fees = Decimal(str(cart_item.driver_fees)) if cart_item.driver_fees else Decimal('0.0')
            mechanic_fees = Decimal(str(cart_item.mechanic_fees)) if cart_item.mechanic_fees else Decimal('0.0')
            mechanic_fees_for_customer = mechanic_fees
            mechanic_fees_for_mechanic = mechanic_fees * Decimal('0.9')

            # Calculate price after discount (using Decimal)
            discount_decimal = Decimal(variant.discount) / Decimal(100) if variant.discount else Decimal(0)
            price = variant.final_listing_price_on_motospar * (Decimal(1) - discount_decimal)

            # Calculate item_total_price for the current item
            item_total_price = price * Decimal(quantity)

            # Add item data to order items list
            order_items_data.append({
                'variant': variant.id,
                'quantity': quantity,
                'price': float(price.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)),
                'item_total_price': float(item_total_price.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)),
                'delivery_charge': float(delivery_charge),
                'driver_fees': float(driver_fees),
                # 'mechanic_fees': float(mechanic_fees),
                'mechanic_fees_for_customer': float(mechanic_fees_for_customer),
                'mechanic_fees_for_mechanic': float(mechanic_fees_for_mechanic),
                'order_status': initial_order_status
            })

            # Add to total price
            total_price += item_total_price

            # Accumulate mechanic fees, delivery charge, and driver fees
            # total_mechanic_fees += mechanic_fees * quantity
            total_mechanic_fees += mechanic_fees_for_customer * Decimal(quantity)
            total_delivery_charge += delivery_charge
            total_driver_fees += driver_fees

        # Add all charges (mechanic_fees, delivery_charge, driver_fees) to total price
        total_price += total_mechanic_fees + total_delivery_charge + total_driver_fees

        # Add calculated total_price to data
        data['total_price'] = float(total_price.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))
        data['customer'] = user.id
        data['delivery_charge'] = float(total_delivery_charge)
        data['driver_fees'] = float(total_driver_fees)
        
        # Do not include 'order_items' in the serializer data (as it's read-only)
        data.pop('order_items', None)

        # Serialize the order data
        serializer = OrderSerializer(data=data)

        # Validate and save the order along with order items
        if serializer.is_valid():
            with transaction.atomic():
                order = serializer.save()

                # Create order items
                for item in order_items_data:
                    item['order'] = order.id
                    order_item_serializer = OrderItemSerializer(data=item)
                    if order_item_serializer.is_valid():
                        order_item_serializer.save()
                    else:
                        # Gather error messages from order item serializer
                        error_messages = [f'{field}: {", ".join(messages)}' for field, messages in order_item_serializer.errors.items()]
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
                        return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

                # Delete all cart items after successful order creation
                # cart_items.delete()  # Remove this line
                if payment_method == 'CASH_ON_DELIVERY':
                    cart_items.delete()  # Remove cart items if payment method is cash on delivery

                response_data = {
                    'data': {
                        'order': serializer.data,
                        'status': 'success',
                        'code': status.HTTP_201_CREATED
                    },
                    'message': 'Order created successfully',
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
                'message': INVALID_DATA_MESSAGE,
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


# ***** To view order by customer, vendor *****
# ? This will return all the orders for a customer
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
def view_customer_orders(request):
    try:
        if request.method == 'POST':
            # Extract and validate pagination parameters
            limit = int(request.data.get('limit', 10))
            offset = int(request.data.get('offset', 0))

            # Ensure valid pagination values
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
            
            # Get all orders where the user is the customer (request.user)
            # orders = Order.objects.filter(customer=request.user, is_active=True).order_by('-created_at')

            # Filter orders based on payment method and payment status
            orders = Order.objects.filter(
                customer=request.user,
                is_active=True
            ).filter(
                (Q(payment_method='CASH_ON_DELIVERY') | Q(payment_method='PAYMENT_GATEWAY', payment_status='SUCCESS'))
            ).order_by('-created_at')

            # Paginate the orders using the provided limit and offset
            paginated_orders = list(orders[offset:offset + limit])

            # Get the total number of orders
            total_items = orders.count()

            # Serialize the paginated data
            serializer = OrderSerializer(paginated_orders, many=True, context={'request': request})

            # Calculate the page count and current page
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


# ? This will return all the orders which assign to a vendor
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsVendor])
def view_vendor_orders(request):
    try:
        if request.method == 'POST':
            # Extract and validate pagination parameters
            limit = int(request.data.get('limit', 10))
            offset = int(request.data.get('offset', 0))

            # Ensure valid pagination values
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

            # Fetch all OrderItems where the assigned_vendor is the current user
            order_items = OrderItem.objects.filter(assigned_vendor=request.user)

            # Filter Orders that have at least one valid OrderItem for the current user
            orders_with_items = order_items.values('order').distinct()

            # Get the orders that have these valid OrderItems
            orders = Order.objects.filter(id__in=orders_with_items).order_by('-created_at')

            # Paginate the orders using the provided limit and offset
            paginated_orders = list(orders[offset:offset + limit])

            # Get the total number of orders
            total_items = orders.count()

            # Prepare the orders with only the relevant OrderItems
            response_orders = []
            for order in paginated_orders:
                # Filter the OrderItems for this order where assigned_vendor is the current user
                filtered_items = order_items.filter(order=order)
                serialized_items = OrderItemSerializer(filtered_items, many=True, context={'request': request}).data

                # Handle potential None values safely
                shipping_address_id = order.shipping_address.id if order.shipping_address else None
                billing_address_id = order.billing_address.id if order.billing_address else None
                customer_id = order.customer.id if order.customer else None
                
                # Append to the response with the filtered items
                response_orders.append({
                    'order_id': order.id,
                    'order_code': order.order_code,
                    'shipping_address': shipping_address_id,
                    'billing_address': billing_address_id,
                    'customer': customer_id,
                    'status': order.payment_status,
                    'order_date': order.created_at,
                    'order_items': serialized_items
                })

            # Calculate the page count and current page
            page_count = (total_items + limit - 1) // limit if limit > 0 else 0
            current_page = (offset // limit) + 1 if limit > 0 else 0

            # Check if there's a next page
            has_next = (offset + limit) < total_items

            # Build the response
            response_data = {
                'data': {
                    'orders': response_orders,
                    'total_count': total_items,
                    'page_count': page_count,
                    'current_page': current_page,
                    'limit': limit,
                    'offset': offset,
                    'has_next': has_next,
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': "Orders with assigned vendor items retrieved successfully.",
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
# ***** =====  END  ===== ******


# ***** To search nearest vendors by admin and assign orders *****
# ? This will return the nearest 5 vendors for an order item
# ? who has the particular variant in stock and also have the 
# ? required quantity
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def find_nearest_vendors_for_order_item(request, order_item_id):
    try:
        # Step 1: Retrieve the OrderItem and its related information
        order_item = OrderItem.objects.get(id=order_item_id)
        variant = order_item.variant
        shipping_address = order_item.order.shipping_address

        if not (shipping_address.latitude and shipping_address.longitude):
            response_data = {
                'data': {
                    'details': 'Shipping address does not have geolocation data',
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': INVALID_DATA_MESSAGE,
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

        customer_lat = float(shipping_address.latitude)
        customer_lon = float(shipping_address.longitude)

        # Step 2: Filter VendorStock to find vendors who have the required variant in stock
        vendor_stocks = VendorStock.objects.filter(
            variant=variant,
            in_stock=True,
            stock_quantity__gte=order_item.quantity,
            vendorprofile__is_active=True
        ).select_related('vendorprofile')

        # Step 3: Get vendor profiles and annotate them with distance
        vendor_profiles = VendorProfile.objects.filter(
            id__in=vendor_stocks.values('vendorprofile__id')
        ).annotate(
            distance=ExpressionWrapper(
                6371 * ACos(
                    Cos(Radians(customer_lat)) * Cos(Radians(F('latitude'))) *
                    Cos(Radians(F('longitude')) - Radians(customer_lon)) +
                    Sin(Radians(customer_lat)) * Sin(Radians(F('latitude')))
                ),
                output_field=FloatField(),
            )
        ).order_by('distance')[:5]

        # Step 4: Prepare the response
        vendor_data = []
        for vendor in vendor_profiles:
            vendor_stock = vendor_stocks.filter(vendorprofile=vendor).first()
            variant_price = Decimal(variant.final_listing_price_on_motospar)  # MRP
            variant_discount = Decimal(variant.discount or 0) # discount given by the admin on MRP
            discounted_price = (variant_price * (Decimal(100) - variant_discount) / Decimal(100)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)  # discounted price after discount charged from customer
            selling_price = Decimal(order_item.price)  # price which customer paid while placing order
            vendor_asking_price = Decimal(vendor_stock.price)  # vendor price which vendor added while adding stocks
            vendor_selling_price = (discounted_price * Decimal(0.8)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)   # 20% discount on the discounted price, ask by admin to vendor

            vendor_data.append({
                'vendor_id': vendor.user.id,
                'vendor_name': vendor.user.get_full_name(),
                'stock_quantity': vendor_stock.stock_quantity,
                'store_name': vendor.store_name,
                'store_contact_email': vendor.store_contact_email,
                'store_contact_phone': vendor.store_contact_phone,
                'latitude': vendor.latitude,
                'longitude': vendor.longitude,
                'distance': round(vendor.distance, 2) if vendor.distance is not None else None,
                'price': str(variant_price),
                'discount': str(variant_discount) + '%',
                'discounted_price': str(discounted_price),
                'selling_price': str(selling_price),
                'vendor_asking_price': str(vendor_asking_price),
                'vendor_selling_price': str(vendor_selling_price)
            })

        response_data = {
            'data': {
                'nearest_vendors': vendor_data,
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'Nearest vendors found successfully',
            'status': True
        }
        return JsonResponse(response_data, status=status.HTTP_200_OK)

    except OrderItem.DoesNotExist:
        response_data = {
            'data': {
                'details': ORDER_ITEM_NOT_FOUND_MESSAGE,
                'status': 'error',
                'code': status.HTTP_404_NOT_FOUND
            },
            'message': INVALID_DATA_MESSAGE,
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


# ? To asign an orderitem to a "vendor" by "admin"
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def assign_vendor_to_order_item(request):
    try:
        # Get data from request
        order_item_id = request.data.get('order_item_id')
        vendor_id = request.data.get('vendor_id')
        vendor_selling_price = request.data.get('vendor_selling_price')

        # Validate required fields
        if not order_item_id or not vendor_id or vendor_selling_price is None:
            response_data = {
                'data': {
                    'details': 'Missing required fields',
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': INVALID_DATA_MESSAGE,
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve the OrderItem
        try:
            order_item = OrderItem.objects.get(id=order_item_id)
        except OrderItem.DoesNotExist:
            response_data = {
                'data': {
                    'details': ORDER_ITEM_NOT_FOUND_MESSAGE,
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': 'Order item not found',
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

        # Retrieve the vendor
        try:
            vendor = User.objects.get(id=vendor_id, vendor_profile__is_active=True)
        except User.DoesNotExist:
            response_data = {
                'data': {
                    'details': 'Vendor not found or inactive',
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': 'Vendor not found',
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

        # Assign vendor and update the vendor selling price
        order_item.assigned_vendor = vendor
        order_item.vendor_selling_price = vendor_selling_price
        order_item.order_status = 'ASSIGNED_TO_VENDOR'
        order_item.save()

        # Notify the vendor about the order assignment
        notify_vendor_about_order_assignment(vendor, order_item)

        # Serialize the updated OrderItem data
        serializer = OrderItemSerializer(order_item)

        response_data = {
            'data': {
                'order_item': serializer.data,
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'Vendor assigned successfully',
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


# ? Update the order item status like delivered order-accepted
# ? change payment status etc.
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_order_item_status(request, order_item_id):
    try:
        # Step 1: Retrieve the OrderItem and its related order
        order_item = OrderItem.objects.select_related('order').get(id=order_item_id)
        order = order_item.order
        
        # Step 2: Check user permissions
        if request.user.account_type == 'admin':
            # Admin can update all relevant fields
            data = request.data
            order_status = data.get('order_status', order_item.order_status)
            payment_status = data.get('payment_status', order_item.payment_status)
            vendor_payment_status = data.get('vendor_payment_status', order_item.vendor_payment_status)

            order_item.order_status = order_status
            order_item.payment_status = payment_status
            order_item.vendor_payment_status = vendor_payment_status
            order_item.save()

            # Update the order with driver_for_me_url if provided
            driver_for_me_url = data.get('driver_for_me_url')
            if driver_for_me_url:
                order.driver_for_me_url = driver_for_me_url
                order.save()

            # If all items are marked as payment_status == SUCCESS, update the order's payment_status
            if all(item.payment_status == 'SUCCESS' for item in order.order_items.all()):
                order.payment_status = 'SUCCESS'
                order.save()

        elif request.user.account_type == 'vendor':
            # Vendor-specific checks
            if request.user != order_item.assigned_vendor:
                response_data = {
                    'data': {
                        'details': 'You do not have permission to update this order item.',
                        'status': 'error',
                        'code': status.HTTP_403_FORBIDDEN
                    },
                    'message': PERMISSION_DENIED_MESSAGE,
                    'status': False
                }
                return JsonResponse(response_data, status=status.HTTP_403_FORBIDDEN)

            # Vendor can only update the `order_status`
            data = request.data
            new_status = data.get('order_status')

            if new_status not in ['VENDOR_ACCEPTED', 'DELIVERED', 'CANCELLED', 'DRIVER_FOR_PICK', 'DRIVER_FOR_DROP', 'WORK_COMPLETED']:
                response_data = {
                    'data': {
                        'details': 'Invalid status update for vendors.',
                        'status': 'error',
                        'code': status.HTTP_403_FORBIDDEN
                    },
                    'message': 'Invalid status update',
                    'status': False
                }
                return JsonResponse(response_data, status=status.HTTP_403_FORBIDDEN)
            
            # Logic for VENDOR_ACCEPTED
            if new_status == 'VENDOR_ACCEPTED':
                # Update the order item status
                order_item.order_status = 'VENDOR_ACCEPTED'
                order_item.save()

                response_data = {
                    'data': {
                        'order_item': OrderItemSerializer(order_item).data,
                        'status': 'success',
                        'code': status.HTTP_200_OK
                    },
                    'message': 'Order item status updated to VENDOR_ACCEPTED successfully',
                    'status': True
                }
                return JsonResponse(response_data, status=status.HTTP_200_OK)
            
            # Logic for CANCELLED and new statuses
            elif new_status in ['CANCELLED', 'DRIVER_FOR_PICK', 'DRIVER_FOR_DROP', 'WORK_COMPLETED']:
                # Update the order item status
                order_item.order_status = new_status
                order_item.save()

                response_data = {
                    'data': {
                        'order_item': OrderItemSerializer(order_item).data,
                        'status': 'success',
                        'code': status.HTTP_200_OK
                    },
                    'message': f'Order item status updated to {new_status} successfully',
                    'status': True
                }
                return JsonResponse(response_data, status=status.HTTP_200_OK)
            
            # Additional logic for DELIVERED status
            elif new_status == 'DELIVERED':
                # 1. Fetch the related variant
                variant = order_item.variant

                # 2. Decrease the stock quantity in VendorStock
                vendor_profile = order_item.assigned_vendor.vendor_profile
                vendor_stock = VendorStock.objects.get(vendorprofile=vendor_profile, variant=variant)

                if vendor_stock.stock_quantity >= order_item.quantity:
                    vendor_stock.stock_quantity -= order_item.quantity
                    vendor_stock.save()    # ! Updating the vendor stock
                    
                    # 3. Increase the sold_quantity in ProductVariant
                    variant.sold_quantity += order_item.quantity    # ! Updating the sold quantity of the variant
                    variant.save()

                    # Update order item status
                    order_item.order_status = new_status    # ! Updating the order item status
                    order_item.save()

                else:
                    response_data = {
                        'data': {
                            'details': 'Insufficient stock for this variant.',
                            'status': 'error',
                            'code': status.HTTP_400_BAD_REQUEST
                        },
                        'message': 'Insufficient stock for the vendor.',
                        'status': False
                    }
                    return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

        else:
            # If the user is neither admin nor vendor, raise PermissionDenied
            response_data = {
                'data': {
                    'details': 'You do not have the required permissions.',
                    'status': 'error',
                    'code': status.HTTP_403_FORBIDDEN
                },
                'message': PERMISSION_DENIED_MESSAGE,
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_403_FORBIDDEN)

        response_data = {
            'data': {
                'order_item': OrderItemSerializer(order_item).data,
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'Order item status updated successfully',
            'status': True
        }
        return JsonResponse(response_data, status=status.HTTP_200_OK)

    except OrderItem.DoesNotExist:
        response_data = {
            'data': {
                'details': ORDER_ITEM_NOT_FOUND_MESSAGE,
                'status': 'error',
                'code': status.HTTP_404_NOT_FOUND
            },
            'message': ORDER_ITEM_NOT_FOUND_MESSAGE,
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)
    except PermissionDenied as e:
        response_data = {
            'data': {
                'details': str(e),
                'status': 'error',
                'code': status.HTTP_403_FORBIDDEN
            },
            'message': PERMISSION_DENIED_MESSAGE,
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_403_FORBIDDEN)
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



# {
#     "order_item_id": "some-order-item-id",
#     "vendor_assignments": [
#         {
#             "vendor_id": "some-vendor-id",
#             "price": 100.50,
#             "distance": 5.2
#         },
#         {
#             "vendor_id": "another-vendor-id",
#             "price": 110.75,
#             "distance": 3.8
#         }
#     ]
# }

# @api_view(['POST'])
# @permission_classes([IsAuthenticated, IsAdminUser])
# def assign_vendor_to_order_item(request):
#     try:
#         data = request.data

#         # Validate that the request has the necessary structure
#         if 'order_item_id' not in data or 'vendor_assignments' not in data:
#             response_data = {
#                 'data': {
#                     'details': 'Invalid request structure',
#                     'status': 'error',
#                     'code': status.HTTP_400_BAD_REQUEST
#                 },
#                 'message': INVALID_DATA_MESSAGE,
#                 'status': False
#             }
#             return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

#         order_item_id = data['order_item_id']
#         vendor_assignments = data['vendor_assignments']

#         # Step 1: Retrieve the OrderItem
#         order_item = OrderItem.objects.get(id=order_item_id)

#         # Step 2: Create VendorRequestLog entries for each vendor
#         logs = []
#         for assignment in vendor_assignments:
#             vendor_id = assignment.get('vendor_id')
#             price = assignment.get('price')
#             distance = assignment.get('distance')

#             if not (vendor_id and price is not None and distance is not None):
#                 response_data = {
#                     'data': {
#                         'details': 'Each vendor assignment must include vendor_id, price, and distance',
#                         'status': 'error',
#                         'code': status.HTTP_400_BAD_REQUEST
#                     },
#                     'message': INVALID_DATA_MESSAGE,
#                     'status': False
#                 }
#                 return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

#             # Validate the vendor exists
#             try:
#                 vendor = User.objects.get(id=vendor_id)
#             except User.DoesNotExist:
#                 return JsonResponse({'error': f'Vendor with id {vendor_id} does not exist'}, status=status.HTTP_404_NOT_FOUND)

#             # Create the VendorRequestLog entry
#             vendor_request_log = VendorRequestLog(
#                 order_item=order_item,
#                 vendor=vendor,
#                 price=price,
#                 distance=distance
#             )
#             vendor_request_log.save()
#             logs.append(vendor_request_log)

#         # Step 3: Serialize the created logs and send a response
#         serializer = VendorRequestLogSerializer(logs, many=True)
#         response_data = {
#             'data': {
#                 'created_logs': serializer.data,
#                 'status': 'success',
#                 'code': status.HTTP_201_CREATED
#             },
#             'message': 'Vendor request logs created successfully',
#             'status': True
#         }
#         return JsonResponse(response_data, status=status.HTTP_201_CREATED)

#     except OrderItem.DoesNotExist:
#         response_data = {
#             'data': {
#                 'details': ORDER_ITEM_NOT_FOUND_MESSAGE,
#                 'status': 'error',
#                 'code': status.HTTP_404_NOT_FOUND
#             },
#             'message': INVALID_DATA_MESSAGE,
#             'status': False
#         }
#         return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)
#     except Exception as e:
#         response_data = {
#             'data': {
#                 'details': str(e),
#                 "status": "error",
#                 'code': status.HTTP_500_INTERNAL_SERVER_ERROR
#             },
#             'message': INTERNAL_SERVER_ERROR_MESSAGE,
#             'status': False
#         }
#         return JsonResponse(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ***** =====  END  ===== ******


# ***** Views related to assign driver and generate OTP *****
# ! Admin will assign a driver for and order
# ! OTP is generated by backend and send to user
# ? To assign a driver to an order and generate OTP
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def assign_driver_to_order(request):
    try:
        # Get data from request
        order_id = request.data.get('order_id')
        driver_id = request.data.get('driver_id')

        # Validate required fields
        if not order_id or not driver_id:
            response_data = {
                'data': {
                    'details': 'Missing required fields',
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': 'Invalid data',
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve the Order
        try:
            order = Order.objects.get(id=order_id, is_active=True)
        except Order.DoesNotExist:
            response_data = {
                'data': {
                    'details': 'Order not found or inactive',
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': 'Order not found',
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

        # Retrieve the Driver
        try:
            driver = Driver.objects.get(id=driver_id)
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

        # Generate OTP
        otp = generate_otp(6)

        # Assign driver and OTP to order
        order.driver_details = driver
        order.driver_otp = otp
        order.save()

        # Serialize the updated Order data
        serializer = OrderSerializer(order)

        response_data = {
            'data': {
                'order': serializer.data,
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'Driver assigned and OTP generated successfully',
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


# ! After entering the otp in the app 
# ! Customer will get the driver details
# ? To view a driver details by customer
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
def view_driver_details(request):
    try:
        # Get data from request
        order_id = request.data.get('order_id')
        driver_otp = request.data.get('driver_otp')

        # Validate required fields
        if not order_id or not driver_otp:
            response_data = {
                'data': {
                    'details': 'Both "order_id" and "driver_otp" are required',
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': 'Invalid data',
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve the Order
        try:
            order = Order.objects.get(id=order_id, is_active=True)
        except Order.DoesNotExist:
            response_data = {
                'data': {
                    'details': 'Order not found or inactive',
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': 'Order not found',
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

        # Check if the current user is the customer of this order
        if order.customer != request.user:
            response_data = {
                'data': {
                    'details': 'You are not authorized to view this order\'s driver details',
                    'status': 'error',
                    'code': status.HTTP_403_FORBIDDEN
                },
                'message': 'Unauthorized',
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_403_FORBIDDEN)

        # Check if the provided driver OTP matches the OTP for the order
        if order.driver_otp != driver_otp:
            response_data = {
                'data': {
                    'details': 'Invalid driver OTP',
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': 'Invalid OTP',
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve the Driver related to the order
        driver = order.driver_details

        if not driver:
            response_data = {
                'data': {
                    'details': 'No driver assigned to this order',
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': 'Driver not found',
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

        # Serialize the driver details
        driver_serializer = DriverSerializer(driver)

        # Return the driver details
        response_data = {
            'data': {
                'driver': driver_serializer.data,
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'Driver details fetched successfully',
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
# ***** =====  END  ===== ******