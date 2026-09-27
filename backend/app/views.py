# app/views.py

# Standard Library Imports
from datetime import date, datetime, timedelta
import requests
import mimetypes

# Third-party Imports
from django.conf import settings
from django.contrib.auth import authenticate
from django.core.files.base import ContentFile
from django.db import transaction
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status
from rest_framework.decorators import (
    api_view, permission_classes
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

# Local Imports
# * models
from .models import User, ContactUs, PasswordResetOTP
from vendor.models import VendorProfile

# * serializers
from .serializers import ( 
    MyTokenObtainPairSerializer, RegistrationSerializer, 
    ChangePasswordSerializer, UserSerializer, 
    )

# * messages
from .messages import (
    # Authentication and User-related Messages
    ADMIN_REGISTER_SUCCESS_MESSAGE,
    CUSTOMER_REGISTER_SUCCESS_MESSAGE,
    MECHANIC_REGISTER_SUCCESS_MESSAGE,
    EMAIL_EXIST_MESSAGE,
    EMAIL_REQUIRED_MESSAGE,
    INTERNAL_SERVER_ERROR_MESSAGE,
    LOGIN_MESSAGE,
    PASSWORD_REQUIRED_MESSAGE,
    REGISTER_SUCCESS_MESSAGE,
    USER_NOT_EXIST_MESSAGE,
    VENDOR_REGISTER_SUCCESS_MESSAGE,
    VENDOR_VERIFICATION_PENDING_MESSAGE,
    PHONE_NUMBER_EXIST_MESSAGE,
    ADMIN_ACCESS_ONLY_MESSAGE,

    # OTP Messages
    EMAIL_OTP_MESSAGE,
    PHONE_OTP_MESSAGE,
    INVALID_OTP_MESSAGE,
    EXPIRED_OTP_MESSAGE,
    OTP_COOLDOWN_MESSAGE,
    
    # Country Code and Phone Number Messages
    COUNTRY_CODE_PHONE_NUMBER_REQUIRED_MESSAGE,
    COUNTRY_CODE_PHONE_NUMBER_VERIFICATION_CODE_REQUIRED_MESSAGE,

    # Generic Error Messages
    DEFAULT_ERROR_MESSAGE,
)


# * utils
from .utils import (
    # Error Handling Utilities
    handle_error_response,
    handle_exception,
    handle_invalid_limit_offset,
    handle_invalid_method,
    handle_validation_errors,

    # Notification Utilities
    notify_admin_about_contact_request,
    send_2fa_sms,
    send_confirmation_email,
    send_password_reset_otp,
    send_registration_email,
    send_otp_email_login_admin,

    # OTP Generation Utility
    generate_otp,
    
    # Serializer Utilities
    format_serializer_errors,
)


# Create your views here.
# ***** View to Check API is running *****
# ! For Home Page
class Home(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        data = {'message': 'MotoSpar is LIVE!!'}
        return JsonResponse(data)
# ***** =====  END  ===== ******


# ***** View related to TOKEN *****
# ! For Generating New TOKEN
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]
# ***** =====  END  ===== ******


# ***** View related to Registration-via-email *****
# ! Register Admin
@api_view(['POST'])
@permission_classes([AllowAny])
def admin_registration(request):
    """
    Register a new admin user.
    Method: POST
    URL: /api/admin/register/
    """      
    try:
        if request.method != 'POST':
            # Handle invalid method error using the utility function
            return handle_invalid_method()

        # Create a mutable copy of request.data and set account_type to 'admin'
        data = request.data.copy()  # Make a mutable copy of QueryDict
        data['account_type'] = 'admin'  # Force account_type to admin before validation

        # Validate the request data using the serializer
        serializer = RegistrationSerializer(data=data)
        if not serializer.is_valid():
            # Handling validation errors using the utility function
            return handle_validation_errors(serializer.errors)     

        with transaction.atomic():
            validated_data = serializer.validated_data

            # Use the User.create_admin method to create the admin user
            user = User.create_admin(validated_data)
            
            refresh = RefreshToken.for_user(user)
            user_data = RegistrationSerializer(user).data

            return Response({
                'data': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': user_data,
                    'status': 'success',
                    'code': status.HTTP_201_CREATED
                },
                'message': ADMIN_REGISTER_SUCCESS_MESSAGE,
                'status': True
            }, status=status.HTTP_201_CREATED)
    except Exception as e:
        # Use the utility function to handle exceptions
        return handle_exception(e)


