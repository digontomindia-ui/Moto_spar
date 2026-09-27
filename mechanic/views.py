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
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Count, F, Q, FloatField, ExpressionWrapper
from django.db.models import Sum, Avg, Count
from django.db.models.functions import TruncDate
from django.db.models.functions import Cos, Sin, Radians, ACos
from django.db.utils import IntegrityError
from django.http import JsonResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, permissions, status
from rest_framework.decorators import (
    api_view, permission_classes
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

# Local Imports
from app.permissions import (
    IsCustomer, IsVendor, IsAdminUser, IsMechanic
    )
from app.messages import (
    DEFAULT_ERROR_MESSAGE, INVALID_METHOD_MESSAGE, INTERNAL_SERVER_ERROR_MESSAGE, INVALID_DATA_MESSAGE,
    CATEGORY_NOT_FOUND_MESSAGE, SUBCATEGORY_NOT_FOUND_MESSAGE, MECHANIC_NOT_FOUND_MESSAGE,
    LIMIT_OFFSET_MESSAGE, PAGINATED_PRODUCTS_MESSAGE, VENDOR_NOT_FOUND_MESSAGE, ORDER_ITEM_NOT_FOUND_MESSAGE,
    PRODUCT_NOT_FOUND_MESSAGE, NO_COMPLETED_JOB_MESSAGE, RATING_RANGE_MESSAGE, INVALID_RATING_MESSAGE,
    ALREADY_REVIEWED_MESSAGE, NO_REVIEW_OR_RATING_MESSAGE, JOB_NOT_FOUND_MESSAGE,
    JOB_ALREADY_COMPLETED_MESSAGE, PAGINATED_JOBS_MESSAGE
    )
from .models import (
    MechanicProfile, MechanicJob, MechanicReportApp, MechanicPlatformFee
    )
from .serializers import (
    MechanicProfileSerializer, MechanicJobSerializer, MechanicJobImageSerializer,
    MechanicReportAppSerializer, MechanicPlatformFeeSerializer
    )
from app.models import User
from app.serializers import UserSerializer
from app.utils import (
    handle_error_response, handle_validation_errors, handle_invalid_method,
    handle_exception, generate_otp
    )
from order.models import OrderItem
from order.serializers import OrderItemSerializer
UNAUTHORIZED_ACCESS_MESSAGE = "You are not authorized to view mechanic jobs."
# Payment gateway
import razorpay
from carpal.settings import (
    RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET,
)


# Create your views here.

# ! Mechanic Profile Views
# ***** To edit Vendor Profile Data *****
@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsMechanic])
def edit_mechanic_profile(request, mechanic_profile_id):
    try:
        if request.method == 'PATCH':
            try:
                mechanic_profile = MechanicProfile.objects.get(id=mechanic_profile_id)
            except MechanicProfile.DoesNotExist:
                return handle_error_response(
                    details=MECHANIC_NOT_FOUND_MESSAGE,
                    message=MECHANIC_NOT_FOUND_MESSAGE,
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            # Check if the request user is the owner of the mechanic profile
            if mechanic_profile.user != request.user:
                return handle_error_response(
                    details='You do not have permission to edit this profile.',
                    message='Permission denied. You do not own this profile.',
                    status_code=status.HTTP_403_FORBIDDEN,
                )

            serializer = MechanicProfileSerializer(mechanic_profile, data=request.data, partial=True)

            if serializer.is_valid():
                with transaction.atomic():
                    # Update the is_verified field on the instance directly
                    mechanic_profile.is_verified = True                    
                    serializer.save()
                    # Return user data with mechanic profile using UserSerializer
                    user_serializer = UserSerializer(request.user)
                    response_data = {
                        'data': {
                            'user': user_serializer.data,
                            'status': 'success',
                            'code': status.HTTP_200_OK
                        },
                        'message': 'Mechanic profile updated successfully',
                        'status': True
                    }
                    return Response(response_data, status=status.HTTP_200_OK)
            else:
                # Handling validation errors using the utility function
                return handle_validation_errors(serializer.errors)
        else:
            # Handle invalid method error using the utility function
            return handle_invalid_method()
    except Exception as e:
        # Use the utility function to handle exceptions
        return handle_exception(e)
# ***** =====  END  ===== ******


# ***** View Mechanic List in admin panel *****
# ! To view all mechanic users data from admin panel
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def view_mechanic_users_admin_panel(request):
    try:
        if request.method == 'POST':
            # Parse request body
            data = json.loads(request.body)
            limit = int(data.get('limit', 10))
            offset = int(data.get('offset', 0))

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
            email = data.get('email', '').strip()
            phone_number = data.get('phone_number', '').strip()
            country = data.get('country', '').strip()
            state = data.get('state', '').strip()
            postal_code = data.get('postal_code', '').strip()

            # Construct the Q object for complex filtering
            filters = Q(account_type='mechanic')  # Restrict to mechanic users

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

            # Retrieve and paginate mechanic users based on filters
            users = User.objects.filter(filters).order_by('date_joined')

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
                'message': 'Mechanic users retrieved successfully.',
                'status': True
            }
            return JsonResponse(response_data, status=status.HTTP_200_OK)

    except json.JSONDecodeError:
        response_data = {
            'data': {
                'details': 'Invalid JSON format',
                'status': 'error',
                'code': status.HTTP_400_BAD_REQUEST
            },
            'message': INVALID_DATA_MESSAGE,
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

    except ValueError:
        response_data = {
            'data': {
                'details': 'Limit and offset must be valid integers.',
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
                'status': 'error',
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR
            },
            'message': INTERNAL_SERVER_ERROR_MESSAGE,
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ! To view a single mechanic user’s detail data from admin panel
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def detail_mechanic_user_view_admin(request, user_id):
    try:
        # Retrieve the user object based on the provided user_id and account_type
        user = get_object_or_404(User, id=user_id, account_type='mechanic')

        # Serialize the user object
        serializer = UserSerializer(user, context={'request': request})

        # Prepare the response data
        response_data = {
            'data': {
                'user': serializer.data,
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'Mechanic user details retrieved successfully.',
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


# ! Mechanic Job Views
# ? Admin will search for nearest mechanics for an order item
# * ==========>
# ? Assign a mechanic to an order item
# * ==========>
# ? Mechanic Will accept / decline job for an order item
# * ==========>
# ? Mechanic Will add otp which is given by the user
# * ==========>
# ? After completion mechanic will change the status of the job
# * ==========>
# ? Customer will add review and rating for the mechanic job
# * ==========>
# ? Mechanic can view his/her own jobs list
# * ==========>
# ? Admin can view all mechanic jobs
# * ==========>
# ? Mechanic can view all payments related to his/her jobs
# * ==========>


# ***** To find nearest mechanics for an order item *****
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def find_nearest_mechanics_for_order_item(request, order_item_id):
    try:
        # Step 1: Retrieve the OrderItem and its related information
        order_item = OrderItem.objects.get(id=order_item_id)
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

        # Step 2: Filter MechanicProfile to find active and available mechanics
        mechanic_profiles = MechanicProfile.objects.filter(
            is_active=True,
            is_available=True,
            latitude__isnull=False,
            longitude__isnull=False
        ).select_related('user')

        # Step 3: Annotate mechanic profiles with distance
        mechanic_profiles = mechanic_profiles.annotate(
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
        mechanic_data = []
        for mechanic in mechanic_profiles:
            mechanic_data.append({
                'mechanic_id': mechanic.user.id,
                'mechanic_name': mechanic.user.get_full_name(),
                'email': mechanic.user.email,
                'contact_phone': mechanic.contact_phone or mechanic.user.phone_number,
                'contact_email': mechanic.contact_email or mechanic.user.email,
                'expertise': mechanic.expertise,
                'years_of_experience': mechanic.years_of_experience,
                'specialization': mechanic.specialization,
                'service_types': mechanic.service_types,
                'is_verified': mechanic.is_verified,
                'latitude': mechanic.latitude,
                'longitude': mechanic.longitude,
                'distance': round(mechanic.distance, 2),
                'working_hours': mechanic.working_hours,
                'base_address': mechanic.base_address,
                'base_city': mechanic.base_city,
                'base_state': mechanic.base_state,
                'base_country': mechanic.base_country
            })

        response_data = {
            'data': {
                'nearest_mechanics': mechanic_data,
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'Nearest mechanics found successfully',
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
                'status': 'error',
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR
            },
            'message': INTERNAL_SERVER_ERROR_MESSAGE,
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ***** =====  END  ===== ******


# ***** To assign a mechanic for an orderitem *****
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def assign_mechanic_to_order_item(request, order_item_id):
    """
    Assigns a mechanic to an order item, validates balance for platform fee,
    and creates/updates a MechanicJob.
    Method: POST
    URL: api/mechanic/job/<uuid:order_item_id>/assign/
    Request Body: {"mechanic_id": "uuid", "mechanic_fees": 1000.00, "scheduled_date": "YYYY-MM-DDTHH:MM:SSZ", "notes": ""}
    """    
    try:
        # Get data from request
        # order_item_id = request.data.get('order_item_id')
        mechanic_id = request.data.get('mechanic_id')
        mechanic_fees = request.data.get('mechanic_fees')
        scheduled_date = request.data.get('scheduled_date')  # Optional
        notes = request.data.get('notes', '')  # Optional

        # Validate required fields
        if not mechanic_id or mechanic_fees is None:
            response_data = {
                'data': {
                    'details': 'Missing required fields: mechanic_id, or mechanic_fees',
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': INVALID_DATA_MESSAGE,
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve the OrderItem
        try:
            order_item = OrderItem.objects.get(id=order_item_id, is_active=True)
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

        # Retrieve the mechanic
        try:
            mechanic = User.objects.get(id=mechanic_id, mechanic_profile__is_active=True, mechanic_profile__is_available=True)
            mechanic_profile = mechanic.mechanic_profile
        except User.DoesNotExist:
            response_data = {
                'data': {
                    'details': MECHANIC_NOT_FOUND_MESSAGE,
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': INVALID_DATA_MESSAGE,
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

        # Validate mechanic_fees
        try:
            mechanic_fees = Decimal(mechanic_fees)
            if mechanic_fees < 0:
                raise ValueError("Mechanic fees cannot be negative")
        except (ValueError, TypeError):
            response_data = {
                'data': {
                    'details': 'Invalid mechanic_fees value',
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': INVALID_DATA_MESSAGE,
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

        # ? Calculate platform fee for this job (10% of mechanic_fees)
        platform_fee = mechanic_fees * Decimal('0.10')

        # Calculate total pending fees from other incomplete jobs
        pending_jobs = MechanicJob.objects.filter(
            mechanic=mechanic,
            is_active=True,
            job_status__in=['pending', 'in_progress']
        ).exclude(order_item=order_item)  # Exclude the current job if it exists
        total_pending_fees = sum(job.mechanic_fees * Decimal('0.10') for job in pending_jobs)

        # Check if mechanic has sufficient balance
        required_balance = platform_fee + total_pending_fees
        if mechanic_profile.top_up_balance < required_balance:
            response_data = {
                'data': {
                    'details': f"Insufficient balance. Required: {required_balance}, Available: {mechanic_profile.top_up_balance}",
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': f"Insufficient balance. Required: {required_balance}, Available: {mechanic_profile.top_up_balance}",
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate 6-digit OTP
        mechanic_otp = generate_otp()

        # Update OrderItem
        order_item.mechanic = mechanic
        order_item.mechanic_fees = mechanic_fees
        order_item.mechanic_otp = mechanic_otp
        order_item.installation_required = True  # Set to True since mechanic is assigned
        order_item.save()

        # Create or update MechanicJob
        mechanic_job, created = MechanicJob.objects.get_or_create(
            order_item=order_item,
            defaults={
                'mechanic': mechanic,
                'mechanic_fees': mechanic_fees,
                'notes': notes,
                'job_status': 'pending',
                'payment_status': 'pending',
                'scheduled_date': scheduled_date if scheduled_date else None
            }
        )
        if not created:
            # Update existing job if it exists
            mechanic_job.mechanic = mechanic
            mechanic_job.mechanic_fees = mechanic_fees
            mechanic_job.notes = notes
            mechanic_job.job_status = 'pending'
            mechanic_job.payment_status = 'pending'
            mechanic_job.scheduled_date = scheduled_date if scheduled_date else None
            mechanic_job.is_active = True
            mechanic_job.save()

        # Notify the mechanic about the job assignment
        # notify_mechanic_about_job_assignment(mechanic, order_item, mechanic_job)

        # Serialize the updated OrderItem data
        serializer = OrderItemSerializer(order_item)

        response_data = {
            'data': {
                'order_item': serializer.data,
                'mechanic_job_id': str(mechanic_job.id),
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'Mechanic assigned successfully',
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


# ***** To accept the job by mechanic *****
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_job_offer(request, job_id):
    """
    Allow the assigned mechanic to accept a job offer, setting is_accepted to True.
    """
    try:
        # Fetch the mechanic job
        try:
            mechanic_job = MechanicJob.objects.get(id=job_id)
        except MechanicJob.DoesNotExist:
            response_data = {
                'data': {
                    'details': JOB_NOT_FOUND_MESSAGE,
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': JOB_NOT_FOUND_MESSAGE,
                'status': False
            }
            return Response(response_data, status=status.HTTP_404_NOT_FOUND)

        # Check if the user is the assigned mechanic
        if mechanic_job.mechanic != request.user:
            response_data = {
                'data': {
                    'details': MECHANIC_NOT_FOUND_MESSAGE,
                    'status': 'error',
                    'code': status.HTTP_403_FORBIDDEN
                },
                'message': MECHANIC_NOT_FOUND_MESSAGE,
                'status': False
            }
            return Response(response_data, status=status.HTTP_403_FORBIDDEN)

        # Check if the job is already accepted
        if mechanic_job.is_accepted:
            response_data = {
                'data': {
                    'details': "Job has already been accepted.",
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': "Job has already been accepted.",
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

        # Update job acceptance status
        mechanic_job.is_accepted = True
        mechanic_job.save()

        # Serialize the updated job
        serializer = MechanicJobSerializer(mechanic_job)

        response_data = {
            'data': {
                'job': serializer.data,
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'Job offer has been accepted successfully!',
            'status': True
        }
        return Response(response_data, status=status.HTTP_200_OK)

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
        return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ***** =====  END  ===== ******


# ***** To decline the job by mechanic *****
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsMechanic])
def decline_job_offer(request, job_id):
    """
    Allow the assigned mechanic to decline a job offer, setting job_status to 'cancelled',
    storing the decline_reason, and setting mechanic to null in the OrderItem.
    """
    try:
        # Fetch the mechanic job
        try:
            mechanic_job = MechanicJob.objects.get(id=job_id, is_active=True)
        except MechanicJob.DoesNotExist:
            response_data = {
                'data': {
                    'details': "Mechanic job not found or already deleted.",
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': "Mechanic job not found or already deleted.",
                'status': False
            }
            return Response(response_data, status=status.HTTP_404_NOT_FOUND)

        # Check if the user is the assigned mechanic
        if mechanic_job.mechanic != request.user:
            response_data = {
                'data': {
                    'details': "You are not authorized to decline this job.",
                    'status': 'error',
                    'code': status.HTTP_403_FORBIDDEN
                },
                'message': "You are not authorized to decline this job.",
                'status': False
            }
            return Response(response_data, status=status.HTTP_403_FORBIDDEN)

        # Check if the job is already cancelled
        if mechanic_job.job_status == 'cancelled':
            response_data = {
                'data': {
                    'details': "Job has already been cancelled.",
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': "Job has already been cancelled.",
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

        # Validate decline_reason from request data
        decline_reason = request.data.get('decline_reason')
        if not decline_reason or not isinstance(decline_reason, str) or len(decline_reason.strip()) == 0:
            response_data = {
                'data': {
                    'details': "A valid decline reason is required.",
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': "A valid decline reason is required.",
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

        # Update MechanicJob: set job_status to 'cancelled' and store decline_reason
        mechanic_job.job_status = 'cancelled'
        mechanic_job.decline_reason = decline_reason.strip()
        mechanic_job.save()

        # Update OrderItem: set mechanic to null
        order_item = mechanic_job.order_item
        order_item.mechanic = None
        order_item.save()

        # Serialize the updated job
        serializer = MechanicJobSerializer(mechanic_job)

        response_data = {
            'data': {
                'job': serializer.data,
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'Job offer has been declined successfully.',
            'status': True
        }
        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        response_data = {
            'data': {
                'details': str(e),
                'status': 'error',
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR
            },
            'message': "An error occurred while declining the job.",
            'status': False
        }
        return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ***** =====  END  ===== ******


# ***** To start a mechanic job *****
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsMechanic])
def start_mechanic_job(request, job_id):
    """
    Allows the assigned mechanic to start a job, setting job_status to 'in_progress' and start_date to now.
    Method: POST
    URL: api/mechanic/jobs/<job_id>/start/
    """
    try:
        # Fetch the mechanic job
        try:
            mechanic_job = MechanicJob.objects.get(id=job_id)
        except MechanicJob.DoesNotExist:
            response_data = {
                'data': {
                    'details': JOB_NOT_FOUND_MESSAGE,
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': JOB_NOT_FOUND_MESSAGE,
                'status': False
            }
            return Response(response_data, status=status.HTTP_404_NOT_FOUND)

        # Check if the user is the assigned mechanic
        if mechanic_job.mechanic != request.user:
            response_data = {
                'data': {
                    'details': MECHANIC_NOT_FOUND_MESSAGE,
                    'status': 'error',
                    'code': status.HTTP_403_FORBIDDEN
                },
                'message': MECHANIC_NOT_FOUND_MESSAGE,
                'status': False
            }
            return Response(response_data, status=status.HTTP_403_FORBIDDEN)

        # Check if job is already in progress
        if mechanic_job.job_status == 'in_progress':
            response_data = {
                'data': {
                    'details': "Job is already in progress.",
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': "Job is already in progress.",
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

        # Check if job is in a valid state to start
        if mechanic_job.job_status not in ['pending']:
            response_data = {
                'data': {
                    'details': f"Job cannot be started. Current status: {mechanic_job.job_status}.",
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': f"Job cannot be started. Current status: {mechanic_job.job_status}.",
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

        # Update job status and start date
        mechanic_job.job_status = 'in_progress'
        mechanic_job.start_date = timezone.now()
        mechanic_job.save()

        # Serialize the updated job
        serializer = MechanicJobSerializer(mechanic_job)

        response_data = {
            'data': {
                'job': serializer.data,
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'Job started successfully and is now in progress!',
            'status': True
        }
        return Response(response_data, status=status.HTTP_200_OK)

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
        return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ***** =====  END  ===== ******


# ***** Mechanic will upload images for a mechanic job *****
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsMechanic])
def upload_mechanic_job_images(request, job_id):
    """
    Allows the assigned mechanic to upload a single image for a mechanic job.
    Method: POST
    URL: api/mechanic/jobs/<job_id>/upload-images/
    """
    try:
        # Fetch the mechanic job
        try:
            mechanic_job = MechanicJob.objects.get(id=job_id)
        except MechanicJob.DoesNotExist:
            return handle_error_response(
                details=JOB_NOT_FOUND_MESSAGE,
                message=JOB_NOT_FOUND_MESSAGE,
                status_code=status.HTTP_404_NOT_FOUND,
            )
        
        # Check if the user is the assigned mechanic
        if mechanic_job.mechanic != request.user:
            return handle_error_response(
                details=MECHANIC_NOT_FOUND_MESSAGE,
                message=MECHANIC_NOT_FOUND_MESSAGE,
                status_code=status.HTTP_403_FORBIDDEN,
            )    
            
        # Check if job is in a valid state for image upload
        if mechanic_job.job_status not in ['pending', 'in_progress']:
            return handle_error_response(
                details=f"Cannot upload image for a job with status {mechanic_job.job_status}.",
                message=f"Cannot upload image for a job with status {mechanic_job.job_status}.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        
        # # Get the single image from request
        # image = request.FILES.get('image')
        # if not image:
        #     return handle_error_response(
        #         details="An image is required.",
        #         message="An image is required.",
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #     )
        
        # # Process image upload
        # image_data = {
        #     'mechanic_job': str(mechanic_job.id),
        #     'image': image,
        #     'description': request.data.get('description', '')
        # }

        # with transaction.atomic():
        #     image_serializer = MechanicJobImageSerializer(data=image_data)

        #     if not image_serializer.is_valid():
        #         return handle_validation_errors(image_serializer.errors)

        #     image_serializer.save(is_active=True)

        # Process image upload
        with transaction.atomic():
            # Create a mutable copy of request.data and add mechanic_job
            image_data = request.data.copy()  # Create a mutable QueryDict
            image_data['mechanic_job'] = str(mechanic_job.id)  # Add mechanic_job
            image_serializer = MechanicJobImageSerializer(data=image_data)
            if not image_serializer.is_valid():
                return handle_validation_errors(image_serializer.errors)

            # Set is_active before saving
            image_serializer.validated_data['is_active'] = True
            image_serializer.save()
            
        # Serialize the updated mechanic job
        serializer = MechanicJobSerializer(mechanic_job)

        response_data = {
            'data': {
                'job': serializer.data,
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'Job image uploaded successfully',
            'status': True
        }
        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        return handle_exception(e)
# ***** =====  END  ===== ******


# ***** Mechanic will validate OTP and complete the job *****
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_job_with_otp(request, job_id):
    """
    Allows the assigned mechanic to validate an OTP and mark the job as completed.
    Sets job_status to 'completed', updates completion_date (and start_date if not set),
    and deducts 10% of mechanic_fees from MechanicProfile.top_up_balance.
    Method: POST
    URL: api/mechanic/jobs/<job_id>/complete-with-otp/
    """
    try:
        # Get OTP from request data
        provided_otp = request.data.get('otp')
        if not provided_otp:
            response_data = {
                'data': {
                    'details': 'OTP is required.',
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': 'OTP is required.',
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the mechanic job
        try:
            mechanic_job = MechanicJob.objects.get(id=job_id)
        except MechanicJob.DoesNotExist:
            response_data = {
                'data': {
                    'details': JOB_NOT_FOUND_MESSAGE,
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': JOB_NOT_FOUND_MESSAGE,
                'status': False
            }
            return Response(response_data, status=status.HTTP_404_NOT_FOUND)

        # Check if the user is the assigned mechanic
        if mechanic_job.mechanic != request.user:
            response_data = {
                'data': {
                    'details': MECHANIC_NOT_FOUND_MESSAGE,
                    'status': 'error',
                    'code': status.HTTP_403_FORBIDDEN
                },
                'message': MECHANIC_NOT_FOUND_MESSAGE,
                'status': False
            }
            return Response(response_data, status=status.HTTP_403_FORBIDDEN)

        # Validate OTP
        if mechanic_job.order_item.mechanic_otp != provided_otp:
            response_data = {
                'data': {
                    'details': "Invalid OTP provided.",
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': "Invalid OTP provided.",
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

        # Check if the job is already completed
        if mechanic_job.job_status == 'completed':
            response_data = {
                'data': {
                    'details': JOB_ALREADY_COMPLETED_MESSAGE,
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': JOB_ALREADY_COMPLETED_MESSAGE,
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

        # Check if job is in a valid state to complete
        if mechanic_job.job_status not in ['pending', 'in_progress']:
            response_data = {
                'data': {
                    'details': f"Job cannot be completed. Current status: {mechanic_job.job_status}.",
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': f"Job cannot be completed. Current status: {mechanic_job.job_status}.",
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

        
        # ? Calculate platform fee (10% of mechanic_fees)
        platform_fee = mechanic_job.mechanic_fees * Decimal('0.10')

        # Fetch the mechanic profile
        try:
            mechanic_profile = MechanicProfile.objects.get(user=mechanic_job.mechanic, is_active=True)
        except MechanicProfile.DoesNotExist:
            response_data = {
                'data': {
                    'details': 'Mechanic profile not found.',
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': 'Mechanic profile not found.',
                'status': False
            }
            return Response(response_data, status=status.HTTP_404_NOT_FOUND)

        # Check if sufficient balance exists
        if mechanic_profile.top_up_balance < platform_fee:
            response_data = {
                'data': {
                    'details': f"Insufficient balance. Required: {platform_fee}, Available: {mechanic_profile.top_up_balance}.",
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': f"Insufficient balance. Required: {platform_fee}, Available: {mechanic_profile.top_up_balance}.",
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
        

        # Update job status and dates within a transaction
        with transaction.atomic():
            mechanic_job.job_status = 'completed'
            mechanic_job.completion_date = timezone.now()
            if not mechanic_job.start_date:
                mechanic_job.start_date = timezone.now()  # Set start_date if not already set
            mechanic_job.save()

            # Deduct platform fee from top_up_balance
            mechanic_profile.top_up_balance -= platform_fee
            mechanic_profile.save()

        # Serialize the updated job
        serializer = MechanicJobSerializer(mechanic_job)

        response_data = {
            'data': {
                'job': serializer.data,
                'platform_fee_deducted': float(platform_fee),
                'new_balance': float(mechanic_profile.top_up_balance),
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'OTP validated successfully, job marked as completed!',
            'status': True
        }
        return Response(response_data, status=status.HTTP_200_OK)

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
        return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ***** =====  END  ===== ******


# ! Not Required
# ***** Mechanic will validate OTP *****
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def validate_job_otp(request, job_id):
#     """
#     Allow the assigned mechanic to validate the job with an OTP, setting job_status to 'in_progress' and start_date to now.
#     """
#     try:
#         # Get OTP from request data
#         provided_otp = request.data.get('otp')
#         if not provided_otp:
#             response_data = {
#                 'data': {
#                     'details': 'OTP is required.',
#                     'status': 'error',
#                     'code': status.HTTP_400_BAD_REQUEST
#                 },
#                 'message': 'OTP is required.',
#                 'status': False
#             }
#             return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

#         # Fetch the mechanic job
#         try:
#             mechanic_job = MechanicJob.objects.get(id=job_id)
#         except MechanicJob.DoesNotExist:
#             response_data = {
#                 'data': {
#                     'details': JOB_NOT_FOUND_MESSAGE,
#                     'status': 'error',
#                     'code': status.HTTP_404_NOT_FOUND
#                 },
#                 'message': JOB_NOT_FOUND_MESSAGE,
#                 'status': False
#             }
#             return Response(response_data, status=status.HTTP_404_NOT_FOUND)

#         # Check if the user is the assigned mechanic
#         if mechanic_job.mechanic != request.user:
#             response_data = {
#                 'data': {
#                     'details': MECHANIC_NOT_FOUND_MESSAGE,
#                     'status': 'error',
#                     'code': status.HTTP_403_FORBIDDEN
#                 },
#                 'message': MECHANIC_NOT_FOUND_MESSAGE,
#                 'status': False
#             }
#             return Response(response_data, status=status.HTTP_403_FORBIDDEN)

#         # Validate OTP
#         if mechanic_job.order_item.mechanic_otp != provided_otp:
#             response_data = {
#                 'data': {
#                     'details': "Invalid OTP provided.",
#                     'status': 'error',
#                     'code': status.HTTP_400_BAD_REQUEST
#                 },
#                 'message': "Invalid OTP provided.",
#                 'status': False
#             }
#             return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

#         # Check if job is already in progress or completed
#         if mechanic_job.job_status in ['in_progress', 'completed']:
#             response_data = {
#                 'data': {
#                     'details': f"Job is already {mechanic_job.job_status}.",
#                     'status': 'error',
#                     'code': status.HTTP_400_BAD_REQUEST
#                 },
#                 'message': f"Job is already {mechanic_job.job_status}.",
#                 'status': False
#             }
#             return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

#         # Update job status and start date
#         mechanic_job.job_status = 'in_progress'
#         mechanic_job.start_date = timezone.now()
#         mechanic_job.save()

#         # Serialize the updated job
#         serializer = MechanicJobSerializer(mechanic_job)

#         response_data = {
#             'data': {
#                 'job': serializer.data,
#                 'status': 'success',
#                 'code': status.HTTP_200_OK
#             },
#             'message': 'OTP validated successfully, job is now in progress!',
#             'status': True
#         }
#         return Response(response_data, status=status.HTTP_200_OK)

#     except Exception as e:
#         response_data = {
#             'data': {
#                 'details': str(e),
#                 'status': 'error',
#                 'code': status.HTTP_500_INTERNAL_SERVER_ERROR
#             },
#             'message': INTERNAL_SERVER_ERROR_MESSAGE,
#             'status': False
#         }
#         return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ***** =====  END  ===== ******


# ! Not Required
# ***** To change the job status done by mechanic *****
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def mark_job_completed(request, job_id):
#     """
#     Mark a mechanic job as completed if the user is the assigned mechanic and the job is not already completed.
#     """
#     try:
#         # Fetch the mechanic job
#         try:
#             mechanic_job = MechanicJob.objects.get(id=job_id)
#         except MechanicJob.DoesNotExist:
#             response_data = {
#                 'data': {
#                     'details': JOB_NOT_FOUND_MESSAGE,
#                     'status': 'error',
#                     'code': status.HTTP_404_NOT_FOUND
#                 },
#                 'message': JOB_NOT_FOUND_MESSAGE,
#                 'status': False
#             }
#             return Response(response_data, status=status.HTTP_404_NOT_FOUND)

#         # Check if the user is the assigned mechanic
#         if mechanic_job.mechanic != request.user:
#             response_data = {
#                 'data': {
#                     'details': MECHANIC_NOT_FOUND_MESSAGE,
#                     'status': 'error',
#                     'code': status.HTTP_403_FORBIDDEN
#                 },
#                 'message': MECHANIC_NOT_FOUND_MESSAGE,
#                 'status': False
#             }
#             return Response(response_data, status=status.HTTP_403_FORBIDDEN)

#         # Check if the job is already completed
#         if mechanic_job.job_status == 'completed':
#             response_data = {
#                 'data': {
#                     'details': JOB_ALREADY_COMPLETED_MESSAGE,
#                     'status': 'error',
#                     'code': status.HTTP_400_BAD_REQUEST
#                 },
#                 'message': JOB_ALREADY_COMPLETED_MESSAGE,
#                 'status': False
#             }
#             return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

#         # Update job status to completed and set completion date
#         mechanic_job.job_status = 'completed'
#         mechanic_job.completion_date = timezone.now()
#         mechanic_job.save()

#         # Serialize the updated job
#         serializer = MechanicJobSerializer(mechanic_job)

#         response_data = {
#             'data': {
#                 'job': serializer.data,
#                 'status': 'success',
#                 'code': status.HTTP_200_OK
#             },
#             'message': 'Job has been marked as completed!',
#             'status': True
#         }
#         return Response(response_data, status=status.HTTP_200_OK)

#     except Exception as e:
#         response_data = {
#             'data': {
#                 'details': str(e),
#                 'status': 'error',
#                 'code': status.HTTP_500_INTERNAL_SERVER_ERROR
#             },
#             'message': INTERNAL_SERVER_ERROR_MESSAGE,
#             'status': False
#         }
#         return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ***** =====  END  ===== ******


# # ***** To Add reviews and ratings for an mechanic job *****
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
def add_mechanic_job_review(request, order_item_id):
    """
    View to add a review and rating for a mechanic job.
    Only customers with a completed mechanic job for a purchased product can add a review.
    """
    try:
        user = request.user
        data = request.data
        rating = data.get("rating")
        review = data.get("review")

        # 1. Validate that at least one of review or rating is provided
        if not (rating is not None or review):
            response_data = {
                'data': {
                    'details': NO_REVIEW_OR_RATING_MESSAGE,
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': NO_REVIEW_OR_RATING_MESSAGE,
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
        

        # 2. Validate rating if provided
        if rating is not None:
            try:
                rating = float(rating)
                if not (1.0 <= rating <= 5.0):
                    response_data = {
                        'data': {
                            'details': RATING_RANGE_MESSAGE,
                            'status': 'error',
                            'code': status.HTTP_400_BAD_REQUEST
                        },
                        'message': RATING_RANGE_MESSAGE,
                        'status': False
                    }
                    return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
            except (ValueError, TypeError):
                response_data = {
                    'data': {
                        'details': INVALID_RATING_MESSAGE,
                        'status': 'error',
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': INVALID_RATING_MESSAGE,
                    'status': False
                }
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
            
        # 3. Check if the order item exists and is associated with the user
        try:
            order_item = get_object_or_404(
                OrderItem,
                id=order_item_id,
                order__customer=user,
                order_status='DELIVERED',  # Ensure the order item is delivered
                installation_required=True  # Ensure installation was required
            )
        except OrderItem.DoesNotExist:
            response_data = {
                'data': {
                    'details': "Order item not found or not delivered.",
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': "Order item not found or not delivered.",
                'status': False
            }
            return Response(response_data, status=status.HTTP_404_NOT_FOUND)

        # 4. Check if a mechanic job exists for this order item and is completed
        try:
            mechanic_job = get_object_or_404(
                MechanicJob,
                order_item=order_item,
                job_status='completed',
                is_active=True
            )
        except MechanicJob.DoesNotExist:
            response_data = {
                'data': {
                    'details': NO_COMPLETED_JOB_MESSAGE,
                    'status': 'error',
                    'code': status.HTTP_403_FORBIDDEN
                },
                'message': NO_COMPLETED_JOB_MESSAGE,
                'status': False
            }
            return Response(response_data, status=status.HTTP_403_FORBIDDEN)

        # 5. Verify that the user has not already reviewed this mechanic job
        if mechanic_job.review or mechanic_job.rating:
            response_data = {
                'data': {
                    'details': ALREADY_REVIEWED_MESSAGE,
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': ALREADY_REVIEWED_MESSAGE,
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

        # 6. Prepare data for updating the mechanic job with review and rating
        mutable_data = request.data.copy()
        mutable_data['review'] = mutable_data.get('review', '')
        mutable_data['rating'] = rating

        with transaction.atomic():
            # Update the MechanicJob with review and rating
            serializer = MechanicJobSerializer(mechanic_job, data=mutable_data, partial=True)
            if serializer.is_valid():
                serializer.save()
                response_data = {
                    'data': {
                        'review': serializer.data['review'],
                        'rating': serializer.data['rating'],
                        'status': 'success',
                        'code': status.HTTP_201_CREATED
                    },
                    'message': 'Review and rating added successfully',
                    'status': True
                }
                return Response(response_data, status=status.HTTP_201_CREATED)
            else:
                # Handle validation errors
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
                    'message': DEFAULT_ERROR_MESSAGE,
                    'status': False
                }
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

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
        return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ***** =====  END  ===== ******


# # ***** To view all the mechanic jobs *****
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def view_mechanic_jobs(request):
    """
    Filter mechanic jobs by job_status, payment_status, mechanic_email, order_id, rating, and is_active.
    Admins can view all active jobs; mechanics can view only their own active jobs.
    Only returns jobs with is_active=True.
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
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': LIMIT_OFFSET_MESSAGE,
                    'status': False
                }
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

            job_status = request.data.get('job_status', None)
            payment_status = request.data.get('payment_status', None)
            mechanic_email = request.data.get('mechanic_email', None)
            order_id = request.data.get('order_id', None)
            rating = request.data.get('rating', None)

            # Base query: only active mechanic jobs
            if request.user.account_type == 'admin':
                mechanic_jobs = MechanicJob.objects.filter(is_active=True).order_by('-created_at')
            elif request.user.account_type == 'mechanic':
                mechanic_jobs = MechanicJob.objects.filter(
                    is_active=True,
                    mechanic=request.user
                ).order_by('-created_at')
            else:
                response_data = {
                    'data': {
                        'details': UNAUTHORIZED_ACCESS_MESSAGE,
                        'status': 'error',
                        'code': status.HTTP_403_FORBIDDEN
                    },
                    'message': UNAUTHORIZED_ACCESS_MESSAGE,
                    'status': False
                }
                return Response(response_data, status=status.HTTP_403_FORBIDDEN)

            # Filter by job_status (if provided)
            if job_status:
                mechanic_jobs = mechanic_jobs.filter(job_status=job_status)

            # Filter by payment_status (if provided)
            if payment_status:
                mechanic_jobs = mechanic_jobs.filter(payment_status=payment_status)

            # Filter by mechanic_email (case-insensitive, only for admins)
            if mechanic_email and request.user.account_type == 'admin':
                mechanic_jobs = mechanic_jobs.filter(mechanic__email__icontains=mechanic_email)

            # Filter by order_id (if provided)
            if order_id:
                mechanic_jobs = mechanic_jobs.filter(order_item__order__id=order_id)

            # Filter by rating (if provided)
            if rating is not None:
                try:
                    rating_value = float(rating)
                    mechanic_jobs = mechanic_jobs.filter(rating__gte=rating_value)
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
                    return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

            # Slice the queryset using limit and offset
            paginated_data = list(mechanic_jobs[offset:offset + limit])

            # Pass the paginated_data into associated serializer
            serializer = MechanicJobSerializer(paginated_data, many=True, context={'request': request})

            # Get the total number of items
            total_items = mechanic_jobs.count()

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
                    'jobs': serializer.data,
                    'total_count': total_items,
                    'page_count': page_count,
                    'current_page': current_page,
                    'limit': limit,
                    'offset': offset,
                    'has_next': has_next,
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': PAGINATED_JOBS_MESSAGE,
                'status': True
            }
            return Response(response_data, status=status.HTTP_200_OK)

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
        return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ***** =====  END  ===== ******    


# # ***** To view mechanic statistics *****
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsMechanic])
def mechanic_statistics_view(request):
    try:
        # Get the current user
        user = request.user

        # Define time ranges
        now = timezone.now()
        last_2_hours = now - timedelta(hours=2)
        last_12_hours = now - timedelta(hours=12)
        last_7_days = now - timedelta(days=7)
        last_1_month = now - timedelta(days=30)

        # Aggregate multiple statistics in a single query where possible
        job_stats = MechanicJob.objects.filter(
            mechanic=user,
            is_active=True
        ).aggregate(
            total_jobs=Count('id'),
            completed_jobs=Count('id', filter=Q(job_status='completed')),
            pending_jobs=Count('id', filter=Q(job_status='pending')),
            total_payment_received=Sum('mechanic_fees', filter=Q(payment_status='success')),
            total_payment_pending=Sum('mechanic_fees', filter=Q(payment_status='pending')),
            total_work_amount=Sum('mechanic_fees'),
            review_count=Count('review', filter=Q(review__isnull=False, review__gt='')),
            avg_rating=Avg('rating', filter=Q(rating__isnull=False)),
            jobs_last_2_hours=Count('id', filter=Q(created_at__gte=last_2_hours)),
            jobs_last_12_hours=Count('id', filter=Q(created_at__gte=last_12_hours)),
            jobs_last_7_days=Count('id', filter=Q(created_at__gte=last_7_days)),
            jobs_last_1_month=Count('id', filter=Q(created_at__gte=last_1_month))
        )

        # Format the results, handling None values
        response_data = {
            'data': {
                'total_jobs': job_stats['total_jobs'] or 0,
                'completed_jobs': job_stats['completed_jobs'] or 0,
                'pending_jobs': job_stats['pending_jobs'] or 0,
                'total_payment_received': float(job_stats['total_payment_received'] or 0),
                'total_payment_pending': float(job_stats['total_payment_pending'] or 0),
                'total_work_amount': float(job_stats['total_work_amount'] or 0),
                'review_count': job_stats['review_count'] or 0,
                'average_rating': round(float(job_stats['avg_rating'] or 0), 1),
                'jobs_last_2_hours': job_stats['jobs_last_2_hours'] or 0,
                'jobs_last_12_hours': job_stats['jobs_last_12_hours'] or 0,
                'jobs_last_7_days': job_stats['jobs_last_7_days'] or 0,
                'jobs_last_1_month': job_stats['jobs_last_1_month'] or 0,                
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'Mechanic statistics retrieved successfully.',
            'status': True
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
            'message': 'An error occurred while retrieving mechanic statistics.',
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ***** =====  END  ===== ******   


# # ***** To add mechanic Mechanic textual data *****
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsMechanic])
def add_mechanic_report(request):
    """
    View to allow mechanics to submit a report or feedback to the MechanicReportApp.
    Mechanics can submit app preferences, report issues, or other feedback.
    """
    try:
        user = request.user
        data = request.data

        # 1. Validate that text_content is provided
        if not data.get('text_content'):
            response_data = {
                'data': {
                    'details': "Text content is required.",
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': "Text content is required.",
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

        # 2. Validate text_type if provided
        text_type = data.get('text_type')
        if not text_type or text_type not in dict(MechanicReportApp._meta.get_field('text_type').choices):
            response_data = {
                'data': {
                    'details': "Valid text type is required (app_preference, report_issue, or other).",
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': "Invalid text type.",
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

        # 3. Fetch the mechanic's profile
        try:
            mechanic_profile = MechanicProfile.objects.get(user=user)
        except MechanicProfile.DoesNotExist:
            response_data = {
                'data': {
                    'details': "Mechanic profile not found.",
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': "Mechanic profile not found.",
                'status': False
            }
            return Response(response_data, status=status.HTTP_404_NOT_FOUND)

        # 4. Prepare data for creating the MechanicReportApp
        mutable_data = data.copy()
        mutable_data['mechanic'] = mechanic_profile.id
        mutable_data['text_type'] = text_type
        mutable_data['text_content'] = mutable_data.get('text_content', '').strip()

        with transaction.atomic():
            # Create the MechanicReportApp instance
            serializer = MechanicReportAppSerializer(data=mutable_data)
            if serializer.is_valid():
                serializer.save()
                response_data = {
                    'data': {
                        'report': serializer.data,
                        'status': 'success',
                        'code': status.HTTP_201_CREATED
                    },
                    'message': 'Report submitted successfully.',
                    'status': True
                }
                return Response(response_data, status=status.HTTP_201_CREATED)
            else:
                # Handle validation errors
                error_messages = []
                for field, messages in serializer.errors.items():
                    if isinstance(messages, list):
                        error_messages.append(f'{field}: {", ".join(str(msg) for msg in messages)}')
                    else:
                        error_messages.append(f'{field}: {messages}')
                formatted_message = ', '.join(error_messages)
                response_data = {
                    'data': {
                        'details': formatted_message,
                        'status': 'error',
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': "Validation error occurred.",
                    'status': False
                }
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        response_data = {
            'data': {
                'details': str(e),
                'status': 'error',
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR
            },
            'message': "An error occurred while submitting the report.",
            'status': False
        }
        return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ***** =====  END  ===== ******


# # ***** To update payment status as success by admin *****
# {
#     "payment_date": "2025-06-20"
# }
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_mechanic_job_payment(request, mechanic_job_id):
    try:
        # Get data from request
        payment_date = request.data.get('payment_date')

        # Validate required fields
        if not payment_date:
            response_data = {
                'data': {
                    'details': 'Missing required field: payment_date',
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': 'Invalid data provided',
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve the MechanicJob
        try:
            mechanic_job = MechanicJob.objects.get(id=mechanic_job_id, is_active=True)
        except MechanicJob.DoesNotExist:
            response_data = {
                'data': {
                    'details': 'Mechanic job not found',
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': 'Invalid mechanic job ID',
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

        # Update MechanicJob payment fields
        try:
            mechanic_job.payment_date = payment_date
            mechanic_job.payment_status = 'success'
            mechanic_job.save()
        except ValidationError as e:
            response_data = {
                'data': {
                    'details': str(e),
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': 'Invalid payment date format',
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

        response_data = {
            'data': {
                'mechanic_job_id': str(mechanic_job.id),
                'payment_status': mechanic_job.payment_status,
                'payment_date': mechanic_job.payment_date,
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'Payment status updated successfully',
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
            'message': 'Internal server error',
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ***** =====  END  ===== ******


# ! ***** To Mechanic Platform Fees Payment API *****
# Constant for error messages
FEE_NOT_FOUND_MESSAGE = "Platform fee record not found"

# * API to create platform fee payment via Razorpay
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_mechanic_fee_payment_razorpay(request):
    # Request body expected: {"fee_amount": 100.00}
    try:
        # Extract data from request
        data = request.data.copy()
        fee_amount = data.get('fee_amount')

        # Validate fee_amount
        # if not fee_amount or not isinstance(fee_amount, (int, float)) or fee_amount <= 0:
        if not fee_amount:
            response_data = {
                'data': {
                    'details': 'Invalid or missing fee_amount.',
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': 'Fee amount must be a positive number',
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

        # Convert fee_amount to Decimal for precise calculation
        try:
            fee_amount = Decimal(str(fee_amount)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        except (ValueError, TypeError):
            response_data = {
                'data': {
                    'details': 'Invalid fee_amount format.',
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': 'Fee amount must be a valid number',
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

        # Ensure amount in paisa is an integer
        amount_in_paisa = int(fee_amount * 100)
        if amount_in_paisa <= 0:
            response_data = {
                'data': {
                    'details': 'Amount must be a positive integer in paisa.',
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': 'Invalid fee amount',
                'status': False
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
        
        # Retrieve mechanic profile
        try:
            mechanic_profile = MechanicProfile.objects.get(user=request.user, is_active=True)
        except MechanicProfile.DoesNotExist:
            response_data = {
                'data': {
                    'details': 'Mechanic profile not found or not authorized.',
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': 'Mechanic profile not found',
                'status': False
            }
            return Response(response_data, status=status.HTTP_404_NOT_FOUND)

        # Create MechanicPlatformFee record
        platform_fee = MechanicPlatformFee.objects.create(
            mechanic=mechanic_profile,
            fee_amount=fee_amount,
            payment_status='PENDING'
        )

        # Create Razorpay order
        razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        razorpay_order = razorpay_client.order.create({
            'amount': amount_in_paisa,  # Amount in paisa
            'currency': 'INR',
            'payment_capture': '1'  # Automatic capture
        })

        # Update platform fee with Razorpay details
        platform_fee.provider_transaction_id = razorpay_order['id']
        platform_fee.save()

        # Prepare response
        response_data = {
            'data': {
                'platform_fee': MechanicPlatformFeeSerializer(platform_fee).data,
                'razorpay_order_id': razorpay_order['id'],
                'status': 'success',
                'code': status.HTTP_201_CREATED
            },
            'prefill': {
                'name': mechanic_profile.user.get_full_name(),
                'email': mechanic_profile.user.email or mechanic_profile.contact_email,
                'contact': mechanic_profile.contact_phone or mechanic_profile.user.phone_number,
                'amount': float(platform_fee.fee_amount),
                'currency': 'INR',
                'razorpay_key': settings.RAZORPAY_KEY_ID,
            },
            'message': 'Platform fee payment initiated successfully',
            'status': True
        }
        return Response(response_data, status=status.HTTP_201_CREATED)

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


# * API to handle Razorpay callback for mechanic platform fee
@api_view(['POST'])
@permission_classes([AllowAny])
def mechanic_fee_razorpay_callback(request):
    def verify_signature(response_data):
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        return client.utility.verify_payment_signature(response_data)

    if request.method == "POST":
        if "razorpay_signature" in request.data:      
            payment_id = request.data.get("razorpay_payment_id", "")
            provider_order_id = request.data.get("razorpay_order_id", "")
            signature_id = request.data.get("razorpay_signature", "")

            try:
                platform_fee = MechanicPlatformFee.objects.get(
                    provider_transaction_id=provider_order_id,
                    is_active=True
                )
            except MechanicPlatformFee.DoesNotExist:
                response_data = {
                    'data': {
                        'details': 'Platform fee record not found.',
                        'status': 'error',
                        'code': status.HTTP_404_NOT_FOUND
                    },
                    'message': FEE_NOT_FOUND_MESSAGE,
                    'status': False
                }
                return Response(response_data, status=status.HTTP_404_NOT_FOUND)

            # Update platform fee record
            platform_fee.payment_id = payment_id
            platform_fee.signature_id = signature_id
            platform_fee.save()

            if verify_signature(request.data):
                platform_fee.payment_status = "SUCCESS"
                platform_fee.is_successful = True
                platform_fee.save()

                # Update mechanic profile balances
                mechanic_profile = platform_fee.mechanic
                mechanic_profile.total_top_up += platform_fee.fee_amount
                mechanic_profile.top_up_balance += platform_fee.fee_amount
                mechanic_profile.save()

                # Serialize both platform fee and mechanic profile
                platform_fee_data = MechanicPlatformFeeSerializer(platform_fee).data
                user_data = UserSerializer(mechanic_profile.user).data

                response_data = {
                    'data': {
                        'platform_fee': platform_fee_data,
                        'user': user_data,
                        'status': 'success',
                        'code': status.HTTP_200_OK
                    },
                    'message': 'Platform fee payment successful',
                    'status': True
                }
                return Response(response_data, status=status.HTTP_200_OK)
            else:
                platform_fee.payment_status = "FAILURE"
                platform_fee.save()

                response_data = {
                    'data': {
                        'details': 'Payment verification failed.',
                        'status': 'error',
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': 'Payment verification failed',
                    'status': False
                }
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
        else:
            payment_id = request.data.get("error[metadata][payment_id]")
            provider_order_id = request.data.get("error[metadata][order_id]")

            try:
                platform_fee = MechanicPlatformFee.objects.get(
                    provider_transaction_id=provider_order_id,
                    is_active=True
                )
            except MechanicPlatformFee.DoesNotExist:
                response_data = {
                    'data': {
                        'details': 'Platform fee record not found.',
                        'status': 'error',
                        'code': status.HTTP_404_NOT_FOUND
                    },
                    'message': FEE_NOT_FOUND_MESSAGE,
                    'status': False
                }
                return Response(response_data, status=status.HTTP_404_NOT_FOUND)

            platform_fee.payment_id = payment_id
            platform_fee.payment_status = "FAILURE"
            platform_fee.save()

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


# * API to view mechanic platform fees
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsMechanic])
def view_mechanic_platform_fees(request):
    """
    Retrieve platform fee records for the logged-in mechanic, filtered by payment_status and is_active.
    Only returns fees with is_active=True for the authenticated mechanic.
    Method: POST
    URL: api/mechanic/platform-fees/view/
    Request Body: {"limit": 10, "offset": 0, "payment_status": "PENDING", "is_active": true}
    """
    try:
        if request.method == 'POST':
            # Get pagination parameters
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
                    'message': LIMIT_OFFSET_MESSAGE,
                    'status': False
                }
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

            # Get filter parameters
            payment_status = request.data.get('payment_status', None)
            is_active = request.data.get('is_active', True)  # Default to True

            # Check if user is a mechanic
            if request.user.account_type != 'mechanic':
                response_data = {
                    'data': {
                        'details': UNAUTHORIZED_ACCESS_MESSAGE,
                        'status': 'error',
                        'code': status.HTTP_403_FORBIDDEN
                    },
                    'message': UNAUTHORIZED_ACCESS_MESSAGE,
                    'status': False
                }
                return Response(response_data, status=status.HTTP_403_FORBIDDEN)

            # Retrieve mechanic profile
            try:
                mechanic_profile = MechanicProfile.objects.get(user=request.user, is_active=True)
            except MechanicProfile.DoesNotExist:
                response_data = {
                    'data': {
                        'details': 'Mechanic profile not found.',
                        'status': 'error',
                        'code': status.HTTP_404_NOT_FOUND
                    },
                    'message': 'Mechanic profile not found.',
                    'status': False
                }
                return Response(response_data, status=status.HTTP_404_NOT_FOUND)

            # Base query: only active platform fees for the mechanic
            platform_fees = MechanicPlatformFee.objects.filter(
                mechanic=mechanic_profile,
                is_active=is_active
            ).order_by('-created_at')

            # Filter by payment_status (if provided)
            if payment_status:
                platform_fees = platform_fees.filter(payment_status=payment_status)

            # Slice the queryset using limit and offset
            paginated_data = list(platform_fees[offset:offset + limit])

            # Serialize the paginated data
            serializer = MechanicPlatformFeeSerializer(paginated_data, many=True, context={'request': request})

            # Get the total number of items
            total_items = platform_fees.count()

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
                    'platform_fees': serializer.data,
                    'total_count': total_items,
                    'page_count': page_count,
                    'current_page': current_page,
                    'limit': limit,
                    'offset': offset,
                    'has_next': has_next,
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': "Platform fees retrieved successfully",
                'status': True
            }
            return Response(response_data, status=status.HTTP_200_OK)

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
        return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ! ***** =====  END  ===== ******