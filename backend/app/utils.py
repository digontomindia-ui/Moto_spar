# app/utils.py

# Standard Library Imports
import random
import string
from datetime import datetime
from typing import Any

# Third-party Imports
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

# local Imports
from .messages import (
    HTML_FILE_TYPE, INTERNAL_SERVER_ERROR_MESSAGE, INVALID_METHOD_MESSAGE,
    DEFAULT_ERROR_MESSAGE
)


# ***** Utility functions for structured error response *****
# ? Format serializer errors 
def format_serializer_errors(errors: dict) -> str:
    """
    Format serializer errors into a readable string.

    Args:
        errors (dict): A dictionary of serializer errors.

    Returns:
        str: A formatted string of errors.
    """
    return ', '.join(f"{k}: {', '.join(v)}" for k, v in errors.items())


# ? To handle validation errors uniformly
def handle_validation_errors(errors: dict, message: str = DEFAULT_ERROR_MESSAGE) -> Response:
    """
    Utility function to handle validation errors uniformly.
    Returns a Response object with the appropriate error details.

    Args:
        errors (dict): A dictionary of serializer errors.
        message (str): The error message (default: DEFAULT_ERROR_MESSAGE).

    Returns:
        Response: A Response object containing the error details.
    """
    formatted_errors = format_serializer_errors(errors)  # Use your existing utility function
    response_data = {
        'data': {
            'details': formatted_errors,
            'status': 'error',
            'code': status.HTTP_400_BAD_REQUEST
        },
        'message': message,
        'status': False
    }
    return Response(response_data, status=status.HTTP_400_BAD_REQUEST)


# ? To handle invalid method errors uniformly
def handle_invalid_method() -> Response:
    """
    Utility function to handle invalid method errors uniformly.
    Returns a Response object with the appropriate error details.

    Returns:
        Response: A Response object containing the error details.
    """
    response_data = {
        'data': {
            "status": "error",
            'code': status.HTTP_400_BAD_REQUEST,
        },
        'message': INVALID_METHOD_MESSAGE,
        'status': False
    }
    return Response(response_data, status=status.HTTP_400_BAD_REQUEST)


# ? To handle exceptions uniformly
def handle_exception(e: Exception) -> Response:
    """
    Utility function to handle exceptions uniformly.
    Returns a JsonResponse with the appropriate error details.

    Args:
        e (Exception): The exception to handle.

    Returns:
        Response: A Response object containing the error details.
    """
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


# ? To handle invalid limit and offset errors uniformly
def handle_invalid_limit_offset() -> Response:
    """
    Utility function to handle invalid limit and offset errors uniformly.
    Returns a Response object with the appropriate error details.

    Returns:
        Response: A Response object containing the error details.
    """

    response_data = {
        'data': {
            'details': 'Limit and offset must be non-negative',
            'status': 'error',
            'code': status.HTTP_400_BAD_REQUEST
        },
        'message': INTERNAL_SERVER_ERROR_MESSAGE,
        'status': False
    }
    return Response(response_data, status=status.HTTP_400_BAD_REQUEST)


# ? To handle error responses uniformly
def handle_error_response(details: str, message: str, status_code: int) -> Response:
    """
    Utility function to handle error responses uniformly.
    Returns a Response object with the appropriate error details.

    Args:
        details (str): The error details.
        message (str): The error message.
        status_code (int): The HTTP status code.

    Returns:
        Response: A Response object containing the error details.
    """
    response_data = {
        'data': {
            'details': details,
            'status': 'error',
            'code': status_code
        },
        'message': message,
        'status': False
    }
    return Response(response_data, status=status_code)
# ***** =====  END  ===== ******
# ==========================================
# |                                        |
# |   >>>>>>>> NEXT SECTION >>>>>>>>       |
# |                                        |
# |   Moving to the next section!          |
# |                                        |
# |   >>>>>>>> NEXT SECTION >>>>>>>>       |
# |                                        |
# ==========================================
# ***** Utility functions for sending email and sms *****
# ! To send registration e-mail
def send_registration_email(name: str, email: str) -> None:
    """
    Send a registration email to the user.

    Args:
        name (str): The name of the recipient.
        email (str): The email address of the recipient.

    Returns:
        None
    """    
    subject = 'Welcome to MotoSpar!'
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [email]
    
    # Render the email content using the HTML template
    html_content = render_to_string('registration_email.html', {
        'name': name,
        'email': email,
        'current_year': datetime.now().year
    })
    text_content = strip_tags(html_content)

    try:
        msg = EmailMultiAlternatives(subject, text_content, from_email, recipient_list)
        msg.attach_alternative(html_content, HTML_FILE_TYPE)
        msg.send(fail_silently=True)
    except Exception:
        # Optionally log the exception or handle it as needed
        print(f"Failed to send email: {e}")


# ! To send Two factor otp via sms
def send_2fa_sms(number: str, verification_code: str) -> None:
    """
    Send a two-factor authentication (2FA) OTP via SMS.

    Args:
        number (str): The phone number to send the OTP to.
        verification_code (str): The OTP to be sent.

    Returns:
        None
    """
    # Implementation for sending SMS would go here
    pass


