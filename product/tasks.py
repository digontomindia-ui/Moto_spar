# product/tasks.py

# Standard library imports
from datetime import timedelta
from io import BytesIO

# Third-party imports
from celery import shared_task
from celery.exceptions import MaxRetriesExceededError
import pandas as pd
import requests

# Django imports
from django.conf import settings  # Import settings to access DEFAULT_FROM_EMAIL
from django.core.files.storage import default_storage
from django.core.mail import send_mail
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.core.files.base import ContentFile
from django.db import DatabaseError, transaction
from django.db.models import Q
from django.utils import timezone
from django.utils.timezone import now
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.http import HttpResponse, JsonResponse

# Local application imports
from .models import Category, SubCategory, Product, ProductVariant, ProductImage
from .logger import log_info, log_error, log_warning
from app.permissions import (
    IsCustomer, IsVendor, IsAdminUser
    )
from app.models import User

# Task functions go here =>


# ! To Check if Celery is working
# celery -A focuswave worker -l info
@shared_task
def test_task():
    print("Celery is working!")
    return "Celery test successful!"
# ! CELERY IS WORKING, THIS FUNCTION WILL PRINT "Celery is working!"




# ***** Utility Function required for bulk upload *****
# ? This will process the whole CSV file and create Product and ProductVariant objects
# ? It also call the download_and_save_image task to download and save images asynchronously
def process_csv_upload(file_path, user):
    """
    Processes a CSV file for bulk product upload.
    """
    try:
        # Read the file into a DataFrame
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file_path.endswith('.xlsx'):
            df = pd.read_excel(file_path)
        else:
            raise ValueError("Unsupported file format. Only CSV and Excel files are allowed.")

        df = df.where(pd.notnull(df), None)  # Replace NaN with None for easier handling

        # Prefetch existing categories and subcategories for optimization
        categories = {cat.name: cat for cat in Category.objects.all()}
        subcategories = {(subcat.category.name, subcat.name): subcat for subcat in SubCategory.objects.all()}

        success_count = 0
        error_count = 0
        error_messages = []  # List to collect error messages

        # Process each row
        for _, row in df.iterrows():
            try:
                # Skip completely empty rows
                if not any(row.values):
                    error_messages.append("Skipped empty row.")
                    error_count += 1
                    continue

                # Strip leading/trailing spaces from all string fields
                row = {k: v.strip() if isinstance(v, str) else v for k, v in row.items()}

                # Process the row
                _, variant = process_row(row, categories, subcategories, user)  # Pass user
                success_count += 1

            except Exception as e:
                error_messages.append(f"Error processing row {row}: {str(e)}")  # Collect error message
                error_count += 1

        # Log results
        log_info(f"Processed {success_count} rows successfully, {error_count} errors encountered.")
        return success_count, error_count, error_messages  # Return error messages

    except Exception as e:
        log_error(f"Error processing file: {e}")
        raise ValueError(f"Failed to process file: {e}")



