# utils.py

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from datetime import datetime


# ! Notify admin about product request
def notify_admin_about_product_request(vendor, product_request_instance):
    subject = "New Product Request from Vendor"
    from_email = settings.EMAIL_HOST_USER
    recipient_list = ["support@motospar.com"]  # Replace with your admin email or a list of emails

    # Render the email content using the HTML template
    html_content = render_to_string('admin_product_request_notification_email.html', {
        'vendor_name': vendor.get_full_name(),  # Assuming the vendor has a method to get full name
        'vendor_email': vendor.email,
        'product_request_details': product_request_instance,
        'created_at': product_request_instance.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        'current_year': datetime.now().year,  # Add current year
    })
    text_content = strip_tags(html_content)

    # Create the email message
    msg = EmailMultiAlternatives(subject, text_content, from_email, recipient_list)
    msg.attach_alternative(html_content, "text/html")

    # Send the email
    try:
        msg.send(fail_silently=False)
    except Exception as e:
        print(f"Error notifying admin about product request: {e}")