# ! To send OTP for password reset via email
def send_password_reset_otp(email: str, otp: str) -> None:
    """
    Send a password reset OTP to the user's email.

    Args:
        email (str): The email address of the recipient.
        otp (str): The OTP to be sent for password reset.

    Returns:
        None
    """

    subject = 'Password Reset OTP MotoSpar'
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [email]

    html_content = render_to_string('password_reset_otp_email.html', {
        'otp': otp,
        'current_year': datetime.now().year
    })
    text_content = strip_tags(html_content)

    try:
        msg = EmailMultiAlternatives(subject, text_content, from_email, recipient_list)
        msg.attach_alternative(html_content, HTML_FILE_TYPE)
        msg.send(fail_silently=False)
    except Exception as e:
        # Optionally log the exception or handle it as needed
        print(f"Failed to send email: {e}")


# ! To send Two factor otp via email
def send_2fa_otp(email, otp):
    subject = '2FA OTP MotoSpar'
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [email]

    # Render the email content using the HTML template
    html_content = render_to_string('otp_email.html', {
        'otp': otp,
        'current_year': datetime.now().year
    })
    text_content = strip_tags(html_content)

    try:
        msg = EmailMultiAlternatives(subject, text_content, from_email, recipient_list)
        msg.attach_alternative(html_content, HTML_FILE_TYPE)
        msg.send(fail_silently=False)
    except Exception:
        pass


# ! To send a confirmation email to the user who submitted the contact form
def send_confirmation_email(contact_us_instance: Any) -> None:
    """
    Send a confirmation email to the user who submitted the contact form.

    Args:
        contact_us_instance (Any): An instance containing the contact form data.

    Returns:
        None
    """    
    subject = "Thank You for Contacting Us"
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [contact_us_instance.email]

    # Render the email content using the HTML template
    html_content = render_to_string('contact_confirmation_email.html', {
        'name': contact_us_instance.name,
        'current_year': datetime.now().year,
    })
    text_content = strip_tags(html_content)

    # Create the email message
    msg = EmailMultiAlternatives(subject, text_content, from_email, recipient_list)
    msg.attach_alternative(html_content, "text/html")

    # Send the email
    try:
        msg.send(fail_silently=False)
    except Exception as e:
        print(f"Error sending confirmation email: {e}")


# ! To notify the admin or support team about the new contact request
def notify_admin_about_contact_request(contact_us_instance: Any) -> None:
    """
    Notify the admin or support team about a new contact request.

    Args:
        contact_us_instance (Any): An instance containing the contact form data.

    Returns:
        None
    """
    subject = "New Contact Us Request"
    from_email = settings.EMAIL_HOST_USER
    recipient_list = ["support@motospar.com"]  # Replace with your admin email or a list of emails

    # Render the email content using the HTML template
    html_content = render_to_string('admin_contact_notification_email.html', {
        'name': contact_us_instance.name,
        'email': contact_us_instance.email,
        'phone_number': contact_us_instance.phone_number,
        'message': contact_us_instance.message,
        'created_at': contact_us_instance.created_at.strftime('%Y-%m-%d %H:%M:%S'),
    })
    text_content = strip_tags(html_content)

    # Create the email message
    msg = EmailMultiAlternatives(subject, text_content, from_email, recipient_list)
    msg.attach_alternative(html_content, "text/html")

    # Send the email
    try:
        msg.send(fail_silently=False)
    except Exception as e:
        print(f"Error notifying admin about contact request: {e}")


# ! To send OTP email for admin login
def send_otp_email_login_admin(user: any) -> None:
    """
    Send an OTP email to the user.

    Args:
        user: User instance containing email and OTP.

    Returns:
        None
    """
    subject = "Your OTP for Admin Login"
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [user.email]

    # Render the email content using the HTML template
    html_content = render_to_string('otp_email.html', {
        'name': user.get_full_name() or user.email,
        'otp': user.verification_code,
        'current_year': datetime.now().year,
    })
    text_content = strip_tags(html_content)

    # Create the email message
    msg = EmailMultiAlternatives(subject, text_content, from_email, recipient_list)
    msg.attach_alternative(html_content, "text/html")

    # Send the email
    try:
        msg.send(fail_silently=False)
    except Exception as e:
        print(f"Error sending OTP email: {e}")
# ***** =====  END  ===== ******
# ==========================================
# |                                        |
# |   >>>>>>>> NEXT SECTION >>>>>>>>       |
# |                                        |
# |   Moving to the next section!          |
# |                                        |
# |   >>>>>>>> NEXT SECTION >>>>>>>>       |
# |                                        |
# ==========================================
# ***** Other Utility Functions *****
# ? To generate random 6 digit OTP
def generate_otp(length: int = 6) -> str:
    """
    Generate a random OTP of specified length.

    Args:
        length (int): The length of the OTP to generate. Default is 6.

    Returns:
        str: A string representing the generated OTP.
    """
    return ''.join(random.choice(string.digits) for _ in range(length))
# ***** =====  END  ===== ******