# ? This function will process a single row of the CSV file and create Product and ProductVariant objects
# ? It will also check if the category and subcategory exists or not
def process_row(row, categories, subcategories, user):
    """
    Processes a single row of the file.
    """
    try:
        # Validate required fields
        # required_fields = ['category_name', 'sub_category_name', 'product_name',]
        # if not all(row.get(field) for field in required_fields):
        #     error_msg = "Missing required fields in row"
        #     log_error(error_msg)
        #     raise ValueError(error_msg)

        required_fields = ['category_name', 'sub_category_name', 'product_name']
        missing = [f for f in required_fields if not row.get(f) or not str(row.get(f)).strip()]
        if missing:
            error_msg = f"Missing required fields: {missing}"
            log_error(error_msg)
            raise ValueError(error_msg)

        # Normalize category/subcategory names
        category_name = row['category_name'].strip().lower()
        sub_category_name = row['sub_category_name'].strip().lower()

        row['product_name'] = row['product_name'].strip()
        
        # Validate category & subcategory existence
        category = categories.get(category_name)
        if not category:
            error_msg = f"Category '{row['category_name']}' not found"
            log_error(error_msg)
            raise ValueError(error_msg)

        subcategory = subcategories.get((category_name, sub_category_name))
        if not subcategory:
            error_msg = f"SubCategory '{row['sub_category_name']}' not found under Category '{row['category_name']}'"
            log_error(error_msg)
            raise ValueError(error_msg)

        # Check if SKU already exists (for consistency with single product addition)
        sku = row.get('sku', '').strip()
        if sku and ProductVariant.objects.filter(sku=sku).exists():
            error_msg = f"SKU '{sku}' already exists"
            log_error(error_msg)
            raise ValueError(error_msg)
        
        # # Check if product code already exists
        # if Product.objects.filter(code=row['product_code']).exists():
        #     error_msg = f"Product with code '{row['product_code']}' already exists"
        #     log_error(error_msg)
        #     raise ValueError(error_msg)

        # Fetch the User instance for created_by
        # created_by_username = row.get('created_by')
        # created_by_user = User.objects.filter(email=created_by_username).first()
        # if not created_by_user:
        #     error_msg = f"User  '{created_by_username}' not found"
        #     log_error(error_msg)
        #     raise ValueError(error_msg)

        # Utility: convert blank values for numeric fields → default 0
        def num_val(value, is_decimal=True):
            if value is None or str(value).strip() == "":
                return 0.0 if is_decimal else 0
            try:
                return float(value) if is_decimal else int(value)
            except Exception:
                return 0.0 if is_decimal else 0
            
        # Create Product
        with transaction.atomic():
            product = Product(
                category=category,
                sub_category=subcategory,
                name=row['product_name'].strip(),  # Ensure no leading/trailing spaces
                description=row.get('description', '').strip(),
                brand=row.get('brand', '').strip(),
                model=row.get('model', '').strip(),
                year=row.get('year', ''),
                delivery_charge=num_val(row.get('delivery_charge')),
                delivery_time=num_val(row.get('delivery_time'), is_decimal=False),
                driver_fees=num_val(row.get('driver_fees')),
                mechanic_fees=num_val(row.get('mechanic_fees')),
                is_gst_applicable=True if str(row.get('is_gst_applicable', '')).strip().lower() in ["yes", "true", "1"] else False,
                gst_rate=num_val(row.get('gst_rate'), is_decimal=False) if str(row.get('is_gst_applicable', '')).strip().lower() in ["yes", "true", "1"] else 0,
                # created_by=created_by_user  # Assign the User instance
                created_by=user  # Use the authenticated user from the request
            )
            product.save()
            log_info(f"Product created successfully: {product.name} (Code: {product.code})")

            # Create ProductVariant
            variant = ProductVariant(
                product=product,
                # price=row.get('price', 0.0),
                listing_price_for_vendor=num_val(row.get('listing_price_for_vendor')),
                cost_to_vendor=num_val(row.get('cost_to_vendor')),
                motospar_commission_from_vendor=num_val(row.get('motospar_commission_from_vendor')),
                markup_in_prices=num_val(row.get('markup_in_prices')),
                final_listing_price_on_motospar=num_val(row.get('final_listing_price_on_motospar')),
                final_profit_per_part=num_val(row.get('final_profit_per_part')),
                discount=num_val(row.get('discount')),  # will be 0 if blank
                in_stock=True if str(row.get('in_stock')).strip().lower() in ["yes", "true", "1"] else False,
                sold_quantity=num_val(row.get('sold_quantity'), is_decimal=False),
                sku=sku,
                color=(row.get('color') or "").strip(),
                size=(row.get('size') or "").strip(),
                weight=num_val(row.get('weight')),
                dimensions=(row.get('dimensions') or "").strip(),
                material=(row.get('material') or "").strip(),
                features=(row.get('features') or "").strip()
            )
            variant.save()
            log_info(f"ProductVariant created successfully for product: {product.name} (Variant ID: {variant.id})")
            
            # Process multiple image URLs (already handles comma-separated values)
            image_url_val = row.get('image_url')
            if image_url_val and isinstance(image_url_val, str):
                image_urls = [url.strip() for url in image_url_val.split(',') if url.strip()]
                for image_url in image_urls:
                    # Directly save the image URL to ProductImage
                    ProductImage.objects.create(
                        variant=variant,
                        image=image_url,
                        is_active=True
                    )
                    log_info(f"ProductImage created for variant: {variant.id} with URL: {image_url}")
                    
            return product, variant

    except Exception as e:
        log_error(f"Error processing row: {row}. Error: {e}")
        raise ValueError(f"Failed to process row: {row}. Error: {e}")


