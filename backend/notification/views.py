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
from rest_framework.response import Response
from rest_framework.views import APIView

# Local Imports
from app.permissions import (
    IsCustomer, IsVendor, IsAdminUser, IsMechanic
    )
from app.messages import (
    DEFAULT_ERROR_MESSAGE, INVALID_METHOD_MESSAGE, INTERNAL_SERVER_ERROR_MESSAGE, INVALID_DATA_MESSAGE,
    CATEGORY_NOT_FOUND_MESSAGE, SUBCATEGORY_NOT_FOUND_MESSAGE, PRODUCT_NOT_FOUND_MESSAGE, PERMISSION_DENIED_MESSAGE,
    LIMIT_OFFSET_MESSAGE, PAGINATED_PRODUCTS_MESSAGE, WISHLIST_NOT_FOUND_MESSAGE, ORDER_ITEM_NOT_FOUND_MESSAGE
    )
from .models import Notification
from .serializers import NotificationSerializer


# Create your views here.


# ***** View / Update Notification by customer *****
# ? This will return all the notifications assigned to a user
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
def view_user_notifications(request):
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

            # Fetch notifications for the currently authenticated user
            notifications = Notification.objects.filter(user=request.user, is_active=True).order_by('-created_at')

            # Paginate the notifications using the provided limit and offset
            paginated_notifications = list(notifications[offset:offset + limit])

            # Get the total number of notifications
            total_items = notifications.count()

            # Serialize the notifications
            serialized_notifications = NotificationSerializer(paginated_notifications, many=True, context={'request': request}).data

            # Calculate the page count and current page
            page_count = (total_items + limit - 1) // limit if limit > 0 else 0
            current_page = (offset // limit) + 1 if limit > 0 else 0

            # Check if there's a next page
            has_next = (offset + limit) < total_items

            # Build the response
            response_data = {
                'data': {
                    'notifications': serialized_notifications,
                    'total_count': total_items,
                    'page_count': page_count,
                    'current_page': current_page,
                    'limit': limit,
                    'offset': offset,
                    'has_next': has_next,
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': "Notifications retrieved successfully.",
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


# ? This will mark a single notification as read by the user
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
def mark_single_notification_as_read(request, notification_id):
    try:
        if request.method == 'POST':
            # Fetch the notification for the current user and provided ID from URL
            notification = Notification.objects.filter(id=notification_id, user=request.user, is_active=True).first()

            if not notification:
                return JsonResponse(
                    {
                        'data': {
                            'details': "Notification not found or already deleted.",
                            'status': 'error',
                            'code': status.HTTP_404_NOT_FOUND
                        },
                        'message': "Notification not found.",
                        'status': False
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            # Mark the notification as read
            notification.status = 'READ'
            notification.save()

            # Return a success response
            return JsonResponse(
                {
                    'data': {
                        'notification_id': notification.id,
                        'status': notification.status,
                        'code': status.HTTP_200_OK
                    },
                    'message': "Notification marked as read successfully.",
                    'status': True
                },
                status=status.HTTP_200_OK
            )

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
    

# ? This will mark all notifications as read for the user
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
def mark_all_notifications_as_read(request):
    try:
        if request.method == 'POST':
            # Fetch all active notifications for the user that are currently unread
            notifications = Notification.objects.filter(user=request.user, status='UNREAD', is_active=True)

            if not notifications.exists():
                return JsonResponse(
                    {
                        'data': {
                            'details': "No unread notifications to mark.",
                            'status': 'error',
                            'code': status.HTTP_404_NOT_FOUND
                        },
                        'message': "No unread notifications found.",
                        'status': False
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            # Mark all notifications as read
            notifications.update(status='READ')

            # Return a success response
            return JsonResponse(
                {
                    'data': {
                        'status': 'success',
                        'code': status.HTTP_200_OK
                    },
                    'message': "All unread notifications marked as read successfully.",
                    'status': True
                },
                status=status.HTTP_200_OK
            )

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


# ***** View / Update Notification by Mechanic *****
# ! This will return all the notifications assigned to a Mechanic
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsMechanic])
def view_mechanic_notifications(request):
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

            # Fetch notifications for the currently authenticated mechanic
            notifications = Notification.objects.filter(user=request.user, is_active=True).order_by('-created_at')

            # Paginate the notifications using the provided limit and offset
            paginated_notifications = list(notifications[offset:offset + limit])

            # Get the total number of notifications
            total_items = notifications.count()

            # Serialize the notifications
            serialized_notifications = NotificationSerializer(paginated_notifications, many=True, context={'request': request}).data

            # Calculate the page count and current page
            page_count = (total_items + limit - 1) // limit if limit > 0 else 0
            current_page = (offset // limit) + 1 if limit > 0 else 0

            # Check if there's a next page
            has_next = (offset + limit) < total_items

            # Build the response
            response_data = {
                'data': {
                    'notifications': serialized_notifications,
                    'total_count': total_items,
                    'page_count': page_count,
                    'current_page': current_page,
                    'limit': limit,
                    'offset': offset,
                    'has_next': has_next,
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': "Notifications retrieved successfully.",
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
            'message': "An error occurred while retrieving notifications.",
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ! This will mark a single notification as read by the Mechanic
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsMechanic])
def mark_single_mechanic_notification_as_read(request, notification_id):
    try:
        if request.method == 'POST':
            # Fetch the notification for the current mechanic and provided ID from URL
            notification = Notification.objects.filter(id=notification_id, user=request.user, is_active=True).first()

            if not notification:
                return JsonResponse(
                    {
                        'data': {
                            'details': "Notification not found or already deleted.",
                            'status': 'error',
                            'code': status.HTTP_404_NOT_FOUND
                        },
                        'message': "Notification not found.",
                        'status': False
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            # Mark the notification as read
            notification.status = 'READ'
            notification.save()

            # Return a success response
            return JsonResponse(
                {
                    'data': {
                        'notification_id': notification.id,
                        'status': notification.status,
                        'code': status.HTTP_200_OK
                    },
                    'message': "Notification marked as read successfully.",
                    'status': True
                },
                status=status.HTTP_200_OK
            )

    except Exception as e:
        # Handle any uncaught exceptions uniformly
        response_data = {
            'data': {
                'details': str(e),
                'status': 'error',
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR
            },
            'message': "An error occurred while marking notification as read.",
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ! This will mark all notifications as read for the Mechanic
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsMechanic])
def mark_all_mechanic_notifications_as_read(request):
    try:
        if request.method == 'POST':
            # Fetch all active notifications for the mechanic that are currently unread
            notifications = Notification.objects.filter(user=request.user, status='UNREAD', is_active=True)

            if not notifications.exists():
                return JsonResponse(
                    {
                        'data': {
                            'details': "No unread notifications to mark.",
                            'status': 'error',
                            'code': status.HTTP_404_NOT_FOUND
                        },
                        'message': "No unread notifications found.",
                        'status': False
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            # Mark all notifications as read
            notifications.update(status='READ')

            # Return a success response
            return JsonResponse(
                {
                    'data': {
                        'status': 'success',
                        'code': status.HTTP_200_OK
                    },
                    'message': "All unread notifications marked as read successfully.",
                    'status': True
                },
                status=status.HTTP_200_OK
            )

    except Exception as e:
        # Handle any uncaught exceptions uniformly
        response_data = {
            'data': {
                'details': str(e),
                'status': 'error',
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR
            },
            'message': "An error occurred while marking notifications as read.",
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ***** =====  END  ===== ******