# ! Register Vendor
@api_view(['POST'])
@permission_classes([AllowAny])
def vendor_registration(request):
    """
    Register a new vendor user.
    Method: POST
    URL: /api/vendor/register/
    """
    try:
        if request.method != 'POST':
            # Handle invalid method error using the utility function
            return handle_invalid_method()

        # Create a mutable copy of request.data and set account_type to 'vendor'
        data = request.data.copy()  # Make a mutable copy of QueryDict
        data['account_type'] = 'vendor'  # Force account_type to vendor before validation

        # Validate the request data using the serializer
        serializer = RegistrationSerializer(data=data)
        if not serializer.is_valid():
            # Handling validation errors using the utility function
            return handle_validation_errors(serializer.errors)   

        with transaction.atomic():
            validated_data = serializer.validated_data

            # Use the User.create_vendor method to create the vendor user
            user = User.create_vendor(validated_data)

            # refresh = RefreshToken.for_user(user)
            # user_data = RegistrationSerializer(user).data

            return Response({
                'data': {
                    # 'refresh': str(refresh),
                    # 'access': str(refresh.access_token),
                    # 'user': user_data,
                    'status': 'success',
                    'code': status.HTTP_201_CREATED
                },
                'message': "Your registration request has been submitted. Wait for admin verification!.",
                'status': True
            }, status=status.HTTP_201_CREATED)
    except Exception as e:
        # Use the utility function to handle exceptions
        return handle_exception(e)


# ! Register Customer
@api_view(['POST'])
@permission_classes([AllowAny])
def customer_registration(request):
    """
    Register a new customer user.
    Method: POST
    URL: /api/customer/register/
    """
    try:
        if request.method != 'POST':
            # Handle invalid method error using the utility function
            return handle_invalid_method()
        
        # Create a mutable copy of request.data and set account_type to 'customer'
        data = request.data.copy()  # Make a mutable copy of QueryDict
        data['account_type'] = 'customer'  # Force account_type to customer before validation


        # Validate the request data using the serializer
        serializer = RegistrationSerializer(data=data)
        if not serializer.is_valid():
            # Handling validation errors using the utility function
            return handle_validation_errors(serializer.errors)
        
        with transaction.atomic():
            validated_data = serializer.validated_data

            # Use the User.create_customer method to create the customer user
            user = User.create_customer(validated_data)
            
            refresh = RefreshToken.for_user(user)
            user_data = RegistrationSerializer(user).data


            # * Send registration email
            # send_registration_email(user.get_full_name(), user.email)

            return Response({
                'data': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': user_data,
                    'status': 'success',
                    'code': status.HTTP_201_CREATED
                },
                'message': CUSTOMER_REGISTER_SUCCESS_MESSAGE,
                'status': True
            }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        # Use the utility function to handle exceptions
        return handle_exception(e)


# ! Register Mechanic
@api_view(['POST'])
@permission_classes([AllowAny])
def mechanic_registration(request):
    """
    Register a new mechanic user.
    Method: POST
    URL: /api/mechanic/register/
    """
    try:
        if request.method != 'POST':
            # Handle invalid method error using the utility function
            return handle_invalid_method()

        # Create a mutable copy of request.data and set account_type to 'mechanic'
        data = request.data.copy()  # Make a mutable copy of QueryDict
        data['account_type'] = 'mechanic'  # Force account_type to mechanic before validation

        # Validate the request data using the serializer
        serializer = RegistrationSerializer(data=data)
        if not serializer.is_valid():
            # Handling validation errors using the utility function
            return handle_validation_errors(serializer.errors)

        with transaction.atomic():
            validated_data = serializer.validated_data

            # Use the User.create_mechanic method to create the mechanic user
            user = User.create_mechanic(validated_data)

            # refresh = RefreshToken.for_user(user)
            # user_data = RegistrationSerializer(user).data

            return Response({
                'data': {
                    # 'refresh': str(refresh),
                    # 'access': str(refresh.access_token),
                    # 'user': user_data,
                    'status': 'error',  # ! Mechanic registration is pending admin verification
                    'code': status.HTTP_201_CREATED
                },
                'message': "Your registration request has been submitted. Wait for admin verification!.",
                'status': False
            }, status=status.HTTP_201_CREATED)
    except Exception as e:
        # Use the utility function to handle exceptions
        return handle_exception(e)
# ***** =====  END  ===== ******


# ***** View related to Login, Two Factor Auth Verification, Logout *****
# ! For Signing In user
@api_view(['POST'])
@permission_classes([AllowAny])
def login_via_email(request):
    """
    Log in a user via email and password.
    Method: POST
    URL: /api/login-via-email/
    """
    try:
        if request.method == 'POST':
            email = request.data.get('email').strip().lower() 
            password = request.data.get('password')

            # Check if email is provided
            if not email:
                return handle_error_response(
                    details=EMAIL_REQUIRED_MESSAGE,
                    message=EMAIL_REQUIRED_MESSAGE,
                    status_code=status.HTTP_400_BAD_REQUEST
                )

            # Check if password is provided
            if not password:
                return handle_error_response(
                    details=PASSWORD_REQUIRED_MESSAGE,
                    message=PASSWORD_REQUIRED_MESSAGE,
                    status_code=status.HTTP_400_BAD_REQUEST
                )

            user = authenticate(request, email=email, password=password)

            if user:
                # Check if the user is a vendor and not verified
                if user.account_type == 'vendor' and not user.is_verified:
                    return handle_error_response(
                        details=VENDOR_VERIFICATION_PENDING_MESSAGE,
                        message=VENDOR_VERIFICATION_PENDING_MESSAGE,
                        status_code=status.HTTP_403_FORBIDDEN
                    )
                
                # Check if the user is a mechanic and not verified
                if user.account_type == 'mechanic' and not user.is_verified:
                    return handle_error_response(
                        details=VENDOR_VERIFICATION_PENDING_MESSAGE,
                        message=VENDOR_VERIFICATION_PENDING_MESSAGE,
                        status_code=status.HTTP_403_FORBIDDEN
                    )
                
                # * Issue JWT tokens
                refresh = RefreshToken.for_user(user)
                serializer = UserSerializer(user)  # Use this serializer for the user

                # * Issue a successful response with relevant data
                response_data = {
                    'data': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                        'user': {
                            **serializer.data,              # ! we can add custom data if required inside the user key
                        },
                        'status': 'success',
                        'code': status.HTTP_200_OK
                    },
                    'message': LOGIN_MESSAGE,
                    'status': True
                }
                return Response(response_data, status=status.HTTP_200_OK)
            else:
                # * User does not exist or password is incorrect
                return handle_error_response(
                    details=USER_NOT_EXIST_MESSAGE,
                    message=USER_NOT_EXIST_MESSAGE,
                    status_code=status.HTTP_401_UNAUTHORIZED
                )
        else:
            # Handle invalid method error using the utility function
            return handle_invalid_method()
    except Exception as e:
        # Use the utility function to handle exceptions
        return handle_exception(e)


