import os
import re
from urllib.parse import urlparse
from django.conf import settings
from django.core.files.storage import FileSystemStorage, Storage
from django.utils.deconstruct import deconstructible


@deconstructible
class ProductImageS3Storage(Storage):
    """
    S3 Storage for product images. If AWS_STORAGE_BUCKET_NAME is configured,
    delegates to storages.backends.s3boto3.S3Boto3Storage configured for private bucket access.
    Otherwise, gracefully falls back to local FileSystemStorage.
    """

    def __init__(self, **kwargs):
        self._underlying = None
        self._init_kwargs = kwargs

    def _get_underlying(self):
        if self._underlying is None:
            bucket_name = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', '')
            if bucket_name:
                from storages.backends.s3boto3 import S3Boto3Storage
                custom_domain = getattr(settings, 'AWS_S3_CUSTOM_DOMAIN', '') or None
                endpoint_url = getattr(settings, 'AWS_S3_ENDPOINT_URL', '') or None
                region_name = getattr(settings, 'AWS_S3_REGION_NAME', 'ap-south-1') or 'ap-south-1'
                querystring_auth = getattr(settings, 'AWS_QUERYSTRING_AUTH', True)
                querystring_expire = getattr(settings, 'AWS_QUERYSTRING_EXPIRE', 3600)
                access_key = getattr(settings, 'AWS_ACCESS_KEY_ID', '') or None
                secret_key = getattr(settings, 'AWS_SECRET_ACCESS_KEY', '') or None

                self._underlying = S3Boto3Storage(
                    bucket_name=bucket_name,
                    region_name=region_name,
                    access_key=access_key,
                    secret_key=secret_key,
                    custom_domain=custom_domain,
                    endpoint_url=endpoint_url,
                    querystring_auth=querystring_auth,
                    querystring_expire=querystring_expire,
                    default_acl=None,
                    file_overwrite=False,
                )
            else:
                location = os.path.join(settings.BASE_DIR, 'media')
                base_url = getattr(settings, 'MEDIA_URL', '/media/')
                self._underlying = FileSystemStorage(location=location, base_url=base_url)
        return self._underlying

    def _open(self, name, mode='rb'):
        return self._get_underlying()._open(name, mode=mode)

    def _save(self, name, content):
        return self._get_underlying()._save(name, content)

    def delete(self, name):
        return self._get_underlying().delete(name)

    def exists(self, name):
        return self._get_underlying().exists(name)

    def listdir(self, path):
        return self._get_underlying().listdir(path)

    def size(self, name):
        return self._get_underlying().size(name)

    def url(self, name):
        return self._get_underlying().url(name)

    def get_accessed_time(self, name):
        return self._get_underlying().get_accessed_time(name)

    def get_created_time(self, name):
        return self._get_underlying().get_created_time(name)

    def get_modified_time(self, name):
        return self._get_underlying().get_modified_time(name)


product_image_storage = ProductImageS3Storage()


def get_product_image_storage():
    return product_image_storage


def resolve_image_url(image_field, image_char, request=None):
    """
    Resolve product image to an absolute URL:
    1. If image_field is set, use its storage URL. If relative, resolve against API base/request once.
    2. If image_char is already an absolute HTTP/HTTPS URL, return it as-is (do NOT prepend base URL).
    3. If image_char is an s3:// URI, convert to HTTPS URL or presigned URL.
    4. If image_char is relative (e.g. /media/... or media/...), resolve against API base/request once.
    """
    # 1. Prefer image_field if present
    if image_field:
        try:
            url = image_field.url
            if url:
                if url.startswith('http://') or url.startswith('https://'):
                    return url
                if request:
                    return request.build_absolute_uri(url)
                base = getattr(settings, 'API_BASE_URL', '').rstrip('/')
                if base:
                    return f"{base}/{url.lstrip('/')}"
                return url
        except Exception:
            pass

    # 2. Check legacy char field
    if not image_char:
        return ""

    raw = str(image_char).strip()
    if not raw:
        return ""

    # Already absolute
    if raw.startswith('http://') or raw.startswith('https://'):
        return raw

    # S3 URI: s3://bucket/key
    if raw.startswith('s3://'):
        s3_path = raw[5:]  # remove s3://
        parts = s3_path.split('/', 1)
        if len(parts) == 2:
            bucket, key = parts
            region = getattr(settings, 'AWS_S3_REGION_NAME', 'ap-south-1') or 'ap-south-1'
            custom_domain = getattr(settings, 'AWS_S3_CUSTOM_DOMAIN', '')
            if custom_domain:
                return f"https://{custom_domain.rstrip('/')}/{key.lstrip('/')}"
            return f"https://{bucket}.s3.{region}.amazonaws.com/{key.lstrip('/')}"
        return raw

    # Relative path
    rel_path = '/' + raw.lstrip('/')
    if request:
        return request.build_absolute_uri(rel_path)

    base = getattr(settings, 'API_BASE_URL', '').rstrip('/')
    if base:
        return f"{base}{rel_path}"

    return rel_path