# ? This function sends an email notification to the recipient
# ? It uses the Django email backend to send the email
# ? It also uses the HTML template to render the email content
def send_email_notification(subject, message, recipient_list):
    """
    Sends an email notification with HTML content.
    """
    from_email = settings.EMAIL_HOST_USER  # Use the default email host user

    # Render the email content using an HTML template
    html_content = render_to_string('email_notification_template.html', {
        'subject': subject,
        'message': message,
    })
    text_content = strip_tags(html_content)  # Fallback plain text content

    # Create the email message
    msg = EmailMultiAlternatives(subject, text_content, from_email, recipient_list)
    msg.attach_alternative(html_content, "text/html")

    # Send the email
    try:
        msg.send(fail_silently=False)
        log_info(f"Email sent successfully to {recipient_list}")
    except Exception as e:
        log_error(f"Failed to send email: {e}")
# ***** =====  END  ===== ******




# ***** Celery Task which will run in background while bulk upload *****
# ? Celery Task to download and save images asynchronously
@shared_task(autoretry_for=(Exception,), retry_kwargs={'max_retries': 3})
def download_and_save_image(image_url, variant_id):
    """
    Downloads an image from a URL and saves it to the ProductImage model.
    """
    try:
        # Download the image
        response = requests.get(image_url, stream=True)
        response.raise_for_status()
                
        # Save the image to the ProductImage model
        with ContentFile(response.content) as file_content:
            product_image = ProductImage(variant_id=variant_id)
            product_image.image.save(
                image_url.split('/')[-1],  # Use the filename from the URL
                file_content,
                save=True
            )
            log_info(f"Image saved successfully for variant {variant_id} (URL: {image_url})")

        # Clear the image from memory
        del response
        del file_content

    except Exception as e:
        log_error(f"Failed to download or save image: {e}")
        raise


# ? Celery Task to process CSV file and upload products
@shared_task(autoretry_for=(Exception,), retry_kwargs={'max_retries': 3})
def bulk_upload_task(file_path, recipient_emails):
    """
    Celery task for bulk product upload and image processing.
    """
    try:
        success_count, error_count = process_csv_upload(file_path)
        log_info(f"Bulk upload completed: {success_count} products added, {error_count} errors encountered.")

        # Send email notification
        subject = "Bulk Upload Completed"
        message = f"Bulk upload completed successfully.\n\nSuccess: {success_count}\nErrors: {error_count}"
        send_email_notification(subject, message, recipient_emails)

    except Exception as e:
        log_error(f"Error in bulk_upload_task: {e}")
        raise
# ***** =====  END  ===== ******



