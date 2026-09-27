# Standard Library Imports
import base64
from io import BytesIO
import random
import string
from datetime import datetime

# Third-party Imports
from django.core.mail import send_mail
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone
from django.conf import settings

# local Imports
from app.messages import (
    HTML_FILE_TYPE
)



# ! To notify the vendor about the completion of their account verification
def notify_vendor_about_verification(vendor_instance):
    subject = "Your Account Verification is Complete"
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [vendor_instance.email]  # Send to the vendor's email

    # Render the email content using the HTML template
    html_content = render_to_string('vendor_verification_notification_email.html', {
        'full_name': f"{vendor_instance.first_name} {vendor_instance.last_name}",
        'email': vendor_instance.email,
        'account_type': vendor_instance.account_type,
        'current_year': datetime.now().year
        })
    text_content = strip_tags(html_content)

    # Create the email message
    msg = EmailMultiAlternatives(subject, text_content, from_email, recipient_list)
    msg.attach_alternative(html_content, "text/html")

    # Send the email
    try:
        msg.send(fail_silently=False)
    except Exception as e:
        print(f"Error notifying vendor about account verification: {e}")