# ! For sending OTP while Sign in via phone number
@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp_for_sign_in_via_phone_number(request):
    """
    Send OTP for signing in via phone number.
    Method: POST
    URL: /api/send-otp/login-via-number/
    """
    try:
        # * For sending OTP via SMS
        # ? Use same for resend OTP
        if request.method == 'POST':
            country_code = request.data.get('country_code', None)
            phone_number = request.data.get('phone_number', None)

            if not country_code or not phone_number:
                return handle_error_response(
                    details=COUNTRY_CODE_PHONE_NUMBER_REQUIRED_MESSAGE,
                    message=COUNTRY_CODE_PHONE_NUMBER_REQUIRED_MESSAGE,
                    status_code=status.HTTP_400_BAD_REQUEST
                )

            # Find the user based on country code and phone number
            try:
                user = User.objects.get(country_code=country_code, phone_number=phone_number, is_active=True)
            except User.DoesNotExist:
                # * User does not exist
                return handle_error_response(
                    details=USER_NOT_EXIST_MESSAGE,
                    message=USER_NOT_EXIST_MESSAGE,
                    status_code=status.HTTP_404_NOT_FOUND
                )

            # Check if the OTP was sent less than 2 minutes ago
            if user.verification_code and user.expiration_time > timezone.now():
                time_remaining = (user.expiration_time - timezone.now()).total_seconds()
                if time_remaining < 120:  # Less than 2 minutes
                    return handle_error_response(
                        details='An OTP has already been sent. Please wait for 2 minutes before requesting a new one.',
                        message='An OTP has already been sent. Please wait for 2 minutes before requesting a new one.',
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS
                    )
                
            # Generate verification code
            verification_code = generate_otp()
            # Set verification code and expiration time
            user.verification_code = verification_code
            user.expiration_time = timezone.now() + timedelta(minutes=10)
            user.save()

            # send_2fa_otp(user.email, verification_code)
            number = str(user.country_code) + str(user.phone_number)
            send_2fa_sms(number, verification_code)

            # Return a response indicating that the verification code has been sent
            response_data = {
                'data': {
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': PHONE_OTP_MESSAGE,
                'status': True
            }
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            # Handle invalid method error using the utility function
            return handle_invalid_method()

    except Exception as e:
        # Use the utility function to handle exceptions
        return handle_exception(e)


# ! For Sign in via phone number
@api_view(['POST'])
@permission_classes([AllowAny])
def sign_in_via_phone_number(request):
    """
    Sign in via phone number.
    Method: POST
    URL: /api/login-via-number/
    """
    try:
        # * verify otp and return token 
        if request.method == 'POST':
            country_code = request.data.get('country_code', None)
            phone_number = request.data.get('phone_number', None)
            verification_code = request.data.get('verification_code')

            if not country_code or not phone_number or not verification_code:
                return handle_error_response(
                    details=COUNTRY_CODE_PHONE_NUMBER_VERIFICATION_CODE_REQUIRED_MESSAGE,
                    message=COUNTRY_CODE_PHONE_NUMBER_VERIFICATION_CODE_REQUIRED_MESSAGE,
                    status_code=status.HTTP_400_BAD_REQUEST
                )

            # Find the user based on country code and phone number
            try:
                user = User.objects.get(country_code=country_code, phone_number=phone_number, is_active=True)
            except User.DoesNotExist:
                return handle_error_response(
                    details=USER_NOT_EXIST_MESSAGE,
                    message=USER_NOT_EXIST_MESSAGE,
                    status_code=status.HTTP_404_NOT_FOUND
                )
            
            if user.expiration_time and user.expiration_time < timezone.now():
                # Code has expired
                return handle_error_response(
                    details='Verification code has expired. Resend Code',
                    message='Verification code has expired. Resend Code',
                    status_code=status.HTTP_401_UNAUTHORIZED
                )
            
            if int(user.verification_code) == int(verification_code) and user.expiration_time > timezone.now():

                # Verification successful, proceed with login
                refresh = RefreshToken.for_user(user)
                serializer = UserSerializer(user)

                # * Issue a successful response with relevant data
                response_data = {
                    'data': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                        'user': {
                            **serializer.data,              # ! we can add custom data if required inside the user key
                        },
                        'status': 'success',
                        'code': status.HTTP_201_CREATED
                    },
                    'message': LOGIN_MESSAGE,
                    'status': True
                }

                # * Delete verification_code and expiration_time after successful verification
                user.verification_code = None
                user.expiration_time = None
                user.save()
                return Response(response_data, status=status.HTTP_200_OK)
            else:
                # * Verification failed, return an error
                return handle_error_response(
                    details='Invalid verification code.',
                    message='Invalid verification code.',
                    status_code=status.HTTP_401_UNAUTHORIZED
                )

        else:
            # Handle invalid method error using the utility function
            return handle_invalid_method()

    except Exception as e:
        # Use the utility function to handle exceptions
        return handle_exception(e)


