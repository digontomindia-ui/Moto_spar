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
    DEFAULT_ERROR_MESSAGE, INVALID_METHOD_MESSAGE, INTERNAL_SERVER_ERROR_MESSAGE, REVIEW_NOT_FOUND_MESSAGE,
    CATEGORY_NOT_FOUND_MESSAGE, SUBCATEGORY_NOT_FOUND_MESSAGE, PRODUCT_NOT_FOUND_MESSAGE, PAGINATED_REVIEWS_MESSAGE,
    LIMIT_OFFSET_MESSAGE, PAGINATED_PRODUCTS_MESSAGE, RATING_RANGE_MESSAGE, INVALID_RATING_MESSAGE
    )
from .models import (
    Review, ReviewImage
    )
from .serializers import (
    ReviewSerializer, ReviewImageSerializer
    )
from order.models import OrderItem
from product.models import Product
from django.http import Http404


# Create your views here.


# ***** =====  add / edit / view / delete Reviews ===== *****
# ? To add reviews, only customer who have purchased and get DELIVERED
# ? can be able to add review for a product
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
def add_review(request):
    """
    View to add a new review and associated images for a product.
    """
    try:
        user = request.user
        data = request.data
        rating = data.get("rating")
        product_id = data.get("product")

        # Make a copy of the request
        mutable_data = request.data.copy()
        mutable_data['user'] = user.id

        # 1. Check if the rating is within the 0.0 to 5.0 range
        try:
            rating = float(rating)
            if not (0.0 <= rating <= 5.0):
                response_data = {
                    'data': {
                        'details': RATING_RANGE_MESSAGE,
                        'status': 'error',
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': RATING_RANGE_MESSAGE,
                    'status': False
                }
                return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            response_data = {
                'data': {
                    'details': str(e),
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': INVALID_RATING_MESSAGE,
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)
        
        # 2. Check if the product exists and is active
        try:
            product = get_object_or_404(Product, id=product_id, is_active=True)
        except Product.DoesNotExist:
            response_data = {
                'data': {
                    'details': "Product not found or inactive",
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': "Product not found or inactive",
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

        # 3. Verify that the user has not already reviewed this product
        if Review.objects.filter(product=product, user=user).exists():
            response_data = {
                'data': {
                    'details': "You have already reviewed this product",
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': "You have already reviewed this product",
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)

        # 4. Ensure the user purchased a variant of this product and it was delivered
        delivered_order_items = OrderItem.objects.filter(
            order__customer=user,
            variant__product=product,
            order_status='DELIVERED'
        )

        if not delivered_order_items.exists():
            response_data = {
                'data': {
                    'details': "You can only review products you have purchased and received.",
                    'status': 'error',
                    'code': status.HTTP_403_FORBIDDEN
                },
                'message': "You can only review products you have purchased and received.",
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_403_FORBIDDEN)

        with transaction.atomic():
            # Step 1: Save the Review
            review_serializer = ReviewSerializer(data=mutable_data, context={'request': request})
            if review_serializer.is_valid():
                # Save the review instance
                review_instance = review_serializer.save(user=request.user, is_active=True)

                # Step 2: Handle multiple review images if provided
                images = request.FILES.getlist('images')  # Get list of images from request
                image_error_messages = []

                for image in images:
                    image_data = {
                        # 'review': review_instance.id,  # Link the image to the created review
                        'image': image, 
                        'caption': request.data.get('caption', '')  # Optional caption field
                    }
                    image_serializer = ReviewImageSerializer(data=image_data)
                    if image_serializer.is_valid():
                        image_serializer.save(is_active=True, review=review_instance)
                    else:
                        # Log errors for any failed image uploads
                        for field, messages in image_serializer.errors.items():
                            image_error_messages.append(f'{field}: {", ".join(messages)}')

                # Step 3: Prepare the response
                response_data = {
                    'data': {
                        'review': review_serializer.data,
                        'status': 'success',
                        'code': status.HTTP_201_CREATED
                    },
                    'message': 'Review added successfully',
                    'status': True
                }
                if image_error_messages:
                    # Add image upload errors to response if any
                    response_data['data']['image_errors'] = image_error_messages
                    response_data['message'] = 'Review added, but some images could not be uploaded'
                return JsonResponse(response_data, status=status.HTTP_201_CREATED)

            else:
                # Handle review validation errors
                error_messages = []
                for field, messages in review_serializer.errors.items():
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


# ? To edit reviews, only customer who had made a review
# ? can be able to edit that particular review 
@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsCustomer])
def edit_review(request, review_id):
    """
    View to edit an existing review. Allows the user to update the review text, 
    rating, and add or remove images.
    """
    try:
        user = request.user
        data = request.data
        images = request.FILES.getlist('images')  # New images to add
        images_to_delete = data.get("images_to_delete", [])  # Image IDs to delete
        
        # Retrieve the review and ensure the user is the author
        try:
            review = get_object_or_404(Review, id=review_id, user=user)
        except Review.DoesNotExist:
            return JsonResponse({
                'data': {
                    'details': "Review not found",
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': "Review not found",
                'status': False
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if the rating (if provided) is within the 0.0 to 5.0 range
        if "rating" in data:
            try:
                rating = float(data.get("rating"))
                if not (0.0 <= rating <= 5.0):
                    return JsonResponse({
                        'data': {
                            'details': RATING_RANGE_MESSAGE, 
                            'status': 'error',
                            'code': status.HTTP_400_BAD_REQUEST
                        },
                        'message': RATING_RANGE_MESSAGE,
                        'status': False
                    }, status=status.HTTP_400_BAD_REQUEST)
            except ValueError:
                return JsonResponse({
                    'data': {
                        'details': INVALID_RATING_MESSAGE, 
                        'status': 'error',
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': INVALID_RATING_MESSAGE,
                    'status': False
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Perform the update in an atomic transaction
        with transaction.atomic():
            # Step 1: Update the review fields
            review_serializer = ReviewSerializer(review, data=data, partial=True)
            if review_serializer.is_valid():
                review_serializer.save()
            else:
                # Handle review validation errors
                error_messages = [f"{field}: {', '.join(messages)}" for field, messages in review_serializer.errors.items()]
                return JsonResponse({
                    'data': {
                        'details': ', '.join(error_messages), 
                        'status': 'error',
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': "Review update failed",
                    'status': False
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Step 2: Delete specified images
            for image_id in images_to_delete:
                try:
                    image = ReviewImage.objects.get(id=image_id, review=review)
                    image.delete()
                except ReviewImage.DoesNotExist:
                    # If any image doesn't exist, add it to the error response
                    return JsonResponse({
                        'data': {
                            'details': f"Image ID {image_id} not found", 
                            'status': 'error',
                            'code': status.HTTP_400_BAD_REQUEST
                        },
                        'message': "Some images to delete were not found",
                        'status': False
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Step 3: Add new images
            image_errors = []
            for image in images:
                image_data = {
                    'review': review.id,
                    'image': image,
                    'caption': data.get('caption', '')
                }
                image_serializer = ReviewImageSerializer(data=image_data)
                if image_serializer.is_valid():
                    image_serializer.save(is_active=True)
                else:
                    # Collect error messages for images
                    image_errors.extend([f"{field}: {', '.join(messages)}" for field, messages in image_serializer.errors.items()])
            
            # Step 4: Prepare response
            response_data = {
                'data': {
                    'review': review_serializer.data,
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': 'Review updated successfully',
                'status': True
            }
            if image_errors:
                response_data['data']['image_errors'] = image_errors
                response_data['message'] = 'Review updated, but some images could not be uploaded'
            
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


# ? A customer can delete his own review
# ? Else "admin" can delete any review
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_review(request, review_id):
    """
    View to edit an existing review, update its details, and manage associated images.
    """
    try:
        user = request.user
        review = Review.objects.get(id=review_id)

        # Check if the user is the one who created the review or is an admin
        if review.user != user and user.account_type != "admin":
            response_data = {
                'data': {
                    'details': "You do not have permission to edit this review.",
                    'status': 'error',
                    'code': status.HTTP_403_FORBIDDEN
                },
                'message': "Permission denied.",
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_403_FORBIDDEN)

        # Step 1: Delete the review's associated images
        review_images = ReviewImage.objects.filter(review=review)
        for image in review_images:
            image.delete()  # Permanently delete each image

        # Step 2: Delete the review
        review.delete()

        # Step 3: Respond with success message
        response_data = {
            'data': {
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'Review and associated images deleted successfully',
            'status': True
        }
        return JsonResponse(response_data, status=status.HTTP_200_OK)

    except Review.DoesNotExist:
        response_data = {
            'data': {
                'details': REVIEW_NOT_FOUND_MESSAGE,
                'status': 'error',
                'code': status.HTTP_404_NOT_FOUND
            },
            'message': REVIEW_NOT_FOUND_MESSAGE,
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        # Handle any other uncaught exceptions uniformly
        response_data = {
            'data': {
                'details': str(e),
                'status': 'error',
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR
            },
            'message': "Internal server error.",
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ? A customer can delete his own review's images
# ? Else "admin" can delete any review images
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_review_image(request, review_id, image_id):
    """
    View to delete a specific image associated with a review.
    """
    try:
        user = request.user
        review = Review.objects.get(id=review_id)

        # Check if the user is the one who created the review or is an admin
        if review.user != user and user.account_type != "admin":
            response_data = {
                'data': {
                    'details': "You do not have permission to delete this image.",
                    'status': 'error',
                    'code': status.HTTP_403_FORBIDDEN
                },
                'message': "Permission denied.",
                'status': False
            }
            return JsonResponse(response_data, status=status.HTTP_403_FORBIDDEN)
        
        # Get the specific image associated with the review
        image = ReviewImage.objects.get(id=image_id, review=review)
        
        # Delete the image
        image.delete()


        # Respond with success message
        response_data = {
            'data': {
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'Image deleted successfully',
            'status': True
        }
        return JsonResponse(response_data, status=status.HTTP_200_OK)

    except Review.DoesNotExist:
        response_data = {
            'data': {
                'details': REVIEW_NOT_FOUND_MESSAGE,
                'status': 'error',
                'code': status.HTTP_404_NOT_FOUND
            },
            'message': REVIEW_NOT_FOUND_MESSAGE,
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

    except ReviewImage.DoesNotExist:
        response_data = {
            'data': {
                'details': "Image not found or does not belong to this review.",
                'status': 'error',
                'code': status.HTTP_404_NOT_FOUND
            },
            'message': "Image not found.",
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        # Handle any other uncaught exceptions uniformly
        response_data = {
            'data': {
                'details': str(e),
                'status': 'error',
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR
            },
            'message': "Internal server error.",
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ? This will return allthe review for a product 
# ? Also if the user has added a review
# ? It will return a flag "is_reviewed_by_user" 
# ? == "true" / "false" as well
@api_view(['POST'])
@permission_classes([AllowAny])
def view_reviews(request, product_id):
    try:
        # Extract limit and offset from request data
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
            return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)
        
        # Retrieve all active reviews for the given product
        reviews = Review.objects.filter(product_id=product_id, is_active=True).order_by('-created_at')
        
        # If the user is authenticated, check if they have submitted a review for this product
        user = request.user if request.user.is_authenticated else None
        user_has_reviewed = reviews.filter(user=user).exists() if user else False

        # Slice the queryset using limit and offset
        paginated_data = list(reviews[offset:offset + limit])
        
        # Serialize reviews
        serializer = ReviewSerializer(paginated_data, many=True, context={'request': request})
        
        # Attach user-specific data (e.g., user_has_reviewed) to the response
        serialized_data = serializer.data
        for review in serialized_data:
            review['is_reviewed_by_user'] = user_has_reviewed if user else False
        
        # Get the total number of items
        total_items = reviews.count()
        
        # Calculate pagination details
        page_count = (total_items + limit - 1) // limit if limit > 0 else 0
        current_page = (offset // limit) + 1 if limit > 0 else 0
        has_next = (offset + limit) < total_items
        
        response_data = {
            'data': {
                'reviews': serialized_data,
                'total_count': total_items,
                'page_count': page_count,
                'current_page': current_page,
                'limit': limit,
                'offset': offset,
                'has_next': has_next,
                'is_reviewed_by_user': user_has_reviewed,  # Overall flag
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': PAGINATED_REVIEWS_MESSAGE,
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