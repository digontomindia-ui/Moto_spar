import os
from PIL import Image as PILImage
from django.conf import settings
from django.core.exceptions import ValidationError

DEFAULT_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp', '.gif')
DEFAULT_MIME_TYPES = ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
ALLOWED_PIL_FORMATS = ('JPEG', 'PNG', 'WEBP', 'GIF')


def validate_uploaded_image_file(uploaded_file):
    """
    Validates:
    - File is provided and non-empty
    - File extension is allowed (rejects SVG, MP4, etc.)
    - Content-type is an allowed image MIME type
    - File size does not exceed MAX_PRODUCT_IMAGE_SIZE_MB
    - Content is a valid image verified by Pillow
    """
    if not uploaded_file:
        raise ValidationError("No file provided.")

    if uploaded_file.size == 0:
        raise ValidationError("Uploaded file is empty.")

    filename = getattr(uploaded_file, 'name', '') or ''
    ext = os.path.splitext(filename)[1].lower()

    allowed_exts = getattr(settings, 'ALLOWED_PRODUCT_IMAGE_EXTENSIONS', DEFAULT_EXTENSIONS)
    if not ext or ext not in allowed_exts:
        raise ValidationError(
            f"File '{filename}' has unsupported extension '{ext}'. Only {', '.join(allowed_exts)} are allowed. SVG and non-image files are rejected."
        )

    content_type = getattr(uploaded_file, 'content_type', '')
    allowed_mimes = getattr(settings, 'ALLOWED_PRODUCT_IMAGE_MIME_TYPES', DEFAULT_MIME_TYPES)
    if content_type:
        clean_mime = content_type.lower().split(';')[0].strip()
        if clean_mime not in allowed_mimes:
            raise ValidationError(
                f"File '{filename}' has invalid MIME type '{clean_mime}'. Only {', '.join(allowed_mimes)} are allowed."
            )

    max_mb = getattr(settings, 'MAX_PRODUCT_IMAGE_SIZE_MB', 10)
    max_bytes = max_mb * 1024 * 1024
    if uploaded_file.size > max_bytes:
        raise ValidationError(
            f"File '{filename}' exceeds maximum allowed size of {max_mb} MB."
        )

    try:
        current_pos = uploaded_file.tell() if hasattr(uploaded_file, 'tell') else 0
        img = PILImage.open(uploaded_file)
        fmt = (img.format or '').upper()
        if fmt not in ALLOWED_PIL_FORMATS:
            raise ValidationError(
                f"File '{filename}' contains unsupported image format '{fmt}'."
            )
        img.verify()
        if hasattr(uploaded_file, 'seek'):
            uploaded_file.seek(current_pos)
    except ValidationError:
        raise
    except Exception as e:
        raise ValidationError(
            f"File '{filename}' could not be decoded as a valid image: {str(e)}"
        )