# ! For Logout user by blacklisting their TOKENS
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """
    Logout
    Method: POST
    URL: /api/logout/
    """
    try:
        # * Check if the request method is POST
        if request.method != 'POST':
            # Handle invalid method error using the utility function
            return handle_invalid_method()
        
        refresh_token = request.data.get("refresh_token")
        if not refresh_token:
            return Response({
                'data': {
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST
                },
                'message': "Refresh token is required.",
                'status': False
            }, status=status.HTTP_400_BAD_REQUEST)

        token = RefreshToken(refresh_token)
        token.blacklist()

        response_data = {
            'data': {
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': "You have been successfully logged out!",
            'status': True
        }
        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        # Use the utility function to handle exceptions
        return handle_exception(e)
# ***** =====  END  ===== ******


# ***** View related to Password Change and Reset *****
# ! For Changing Password If the user remembers it
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change password for the authenticated user.
    Method: PUT
    URL: /api/change-password/
    """
    try:
        # * Check if the request method is PUT
        if request.method != 'PUT':
            # Handle invalid method error using the utility function
            return handle_invalid_method()

        user = request.user  # Get the authenticated user
        serializer = ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            # Check old password
            if not user.check_password(serializer.validated_data.get("old_password")):
                response_data = {
                    'data': {
                        'status': 'error',
                        'code': status.HTTP_400_BAD_REQUEST
                    },
                    'message': "Wrong password.",
                    'status': False
                }
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

            # Set the new password
            user.set_password(serializer.validated_data.get("new_password"))
            user.save()

            response_data = {
                'data': {
                    'status': 'success',
                    'code': status.HTTP_200_OK,
                },
                'message': 'Password updated successfully',
                'status': True
            }
            return Response(response_data, status=status.HTTP_200_OK)

        else:
            # Handling validation errors using the utility function
            return handle_validation_errors(serializer.errors)

    except Exception as e:
        # Use the utility function to handle exceptions
        return handle_exception(e)


# ? These view are for password reset
# ! To generate password reset otp and send it into email => Required User email
@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """
    Request a password reset by sending an OTP to the user's email.
    Method: POST
    URL: /api/request-password-reset/
    """
    try:
        # * Check if the request method is POST
        if request.method != 'POST':
            # Handle invalid method error using the utility function
            return handle_invalid_method()

        email = request.data.get('email').lower().strip()
        if not email:
            return handle_error_response(
                details=EMAIL_REQUIRED_MESSAGE,
                message=EMAIL_REQUIRED_MESSAGE,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Fetch the user by email, raise error if not found
            user = User.objects.get(email=email, is_active=True)
        except User.DoesNotExist:
            # * User does not exist
            return handle_error_response(
                details=USER_NOT_EXIST_MESSAGE,
                message=USER_NOT_EXIST_MESSAGE,
                status_code=status.HTTP_404_NOT_FOUND
            )

        # Check if an OTP was sent in the last 2 minutes
        last_otp = PasswordResetOTP.objects.filter(user=user, is_valid=True).last()
        if last_otp and not last_otp.is_expired() and (timezone.now() - last_otp.created_at).total_seconds() < 120:
            # * OTP was sent less than 2 minutes ago
            # * Return an error response
            return handle_error_response(
                details='An OTP has already been sent. Please wait before requesting a new one.',
                message='An OTP has already been sent. Please wait before requesting a new one.',
                status_code=status.HTTP_429_TOO_MANY_REQUESTS
            )

        otp = generate_otp()
        PasswordResetOTP.objects.create(user=user, otp=otp)

        # Send OTP via the new utility function
        send_password_reset_otp(user.email, otp)

        response_data = {
            'data': {
                'email': email,     # ! we can add custom data if required
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'OTP sent successfully',
            'status': True
        }
        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        # Use the utility function to handle exceptions
        return handle_exception(e)


# ! To get access token for the reset token api => Required email and otp 
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp_for_reset_password(request):
    """
    Verify the OTP for password reset.
    Method: POST
    URL: /api/password-reset/verify-otp/
    """
    try:
        # * Check if the request method is POST
        if request.method != 'POST':
            # Handle invalid method error using the utility function
            return handle_invalid_method()
        
        otp = request.data.get('otp')
        user_email = request.data.get('email').lower().strip()

        if not otp or not user_email:
            # * Handle missing OTP or email
            # * Return an error response
            return handle_error_response(
                details=DEFAULT_ERROR_MESSAGE,
                message="OTP and email are required.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        # * Fetch the user by email
        otp_instance = PasswordResetOTP.objects.filter(
            user__email=user_email, otp=otp, is_valid=True
        ).last()

        if not otp_instance:
            # * OTP does not exist or is invalid
            # * Return an error response
            return handle_error_response(
                details=DEFAULT_ERROR_MESSAGE,
                message="Invalid OTP.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # * Check if the OTP is expired
        if otp_instance.is_expired():
            # * OTP has expired
            # * Return an error response
            return handle_error_response(
                details=DEFAULT_ERROR_MESSAGE,
                message="OTP has expired.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        # * Mark the OTP as verified
        otp_instance.is_verified = True
        otp_instance.save()

        # ! Delete all other OTP records for the user
        PasswordResetOTP.objects.filter(user=otp_instance.user).exclude(id=otp_instance.id).delete()

        # Return a simple success message
        response_data = {
            'data': {
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': "OTP verified successfully.",
            'status': True
        }
        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        # Use the utility function to handle exceptions
        return handle_exception(e)


# ! To set new password => Required new_password and confirm_password
@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_with_token(request):
    """
    Reset the password using the verified OTP.
    Method: POST
    URL: /api/reset-password/
    """
    try:
        # * Check if the request method is POST
        if request.method != 'POST':
            # Handle invalid method error using the utility function
            return handle_invalid_method()

        # Extract the email, new password, and confirm password from the request
        email = request.data.get('email').lower().strip()
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        # Validate the input
        if not email or not new_password or not confirm_password:
            # * Handle missing email, new password, or confirm password
            # * Return an error response
            return handle_error_response(
                details=DEFAULT_ERROR_MESSAGE,
                message="Email, new password, and confirm password are required.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        if new_password != confirm_password:
            # * Passwords do not match
            # * Return an error response
            return handle_error_response(
                details=DEFAULT_ERROR_MESSAGE,
                message="Passwords do not match.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        otp_instance = PasswordResetOTP.objects.filter(user__email=email, is_verified=True).first()

        if not otp_instance:
            return Response({
                'data': {
                    'status': 'error',
                    'code': status.HTTP_404_NOT_FOUND
                },
                'message': 'No verified OTP found for this email.',
                'status': False
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Update the user's password
        user = otp_instance.user
        user.set_password(new_password)
        user.save()

        # Issue JWT tokens
        refresh = RefreshToken.for_user(user)

        # Delete the OTP entry after successful password reset
        otp_instance.hard_delete()

        serializer = UserSerializer(user)

        return Response({
            'data': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    **serializer.data,              # ! we can add custom data if required inside the user key
                },
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'Password reset successfully.',
            'status': True
        }, status=status.HTTP_200_OK)

    except Exception as e:
        # Use the utility function to handle exceptions
        return handle_exception(e)
# ***** =====  END  ===== ******


# ***** Sign IN / Register via GMAIL *****
@api_view(['GET'])
@permission_classes([AllowAny])
def google_oauth2_login(request):
    """
    This will return the Google OAuth2 login URL.
    """

    try:
        redirect_uri = settings.GOOGLE_OAUTH2_REDIRECT_URI
        client_id = settings.GOOGLE_OAUTH2_CLIENT_ID
        auth_url = (
            'https://accounts.google.com/o/oauth2/auth'
            f'?response_type=code&client_id={client_id}&redirect_uri={redirect_uri}&scope=email profile openid'
        )

        # * Issue a successful response with relevant data
        response_data = { 
            'data': {
                'auth_url': auth_url,
                'status': 'success',
                'code': status.HTTP_200_OK
            },
            'message': 'Google OAuth2 login URL generated successfully',
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


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def sign_in_via_gmail(request):
    """
    This will handle the callback from Google OAuth2 login. 
    It will exchange the authorization code for an access token 
    and then use that to retrieve user information.
    Method: POST
    URL: /api/login/google/    
    """
    try:
        # * Check if the request method is POST
        if request.method != 'POST':
            # Handle invalid method error using the utility function
            return handle_invalid_method()
                
        access_token = request.data.get('access_token')
        account_type = request.data.get('account_type', 'customer')  # ? CHOICES = "customer" / "vendor" / "admin" / "mechanic"

        # * Using Google API to verify the access token
        user_info_url = 'https://www.googleapis.com/oauth2/v1/userinfo'
        headers = {'Authorization': f'Bearer {access_token}'}
        user_info_response = requests.get(user_info_url, headers=headers)

        # * Check if the user info response is successful
        if user_info_response.status_code != 200:
            # * Failed to obtain user info
            # * Return an error response
            return handle_error_response(
                details=DEFAULT_ERROR_MESSAGE,
                message='Failed to obtain user info',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        user_info = user_info_response.json()

        # Example: Assuming email is used for login
        email = user_info.get('email')
        if not email:
            # * Email not found in user info
            # * Return an error response
            return handle_error_response(
                details=DEFAULT_ERROR_MESSAGE,
                message='Email not found in user info',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Extract additional user information
        given_name = user_info.get('given_name', '')
        family_name = user_info.get('family_name', '')

        # Find or create user based on email
        user, created = User.objects.get_or_create(email=email, account_type=account_type)

        # Update user details if they have changed
        if not created:
            if user.first_name != given_name:
                user.first_name = given_name
            if user.last_name != family_name:
                user.last_name = family_name
            if user.username != email:
                user.username = email
            user.save()
        else:
            user.first_name = given_name
            user.last_name = family_name
            user.username = email
            user.account_type=account_type    # ! Adding the Account Type Here
            user.save()

            # Send a message indicating that the registration request has been submitted
            if user.account_type == 'vendor':
                # Create the VendorProfile for the user
                VendorProfile.objects.get_or_create(user=user)

                response_data = {
                    'data': {
                        'status': 'success',
                        'code': status.HTTP_201_CREATED
                    },
                    'message': "Your registration request has been submitted. Wait for admin verification!",
                    'status': True
                }
                return Response(response_data, status=status.HTTP_201_CREATED)

        # Check if the user is a vendor and not verified
        if user.account_type == 'vendor' and not user.is_verified:
            response_data = {
                'data': {
                    'status': 'error',
                    'code': status.HTTP_403_FORBIDDEN
                },
                'message': "Your account is not verified. Please wait for admin verification.",
                'status': False
            }
            return Response(response_data, status=status.HTTP_403_FORBIDDEN)

        # Check if the user is a mechanic and not verified
        if user.account_type == 'mechanic' and not user.is_verified:
            return handle_error_response(
                details=VENDOR_VERIFICATION_PENDING_MESSAGE,
                message=VENDOR_VERIFICATION_PENDING_MESSAGE,
                status_code=status.HTTP_403_FORBIDDEN
            )
            
        # * Issue JWT tokens
        refresh = RefreshToken.for_user(user)
        serializer = UserSerializer(user)  # Use this serializer for the user
        
        # * Issue a successful response with relevant data
        response_data = {
            'data': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    **serializer.data,              # ! we can add custom data if required inside the user key
                },
                'status': 'success',       
                'code': status.HTTP_200_OK
            },
            'message': 'User Logged in successfully.',
            'status': True
        }
        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        # Use the utility function to handle exceptions
        return handle_exception(e)
# ***** =====  END  ===== ******


# ***** Sign IN / Register via Facebook *****
@api_view(['POST'])
@permission_classes([AllowAny])
def facebook_oauth2_callback(request):
    """
    Handles Facebook OAuth2 callback using provided user information 
    (first name, last name, email, profile picture URL) without access token.
    """
    try:

        # * Check if the request method is POST
        if request.method != 'POST':
            # Handle invalid method error using the utility function
            return handle_invalid_method()
                
        # Extract user info from request data
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        email = request.data.get('email')
        profile_picture_url = request.data.get('image_url')
        device_token = request.data.get('device_token', None)
        account_type = request.data.get('account_type', 'customer')  # ? CHOICES = "customer" / "vendor" / "admin" / "mechanic"

        # Validate required fields
        if not all([email, first_name, last_name]):
            return JsonResponse({
                'data': {'status': 'error', 'code': 400},
                'message': 'Email, first name, and last name are required',
                'status': False
            }, status=400)
        
        # Find or create user based on email
        user, created = User.objects.get_or_create(email=email)

        # Update user details if they have changed
        if not created:
            if user.first_name != first_name:
                user.first_name = first_name
            if user.last_name != last_name:
                user.last_name = last_name
            if user.username != email:
                user.username = email
            user.save()
        else:
            user.first_name = first_name
            user.last_name = last_name
            user.username = email
            user.account_type = account_type
            user.save()

            # Send a message indicating that the registration request has been submitted for vendors
            if user.account_type == 'vendor':
                # Create the VendorProfile for the user
                VendorProfile.objects.get_or_create(user=user)

                response_data = {
                    'data': {
                        'status': 'success',
                        'code': status.HTTP_201_CREATED
                    },
                    'message': "Your registration request has been submitted. Wait for admin verification!",
                    'status': True
                }
                return Response(response_data, status=status.HTTP_201_CREATED)

        # Check if the user is a vendor and not verified
        if user.account_type == 'vendor' and not user.is_verified:
            response_data = {
                'data': {
                    'status': 'error',
                    'code': status.HTTP_403_FORBIDDEN
                },
                'message': "Your account is not verified. Please wait for admin verification.",
                'status': False
            }
            return Response(response_data, status=status.HTTP_403_FORBIDDEN)

        # Check if the user is a mechanic and not verified
        if user.account_type == 'mechanic' and not user.is_verified:
            return handle_error_response(
                details=VENDOR_VERIFICATION_PENDING_MESSAGE,
                message=VENDOR_VERIFICATION_PENDING_MESSAGE,
                status_code=status.HTTP_403_FORBIDDEN
            )
    
        # Check if user is deactivated
        if not user.is_active:
            return JsonResponse({
                'data': {'status': 'error', 'code': status.HTTP_403_FORBIDDEN},
                'message': 'Account has been deactivated.',
                'status': False
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Update device_token if provided
        if device_token:
            user.device_token = device_token

        # Save or update profile picture for new users or if URL is provided
        if profile_picture_url and (created or profile_picture_url != user.profile_picture.url):
            try:
                image_response = requests.get(profile_picture_url)
                if image_response.status_code == 200:
                    content_type = image_response.headers.get('Content-Type', 'image/jpeg')
                    extension = mimetypes.guess_extension(content_type) or '.jpg'
                    safe_filename = f"profile_{user.id}_{email.replace('@', '_')}{extension}"
                    user.profile_picture.save(safe_filename, ContentFile(image_response.content), save=False)
            except Exception as e:
                # Log error but don't fail the entire request
                print(f"Failed to save profile picture: {str(e)}")
                
        user.save()

        # * Issue JWT tokens
        refresh = RefreshToken.for_user(user)
        serializer = UserSerializer(user)  # Use this serializer for the user
        
        # * Issue a successful response with relevant data
        response_data = {
            'data': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    **serializer.data,              # ! we can add custom data if required inside the user key
                },
                'status': 'success',       
                'code': status.HTTP_200_OK
            },
            'message': 'User Logged in successfully.',
            'status': True
        }
        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        # Use the utility function to handle exceptions
        return handle_exception(e)
# ***** =====  END  ===== ******


# ***** Views for User Profile Management *****
# ! View User Profile
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """
    Get the profile of the authenticated user.
    Method: GET
    URL: /api/user/profile/
    """
    user = request.user
    try:
        if request.method != 'GET':
            # * Handle invalid method error using the utility function
            return handle_invalid_method()
        
        serializer = UserSerializer(user)

        # * New response format
        response_data = {
            'data': {
                'user': {
                    **serializer.data,              # ! we can add custom data if required inside the user key
                },
                'status': 'success',  
                'code': status.HTTP_200_OK
            },
            'message': 'User Profile Data.',
            'status': True
        }
        # * Return the response data
        return Response(response_data, status=status.HTTP_200_OK)
    except Exception as e:
        # Use the utility function to handle exceptions
        return handle_exception(e)


# ! Update User Profile
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """
    Update the profile of the authenticated user.
    Method: PATCH
    URL: /api/user/profile/update/
    """
    try:
        # * Check if the request method is PATCH
        if request.method != 'PATCH':
            # Handle invalid method error using the utility function
            return handle_invalid_method()
        data = request.data
        user = request.user

        # * Check for email uniqueness only if it is provided in the request data
        if 'email' in data:
            new_email = data['email'].strip().lower()
            if User.objects.filter(email=new_email).exclude(id=user.id).exists():
                # * Email already exists
                # * Return an error response
                return handle_error_response(
                    details=EMAIL_EXIST_MESSAGE,
                    message=EMAIL_EXIST_MESSAGE,
                    status_code=status.HTTP_400_BAD_REQUEST
                )

        # * Check for phone number and country code uniqueness only if both are provided in the request data
        if 'phone_number' in data and 'country_code' in data:
            new_phone_number = data['phone_number']
            new_country_code = data['country_code']
            if User.objects.filter(phone_number=new_phone_number, country_code=new_country_code).exclude(id=user.id).exists():
                # * Phone number already exists
                # * Return an error response
                return handle_error_response(
                    details=PHONE_NUMBER_EXIST_MESSAGE,
                    message=PHONE_NUMBER_EXIST_MESSAGE,
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            

        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            with transaction.atomic():
                serializer.save(is_active=True)

                # * New response format
                response_data = {
                    'data': {
                        'user': {
                            **serializer.data,              # ! we can add custom data if required inside the user key
                        },
                        'status': 'success',
                        'code': status.HTTP_200_OK
                    },
                    'message': 'User Profile Updated Successfully.',
                    'status': True
                }
                return Response(response_data, status=status.HTTP_200_OK)
        else:
            # Handling validation errors using the utility function
            return handle_validation_errors(serializer.errors)
        
    except Exception as e:
        # Use the utility function to handle exceptions
        return handle_exception(e)
# ***** =====  END  ===== ******


# ***** Views for Contact Us *****
@api_view(['POST'])
@permission_classes([AllowAny])
def contact_us(request):
    """
    Contact Us API
    Method: POST
    URL: /api/contact-us/
    """    
    try:
        # * Check if the request method is POST
        if request.method != 'POST':
            # * Handle invalid method error using the utility function
            return handle_invalid_method()
    
        # * Parse the request data
        data = request.data

        # * Create a new ContactUs instance
        contact_us_instance = ContactUs(
            name=data.get('name'),
            email=data.get('email'),
            phone_number=data.get('phone_number'),
            message=data.get('message')
        )

        # * Save the instance to the database
        contact_us_instance.save()

        # * Send confirmation email to the user
        send_confirmation_email(contact_us_instance)
        
        # * Notify admin about the new contact request
        notify_admin_about_contact_request(contact_us_instance)

        # * Return a success response
        response_data = {
            'data': {
                'status': 'success',
                'code': status.HTTP_201_CREATED
            },
            'message': 'Thank You for Contacting Us.',
            'status': True
        }
        return JsonResponse(response_data, status=status.HTTP_201_CREATED)
    except Exception as e:
        # Use the utility function to handle exceptions
        return handle_exception(e)
# ***** =====  END  ===== ******


# ***** View related to Admin Panel Login via Email and 2FA *****
@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login_with_otp(request):
    """
    Log in an admin user via email and password, then send OTP.
    Method: POST
    URL: /api/admin-login-with-otp/
    """
    try:
        if request.method == 'POST':
            email = request.data.get('email').strip().lower()
            password = request.data.get('password')

            # Check if email is provided
            if not email:
                return handle_error_response(
                    details=EMAIL_REQUIRED_MESSAGE,
                    message=EMAIL_REQUIRED_MESSAGE,
                    status_code=status.HTTP_400_BAD_REQUEST
                )

            # Check if password is provided
            if not password:
                return handle_error_response(
                    details=PASSWORD_REQUIRED_MESSAGE,
                    message=PASSWORD_REQUIRED_MESSAGE,
                    status_code=status.HTTP_400_BAD_REQUEST
                )

            user = authenticate(request, email=email, password=password)

            if user:
                # Check if user is admin
                if user.account_type != 'admin':
                    return handle_error_response(
                        details=ADMIN_ACCESS_ONLY_MESSAGE,
                        message=ADMIN_ACCESS_ONLY_MESSAGE,
                        status_code=status.HTTP_403_FORBIDDEN
                    )
                # Check if an OTP was sent less than 2 minutes ago
                if user.expiration_time and user.expiration_time > timezone.now() - timedelta(minutes=2):
                    return handle_error_response(
                        details=OTP_COOLDOWN_MESSAGE,
                        message=OTP_COOLDOWN_MESSAGE,
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS
                    )
                
                # Generate and store OTP
                otp = generate_otp()
                user.verification_code = otp
                user.expiration_time = timezone.now() + timedelta(minutes=10)
                user.save()

                # Send OTP via email
                send_otp_email_login_admin(user)

                return Response({
                    'data': {
                        'status': 'success',
                        'code': status.HTTP_200_OK
                    },
                    'message': EMAIL_OTP_MESSAGE,
                    'status': True
                }, status=status.HTTP_200_OK)
            else:
                return handle_error_response(
                    details=USER_NOT_EXIST_MESSAGE,
                    message=USER_NOT_EXIST_MESSAGE,
                    status_code=status.HTTP_401_UNAUTHORIZED
                )
        else:
            return handle_invalid_method()
    except Exception as e:
        # Use the utility function to handle exceptions
        return handle_exception(e)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_admin_otp(request):
    """
    Verify admin OTP.
    Method: POST
    URL: /api/verify-admin-otp/
    """
    try:
        if request.method == 'POST':
            email = request.data.get('email').strip().lower()
            otp = request.data.get('otp')

            # Check if email is provided
            if not email:
                return handle_error_response(
                    details=EMAIL_REQUIRED_MESSAGE,
                    message=EMAIL_REQUIRED_MESSAGE,
                    status_code=status.HTTP_400_BAD_REQUEST
                )

            # Check if OTP is provided
            if not otp:
                return handle_error_response(
                    details='OTP is required',
                    message='OTP is required',
                    status_code=status.HTTP_400_BAD_REQUEST
                )

            try:
                user = User.objects.get(email=email, account_type='admin')
            except User.DoesNotExist:
                return handle_error_response(
                    details=USER_NOT_EXIST_MESSAGE,
                    message=USER_NOT_EXIST_MESSAGE,
                    status_code=status.HTTP_401_UNAUTHORIZED
                )

            # Check OTP validity
            if user.verification_code != otp:
                return handle_error_response(
                    details=INVALID_OTP_MESSAGE,
                    message=INVALID_OTP_MESSAGE,
                    status_code=status.HTTP_401_UNAUTHORIZED
                )

            # Check OTP expiration
            if user.expiration_time < timezone.now():
                return handle_error_response(
                    details=EXPIRED_OTP_MESSAGE,
                    message=EXPIRED_OTP_MESSAGE,
                    status_code=status.HTTP_401_UNAUTHORIZED
                )

            # OTP is valid, issue JWT tokens
            refresh = RefreshToken.for_user(user)
            serializer = UserSerializer(user)

            # Clear OTP fields
            user.verification_code = None
            user.expiration_time = None
            user.save()

            return Response({
                'data': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': {
                        **serializer.data,              # ! we can add custom data if required inside the user key
                    },
                    'status': 'success',
                    'code': status.HTTP_200_OK
                },
                'message': LOGIN_MESSAGE,
                'status': True
            }, status=status.HTTP_200_OK)
        else:
            return handle_invalid_method()
    except Exception as e:
        # Use the utility function to handle exceptions
        return handle_exception(e)
# ***** =====  END  ===== ******