# ! API Views for bulk upload
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_product_upload_sync(request):
    """
    Synchronous bulk upload endpoint to process CSV/Excel file immediately without Celery.
    """
    if 'file' not in request.FILES:
        response_data = {
            'data': {
                "status": "error",
                'code': status.HTTP_400_BAD_REQUEST,
            },
            'message': "No file provided.",
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)
    
    file = request.FILES['file']
    file_path = default_storage.save(file.name, file)  # Save temporarily
    # Get the full path to the uploaded file
    full_file_path = default_storage.path(file_path)
    
    try:
        success_count, error_count, error_messages = process_csv_upload(full_file_path, request.user)  # Pass the full path
        message = f"Bulk upload completed. Success: {success_count}, Errors: {error_count}"
        
        response_data = {
            'data': {
                'success_count': success_count,
                'error_count': error_count,
                'error_messages': error_messages,  # Include error messages in the response
                'status': 'success' if error_count == 0 else 'error',
                'code': status.HTTP_200_OK if error_count == 0 else status.HTTP_400_BAD_REQUEST
            },
            'message': message,
            'status': True
        }
        
        return JsonResponse(response_data, status=status.HTTP_200_OK if error_count == 0 else status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        response_data = {
            'data': {
                'details': str(e),
                "status": "error",
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR
            },
            'message': "An internal server error occurred.",
            'status': False
        }
        return JsonResponse(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ! ***** =====  END  ===== ******





# ***** API View for bulk upload *****
# ? This view will handle the bulk upload request and call the bulk_upload_task
# ? It will also return a response to the client    
# ? It will also check if the user is authenticated and is an admin user
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def bulk_product_upload(request):
    """
    Handle POST request to upload CSV or Excel file for bulk product upload.
    """
    if 'file' not in request.FILES:
        return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

    file = request.FILES['file']
    file_path = default_storage.save(file.name, file)  # Save the file temporarily

    # Define recipient emails
    default_admin_email = 'support@motospar.com'  # Replace with the default admin email
    test_email = 'shiladitya.testmail@gmail.com'  # Replace with the test email
    user_email = request.user.email  # Email of the authenticated user
    recipient_emails = [default_admin_email, user_email, test_email]  # List of recipient emails
    recipient_email = 'shiladitya.testmail@gmail.com'

    # Start the Celery task
    bulk_upload_task.delay(file_path, [recipient_email])
    response_data = {
        'data': {
            'details': 'Bulk upload process started. You will receive an email upon completion.',
            'status': 'success',
            'code': status.HTTP_202_ACCEPTED
        },
        'message': 'Bulk upload process started. You will receive an email upon completion.',
        'status': True,
    }
    return JsonResponse(response_data, status=status.HTTP_202_ACCEPTED)


# ? This view will handle the download request for the bulk upload template
# ? It will return a CSV or Excel file with the required fields for bulk upload
@api_view(['GET'])
# @permission_classes([IsAuthenticated, IsAdminUser])
@permission_classes([AllowAny])
def download_bulk_upload_template(request):
    """
    API to download a CSV or Excel template for bulk product upload.
    """
    # Define the template structure
    template_data = {
        "category_name": [],  # Required
        "sub_category_name": [],  # Required
        "product_name": [],  # Required
        "description": [],
        "brand": [],
        "model": [],
        "year": [],
        "delivery_charge": [],
        "delivery_time": [],
        "driver_fees": [],
        "mechanic_fees": [],

        "is_gst_applicable": [],
        "gst_rate": [],

        "listing_price_for_vendor": [],  # Required for ProductVariant
        "cost_to_vendor": [],
        "motospar_commission_from_vendor": [],
        "markup_in_prices": [],
        "final_listing_price_on_motospar": [],
        "final_profit_per_part": [],


        "discount": [],
        "in_stock": [],
        "sold_quantity": [],
        "sku": [],
        "color": [],
        "size": [],
        "weight": [],
        "dimensions": [],
        "material": [],
        "features": [],
        "image_url": [],  # Optional for ProductImage
    }

    # Create a DataFrame with the template structure
    df = pd.DataFrame(template_data)

    # Determine the file format (CSV or Excel)
    file_format = request.query_params.get('format', 'csv').lower()
    if file_format not in ['csv', 'excel']:
        return Response({"error": "Invalid format. Supported formats: csv, excel."}, status=status.HTTP_400_BAD_REQUEST)

    # Generate the file
    if file_format == 'csv':
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="bulk_upload_template.csv"'
        df.to_csv(response, index=False)
    else:
        output = BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=False, sheet_name='Bulk Upload Template')
        response = HttpResponse(output.getvalue(), content_type='application/vnd.ms-excel')
        response['Content-Disposition'] = 'attachment; filename="bulk_upload_template.xlsx"'

    return response


# ? This view will handle the download request for the category and subcategory mapping
# ? It will return a CSV file with the mapped data
@api_view(['GET'])
# @permission_classes([IsAuthenticated, IsAdminUser])
@permission_classes([AllowAny])
def download_category_subcategory_mapping(request):
    """
    API to download a CSV file containing mapped Category and SubCategory data.
    """
    # Fetch all categories and subcategories
    categories = Category.objects.filter(is_active=True)
    subcategories = SubCategory.objects.filter(is_active=True)

    # Prepare the data
    data = []
    for category in categories:
        for subcategory in subcategories.filter(category=category):
            data.append({
                "category_id": category.id,
                "category_name": category.name,
                "sub_category_id": subcategory.id,
                "sub_category_name": subcategory.name,
            })

    # Create a DataFrame
    df = pd.DataFrame(data)

    # Generate the CSV file
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="category_subcategory_mapping.csv"'
    df.to_csv(response, index=False)

    return response


# ? This view will handle the download request for a dummy CSV file
# ? It will return a CSV file with 10 rows of example data
@api_view(['GET'])
# @permission_classes([IsAuthenticated, IsAdminUser])
@permission_classes([AllowAny])
def download_dummy_csv(request):
    """
    API to download a dummy CSV file with 10 rows of example data.
    """
    # Define example data
    dummy_data = [
        {
            "category_name": "Electronics",
            "sub_category_name": "Smartphones",
            "product_name": "Smartphone X",
            "description": "Latest smartphone with advanced features.",
            "brand": "TechBrand",
            "model": "X2023",
            "year": "2023",
            "delivery_charge": "10.00",
            "delivery_time": "7",
            "driver_fees": "5.00",
            "mechanic_fees": "0.00",
            
            "is_gst_applicable": "True",
            "gst_rate": "18",
            
            "listing_price_for_vendor": "999.99",  # Required for ProductVariant
            "cost_to_vendor": "800.00",
            "motospar_commission_from_vendor": "100.00",
            "markup_in_prices": "50.00",
            "final_listing_price_on_motospar": "1049.99",
            "final_profit_per_part": "50.00",

            "discount": "10",
            "in_stock": "True",
            "sold_quantity": "100",
            "sku": "SPX001-BLACK",
            "color": "Black",
            "size": "6.7 inches",
            "weight": "200",
            "dimensions": "160 x 75 x 8 mm",
            "material": "Glass, Aluminum",
            "features": "5G, 128GB Storage, 12MP Camera",
            "image_url": "https://example.com/images/smartphone_x.jpg",
        },
        {
            "category_name": "Fashion",
            "sub_category_name": "Men's Shoes",
            "product_name": "Running Shoes",
            "description": "Comfortable running shoes for men.",
            "brand": "ShoeBrand",
            "model": "RunnerPro",
            "year": "2023",
            "delivery_charge": "5.00",
            "delivery_time": "5",
            "driver_fees": "0.00",
            "mechanic_fees": "0.00",

            "is_gst_applicable": "False",
            "gst_rate": "0",

            "listing_price_for_vendor": "79.99",  # Required for ProductVariant
            "cost_to_vendor": "60.00",
            "motospar_commission_from_vendor": "10.00",
            "markup_in_prices": "5.00",
            "final_listing_price_on_motospar": "84.99",
            "final_profit_per_part": "5.00",

            "discount": "15",
            "in_stock": "True",
            "sold_quantity": "50",
            "sku": "RS001-BLUE",
            "color": "Blue",
            "size": "10",
            "weight": "300",
            "dimensions": "30 x 20 x 10 cm",
            "material": "Mesh, Rubber",
            "features": "Breathable, Lightweight, Durable",
            "image_url": "https://example.com/images/running_shoes.jpg",
        },
        # Add 8 more rows of dummy data here...
    ]

    # Create a DataFrame with the dummy data
    df = pd.DataFrame(dummy_data)

    # Generate the CSV file
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="dummy_bulk_upload_example.csv"'
    df.to_csv(response, index=False)

    return response
# ***** =====  END  ===== ******