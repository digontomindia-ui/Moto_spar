from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction

from .validators import validate_uploaded_image_file


def collect_uploaded_image_files(request):
    files = request.FILES.getlist('images')
    if not files:
        files = request.FILES.getlist('files')
    if not files:
        files = request.FILES.getlist('image')
    if not files and 'image' in request.FILES:
        files = [request.FILES['image']]
    return files


def validate_image_files(files):
    validation_errors = []
    for uploaded_file in files:
        try:
            validate_uploaded_image_file(uploaded_file)
        except DjangoValidationError as ve:
            validation_errors.append(str(ve.message if hasattr(ve, 'message') else ve))
        except Exception:
            filename = getattr(uploaded_file, 'name', 'uploaded file')
            validation_errors.append(f"File '{filename}' could not be validated.")
    return validation_errors


def _storage_field(img_obj):
    for field_name in ('image_file', 'image'):
        field = getattr(img_obj, field_name, None)
        if field is not None and getattr(field, 'name', None) and hasattr(field, 'storage'):
            return field
    return None


def delete_stored_file(img_obj):
    field = _storage_field(img_obj)
    if not field:
        return
    try:
        field.storage.delete(field.name)
    except Exception:
        pass


def save_image_records(files, build_instance):
    created_images = []
    try:
        with transaction.atomic():
            for uploaded_file in files:
                img_obj = build_instance(uploaded_file)
                try:
                    img_obj.save()
                except Exception:
                    delete_stored_file(img_obj)
                    raise
                created_images.append(img_obj)
    except Exception:
        for img_obj in created_images:
            delete_stored_file(img_obj)
        raise
    return created_images


def max_images_per_item():
    return getattr(settings, 'MAX_PRODUCT_IMAGES_PER_VARIANT', 10)
