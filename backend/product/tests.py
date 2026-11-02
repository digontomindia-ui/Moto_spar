import io
import os
import tempfile
import uuid
from unittest.mock import patch
from PIL import Image as PILImage
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files.storage import FileSystemStorage
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from product.models import (
    Category, SubCategory, Product, ProductVariant, ProductImage,
    ProductRequest, ProductRequestImage,
)
from product.serializers import ProductImageSerializer, ProductVariantSerializer
from product.storage import product_image_storage, resolve_image_url
from product import views as product_views

User = get_user_model()


def create_test_image(filename="test.jpg", fmt="JPEG", size=(100, 100), color=(255, 0, 0)):
    buf = io.BytesIO()
    img = PILImage.new("RGB", size, color=color)
    img.save(buf, format=fmt)
    buf.seek(0)
    mime = f"image/{fmt.lower()}"
    if fmt.upper() == "JPEG":
        mime = "image/jpeg"
    return SimpleUploadedFile(name=filename, content=buf.read(), content_type=mime)


SAFE_LOCAL_STORAGE_SETTINGS = dict(
    AWS_STORAGE_BUCKET_NAME='',
    AWS_ACCESS_KEY_ID='',
    AWS_SECRET_ACCESS_KEY='',
    AWS_S3_ENDPOINT_URL='',
    AWS_S3_CUSTOM_DOMAIN='',
)


@override_settings(**SAFE_LOCAL_STORAGE_SETTINGS)
class ProductImageUploadAndLegacyTests(TestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            username="admin_user",
            email="admin@motospar.com",
            phone_number="9876543210",
            first_name="Admin",
            last_name="User",
            account_type="admin",
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )
        self.regular_user = User.objects.create_user(
            username="vendor_user",
            email="vendor@motospar.com",
            phone_number="9876543211",
            first_name="Vendor",
            last_name="User",
            account_type="vendor",
            is_staff=False,
            is_active=True,
        )
        self.category = Category.objects.create(name="brakes", description="Braking systems")
        self.subcategory = SubCategory.objects.create(name="pads", category=self.category)
        self.product = Product.objects.create(
            name="ceramic brake pad",
            description="High performance brake pads",
            created_by=self.admin_user,
            category=self.category,
            sub_category=self.subcategory,
            delivery_charge=50,
            delivery_time=3,
        )
        self.variant = ProductVariant.objects.create(
            product=self.product,
            sku="SKU-BRK-001",
            color="Red",
            size="Standard",
            final_listing_price_on_motospar=1500,
        )
        self.variant_2 = ProductVariant.objects.create(
            product=self.product,
            sku="SKU-BRK-002",
            color="Black",
            size="Standard",
            final_listing_price_on_motospar=1600,
        )

        self.client = APIClient()
        product_image_storage._underlying = None

    # 1. Legacy URL Resolution and Backward Compatibility Tests
    def test_legacy_absolute_https_url_is_preserved_without_double_prefix(self):
        legacy_url = "https://example.com/images/pad.jpg"
        img = ProductImage.objects.create(
            variant=self.variant,
            image=legacy_url,
            is_active=True
        )
        serializer = ProductImageSerializer(img)
        self.assertEqual(serializer.data["image"], legacy_url)
        self.assertEqual(serializer.data["image_url"], legacy_url)
        self.assertFalse(serializer.data["image"].startswith("https://api.motospar.com/https://"))

    def test_legacy_relative_media_url_resolves_against_base_once(self):
        relative_path = "/media/product_images/old_pad.jpg"
        img = ProductImage.objects.create(
            variant=self.variant,
            image=relative_path,
            is_active=True
        )
        resolved = resolve_image_url(None, relative_path)
        self.assertTrue(resolved.startswith("http"))
        self.assertTrue(resolved.endswith("/media/product_images/old_pad.jpg"))
        # Verify no double scheme or double base
        self.assertNotIn("motospar.com/https:", resolved)
        self.assertNotIn("motospar.com/http:", resolved)

    def test_s3_uri_resolves_to_https_url(self):
        s3_uri = "s3://motospar-media/products/part.png"
        resolved = resolve_image_url(None, s3_uri)
        self.assertTrue(resolved.startswith("https://motospar-media.s3."))
        self.assertTrue(resolved.endswith("/products/part.png"))

    # 2. Upload Endpoint: Authentication & Authorization Tests
    def test_upload_requires_authentication(self):
        url = reverse("product:upload_variant_images", kwargs={"variant_id": self.variant.id})
        test_file = create_test_image()
        response = self.client.post(url, {"images": [test_file]}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_upload_rejects_non_admin_user(self):
        self.client.force_authenticate(user=self.regular_user)
        url = reverse("product:upload_variant_images", kwargs={"variant_id": self.variant.id})
        test_file = create_test_image()
        response = self.client.post(url, {"images": [test_file]}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # 3. Successful Upload & Correct Variant Association
    def test_successful_image_upload_to_variant(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse("product:upload_variant_images", kwargs={"variant_id": self.variant.id})
        file1 = create_test_image("pad1.jpg", "JPEG", color=(255, 0, 0))
        file2 = create_test_image("pad2.png", "PNG", color=(0, 255, 0))

        response = self.client.post(url, {"images": [file1, file2]}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        res_data = response.json()
        self.assertTrue(res_data["status"])
        self.assertEqual(res_data["data"]["count"], 2)

        # Check variant association
        variant_images = self.variant.images.filter(is_active=True)
        self.assertEqual(variant_images.count(), 2)
        # Ensure variant_2 was unaffected
        self.assertEqual(self.variant_2.images.filter(is_active=True).count(), 0)

        # Check resolved URLs in response
        uploaded_first = res_data["data"]["images"][0]
        self.assertTrue(bool(uploaded_first["image"]))
        self.assertTrue(uploaded_first["image"].startswith("http") or "/media/" in uploaded_first["image"])

    # 4. Validation: File Type, SVG Rejection, and Size Limits
    def test_upload_rejects_svg_file(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse("product:upload_variant_images", kwargs={"variant_id": self.variant.id})
        svg_content = b"<svg xmlns='http://www.w3.org/2000/svg'><circle r='10'/></svg>"
        svg_file = SimpleUploadedFile("danger.svg", svg_content, content_type="image/svg+xml")

        response = self.client.post(url, {"images": [svg_file]}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        res_data = response.json()
        self.assertFalse(res_data["status"])
        self.assertIn("unsupported extension", str(res_data["data"]["details"]).lower())

    def test_upload_rejects_non_image_or_corrupted_file(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse("product:upload_variant_images", kwargs={"variant_id": self.variant.id})
        fake_file = SimpleUploadedFile("fake.jpg", b"this is not an image content", content_type="image/jpeg")

        response = self.client.post(url, {"images": [fake_file]}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        res_data = response.json()
        self.assertIn("could not be decoded", str(res_data["data"]["details"]).lower())

    @override_settings(MAX_PRODUCT_IMAGE_SIZE_MB=1)
    def test_upload_rejects_oversized_file(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse("product:upload_variant_images", kwargs={"variant_id": self.variant.id})
        large_content = b"0" * (2 * 1024 * 1024)  # 2MB > 1MB limit
        large_file = SimpleUploadedFile("big.jpg", large_content, content_type="image/jpeg")

        response = self.client.post(url, {"images": [large_file]}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        res_data = response.json()
        self.assertIn("exceeds maximum allowed size", str(res_data["data"]["details"]).lower())

    @override_settings(MAX_PRODUCT_IMAGES_PER_VARIANT=2)
    def test_upload_rejects_exceeding_max_images_per_variant(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse("product:upload_variant_images", kwargs={"variant_id": self.variant.id})
        f1 = create_test_image("img1.jpg")
        f2 = create_test_image("img2.jpg")
        f3 = create_test_image("img3.jpg")

        response = self.client.post(url, {"images": [f1, f2, f3]}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        res_data = response.json()
        self.assertIn("maximum 2 images allowed", res_data["message"].lower())

    # 5. Image Deletion & S3/Storage Safe Cleanup
    def test_image_deletion_endpoint_removes_record(self):
        self.client.force_authenticate(user=self.admin_user)
        test_file = create_test_image("delete_me.jpg")
        img = ProductImage.objects.create(
            variant=self.variant,
            image_file=test_file,
            is_active=True
        )
        storage = img.image_file.storage
        file_name = img.image_file.name
        self.assertTrue(storage.exists(file_name))

        delete_url = reverse("product:delete_product_image", kwargs={"product_image_id": img.id})
        response = self.client.delete(delete_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(ProductImage.objects.filter(id=img.id).exists())
        # Storage file safely cleaned up
        self.assertFalse(storage.exists(file_name))

    def test_safe_delete_does_not_delete_shared_storage_file(self):
        test_file = create_test_image("shared.jpg")
        img1 = ProductImage.objects.create(variant=self.variant, image_file=test_file, is_active=True)
        # Shared image pointing to exact same storage file
        img2 = ProductImage.objects.create(variant=self.variant_2, image_file=img1.image_file.name, is_active=True)

        storage = img1.image_file.storage
        self.assertTrue(storage.exists(img1.image_file.name))

        # Delete img1; img2 still references it
        img1.delete()
        # Storage file must NOT be deleted because img2 still points to it
        self.assertTrue(storage.exists(img1.image_file.name))

        # Delete img2; now no other record references it, so file is deleted
        img2.delete()
        self.assertFalse(storage.exists(img1.image_file.name))

    # 6. Two-stage / Product Creation & Partial Failure Handling
    def test_add_product_two_stage_endpoint_flow(self):
        self.client.force_authenticate(user=self.admin_user)
        payload = {
            "name": "New Clutch Kit",
            "category_id": str(self.category.id),
            "sub_category_id": str(self.subcategory.id),
            "description": "Clutch kit for cars",
            "brand": "Motospar",
            "model": "Generic",
            "year": "2024",
            "variant": {
                "sku": "SKU-CLT-001",
                "color": "Silver",
                "size": "Medium",
                "final_listing_price_on_motospar": 2500,
            },
            "images": []
        }
        create_res = self.client.post(reverse("product:add_product"), payload, format="json")
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        res_json = create_res.json()
        variant_id = res_json["data"].get("variant_id")
        self.assertTrue(bool(variant_id))

        # Stage 2: upload files to created variant
        upload_url = reverse("product:upload_variant_images", kwargs={"variant_id": variant_id})
        file = create_test_image("clutch.jpg")
        upload_res = self.client.post(upload_url, {"images": [file]}, format="multipart")
        self.assertEqual(upload_res.status_code, status.HTTP_201_CREATED)

        created_variant = ProductVariant.objects.get(id=variant_id)
        self.assertEqual(created_variant.images.count(), 1)

    def test_variant_details_edit_preserves_existing_uploaded_image(self):
        self.client.force_authenticate(user=self.admin_user)
        uploaded_image = ProductImage.objects.create(
            variant=self.variant,
            image_file=create_test_image("preserve-me.jpg"),
            image="preserve-me.jpg",
            is_active=True,
        )
        original_storage_key = uploaded_image.image_file.name
        edit_url = reverse(
            "product:edit_variant_and_images",
            kwargs={"variant_id": self.variant.id},
        )

        # A legacy client may send a resolved display URL. It must not replace
        # the storage key or implicitly delete an image omitted from this edit.
        response = self.client.patch(
            edit_url,
            {
                "sku": self.variant.sku,
                "images": ["https://cdn.example.com/preserve-me.jpg"],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json()["status"])
        uploaded_image.refresh_from_db()
        self.assertEqual(uploaded_image.image_file.name, original_storage_key)
        self.assertTrue(uploaded_image.is_active)


class MockedUrlStorage(FileSystemStorage):
    """
    Mocked storage stand-in for testing URL formatting only.
    NOTE: This uses the local filesystem and generates an S3-format URL for testing
    downstream serializer and frontend formatting; it DOES NOT perform or prove
    a live S3 upload.
    """

    def url(self, name):
        return f"https://motospar-test-local.s3.amazonaws.com/{name.lstrip('/')}"


@override_settings(**SAFE_LOCAL_STORAGE_SETTINGS)
class VendorProductRequestImageTests(TestCase):
    def setUp(self):
        product_image_storage._underlying = None
        self.vendor = User.objects.create_user(
            username="vendor_owner",
            email="vendor-owner@motospar.com",
            phone_number="9876543220",
            first_name="Vendor",
            last_name="Owner",
            account_type="vendor",
            is_active=True,
        )
        self.other_vendor = User.objects.create_user(
            username="vendor_other",
            email="vendor-other@motospar.com",
            phone_number="9876543221",
            first_name="Other",
            last_name="Vendor",
            account_type="vendor",
            is_active=True,
        )
        self.admin_user = User.objects.create_user(
            username="admin_catalog",
            email="admin-catalog@motospar.com",
            phone_number="9876543222",
            first_name="Admin",
            last_name="Catalog",
            account_type="admin",
            is_staff=True,
            is_active=True,
        )
        self.category = Category.objects.create(name="filters", description="Filters")
        self.subcategory = SubCategory.objects.create(name="oil", category=self.category)
        self.product_request = ProductRequest.objects.create(
            vendor=self.vendor,
            category=self.category,
            sub_category=self.subcategory,
            name="oil filter",
            description="Vendor requested oil filter",
            price=499,
        )
        self.other_request = ProductRequest.objects.create(
            vendor=self.other_vendor,
            category=self.category,
            sub_category=self.subcategory,
            name="air filter",
            description="Other vendor request",
            price=299,
        )
        self.client = APIClient()

    def tearDown(self):
        product_image_storage._underlying = None

    def _upload_url(self, request_id=None):
        return reverse(
            "product:upload_product_request_images",
            kwargs={"product_request_id": request_id or self.product_request.id},
        )

    def _list_url(self, request_id=None):
        return reverse(
            "product:list_product_request_images",
            kwargs={"product_request_id": request_id or self.product_request.id},
        )

    def _assert_no_secrets(self, payload):
        blob = str(payload).lower()
        self.assertNotIn("aws_access_key", blob)
        self.assertNotIn("aws_secret", blob)
        self.assertNotIn("x-amz-signature", blob)
        self.assertNotIn("akia", blob)

    def test_upload_requires_authentication(self):
        response = self.client.post(
            self._upload_url(),
            {"images": [create_test_image()]},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_and_delete_require_authentication(self):
        list_res = self.client.get(self._list_url())
        self.assertEqual(list_res.status_code, status.HTTP_401_UNAUTHORIZED)

        fake_id = uuid.uuid4()
        delete_url = reverse(
            "product:delete_product_request_image",
            kwargs={"product_request_image_id": fake_id},
        )
        del_res = self.client.delete(delete_url)
        self.assertEqual(del_res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_upload_rejects_admin_user(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(
            self._upload_url(),
            {"images": [create_test_image()]},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(ProductRequestImage.objects.count(), 0)

    def test_admin_variant_upload_still_rejects_vendor(self):
        product = Product.objects.create(
            name="catalog pad",
            description="Admin catalog",
            created_by=self.admin_user,
            category=self.category,
            sub_category=self.subcategory,
            delivery_charge=10,
            delivery_time=2,
        )
        variant = ProductVariant.objects.create(
            product=product,
            sku="SKU-VND-001",
            color="Red",
            size="Standard",
            final_listing_price_on_motospar=1000,
        )
        self.client.force_authenticate(user=self.vendor)
        url = reverse("product:upload_variant_images", kwargs={"variant_id": variant.id})
        response = self.client.post(url, {"images": [create_test_image()]}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(variant.images.count(), 0)

    def test_vendor_cannot_upload_to_another_vendors_request(self):
        self.client.force_authenticate(user=self.vendor)
        response = self.client.post(
            self._upload_url(self.other_request.id),
            {"images": [create_test_image()]},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.other_request.images.count(), 0)

    def test_vendor_cannot_list_or_delete_another_vendors_images(self):
        img = ProductRequestImage.objects.create(
            productrequest=self.other_request,
            image=create_test_image("other.jpg"),
            is_active=True,
        )
        self.client.force_authenticate(user=self.vendor)
        list_res = self.client.get(self._list_url(self.other_request.id))
        self.assertEqual(list_res.status_code, status.HTTP_403_FORBIDDEN)

        delete_url = reverse(
            "product:delete_product_request_image",
            kwargs={"product_request_image_id": img.id},
        )
        delete_res = self.client.delete(delete_url)
        self.assertEqual(delete_res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(ProductRequestImage.objects.filter(id=img.id).exists())

    def test_owner_can_upload_list_and_receive_frontend_urls(self):
        self.client.force_authenticate(user=self.vendor)
        file1 = create_test_image("req1.jpg", "JPEG")
        file2 = create_test_image("req2.png", "PNG")
        response = self.client.post(
            self._upload_url(),
            {"images": [file1, file2]},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        res_data = response.json()
        self.assertTrue(res_data["status"])
        self.assertEqual(res_data["data"]["count"], 2)
        self._assert_no_secrets(res_data)

        uploaded = res_data["data"]["images"][0]
        self.assertTrue(uploaded["image"])
        self.assertEqual(uploaded["image"], uploaded["image_url"])
        self.assertTrue(uploaded["image"].startswith("http") or "/media/" in uploaded["image"])
        self.assertEqual(self.product_request.images.filter(is_active=True).count(), 2)
        self.assertEqual(self.other_request.images.count(), 0)

        list_res = self.client.get(self._list_url())
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertEqual(list_res.json()["data"]["count"], 2)

    def test_upload_rejects_svg_and_invalid_files(self):
        self.client.force_authenticate(user=self.vendor)
        svg_file = SimpleUploadedFile(
            "danger.svg",
            b"<svg xmlns='http://www.w3.org/2000/svg'><circle r='10'/></svg>",
            content_type="image/svg+xml",
        )
        svg_res = self.client.post(self._upload_url(), {"images": [svg_file]}, format="multipart")
        self.assertEqual(svg_res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(svg_res.json()["status"])
        self.assertIn("unsupported extension", str(svg_res.json()["data"]["details"]).lower())

        fake_file = SimpleUploadedFile("fake.jpg", b"not an image", content_type="image/jpeg")
        fake_res = self.client.post(self._upload_url(), {"images": [fake_file]}, format="multipart")
        self.assertEqual(fake_res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("could not be decoded", str(fake_res.json()["data"]["details"]).lower())

    @override_settings(MAX_PRODUCT_IMAGE_SIZE_MB=1)
    def test_upload_rejects_oversized_file(self):
        self.client.force_authenticate(user=self.vendor)
        large_file = SimpleUploadedFile(
            "big.jpg",
            b"0" * (2 * 1024 * 1024),
            content_type="image/jpeg",
        )
        response = self.client.post(self._upload_url(), {"images": [large_file]}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("exceeds maximum allowed size", str(response.json()["data"]["details"]).lower())

    @override_settings(MAX_PRODUCT_IMAGES_PER_VARIANT=2)
    def test_upload_rejects_exceeding_count_limit(self):
        self.client.force_authenticate(user=self.vendor)
        response = self.client.post(
            self._upload_url(),
            {"images": [create_test_image("a.jpg"), create_test_image("b.jpg"), create_test_image("c.jpg")]},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("maximum 2 images allowed", response.json()["message"].lower())

    @override_settings(MAX_PRODUCT_IMAGES_PER_VARIANT=2)
    def test_upload_locks_request_row_before_count_limit_check(self):
        self.client.force_authenticate(user=self.vendor)
        ProductRequestImage.objects.create(
            productrequest=self.product_request,
            image=create_test_image("existing-request-image.jpg"),
            is_active=True,
        )

        original_lookup = product_views._vendor_owned_product_request
        with patch.object(
            product_views,
            "_vendor_owned_product_request",
            wraps=original_lookup,
        ) as lookup_request:
            response = self.client.post(
                self._upload_url(),
                {"images": [create_test_image("new-a.jpg"), create_test_image("new-b.jpg")]},
                format="multipart",
            )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(
            any(call.kwargs.get("for_update") is True for call in lookup_request.call_args_list),
            "The count check must use a request row locked for update.",
        )
        self.assertEqual(self.product_request.images.filter(is_active=True).count(), 1)

    def test_delete_removes_unreferenced_storage_object_only(self):
        self.client.force_authenticate(user=self.vendor)
        img1 = ProductRequestImage.objects.create(
            productrequest=self.product_request,
            image=create_test_image("shared-req.jpg"),
            is_active=True,
        )
        img2 = ProductRequestImage.objects.create(
            productrequest=self.product_request,
            image=img1.image.name,
            is_active=True,
        )
        storage = img1.image.storage
        file_name = img1.image.name
        self.assertTrue(storage.exists(file_name))

        delete_url = reverse(
            "product:delete_product_request_image",
            kwargs={"product_request_image_id": img1.id},
        )
        response = self.client.delete(delete_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(ProductRequestImage.objects.filter(id=img1.id).exists())
        self.assertTrue(storage.exists(file_name))

        delete_url_2 = reverse(
            "product:delete_product_request_image",
            kwargs={"product_request_image_id": img2.id},
        )
        response_2 = self.client.delete(delete_url_2)
        self.assertEqual(response_2.status_code, status.HTTP_200_OK)
        self.assertFalse(storage.exists(file_name))

    def test_edit_product_request_details_preserves_existing_images(self):
        img = ProductRequestImage.objects.create(
            productrequest=self.product_request,
            image=create_test_image("keep-me.jpg"),
            is_active=True,
        )
        original_name = img.image.name
        self.client.force_authenticate(user=self.vendor)
        url = reverse(
            "product:update_specific_product_request",
            kwargs={"product_request_id": self.product_request.id},
        )
        response = self.client.patch(
            url,
            {
                "description": "Updated description only",
                "images": ["https://cdn.example.com/should-not-replace.jpg"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json()["status"])
        img.refresh_from_db()
        self.assertEqual(img.image.name, original_name)
        self.assertEqual(self.product_request.images.filter(is_active=True).count(), 1)
        nested = response.json()["data"]["product_request"]["images"]
        self.assertEqual(len(nested), 1)
        self.assertEqual(nested[0]["id"], str(img.id))

    def test_storage_failure_does_not_report_success_or_leak_aws_details(self):
        self.client.force_authenticate(user=self.vendor)

        def exploding_save(self, *args, **kwargs):
            raise RuntimeError("An error occurred (AccessDenied) when calling the PutObject operation")

        with patch.object(ProductRequestImage, "save", exploding_save):
            response = self.client.post(
                self._upload_url(),
                {"images": [create_test_image()]},
                format="multipart",
            )
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        res_data = response.json()
        self.assertFalse(res_data["status"])
        self.assertNotIn("AccessDenied", str(res_data))
        self.assertNotIn("PutObject", str(res_data))
        self._assert_no_secrets(res_data)
        self.assertEqual(ProductRequestImage.objects.count(), 0)

    def test_failure_after_first_file_cleans_up_all_storage_and_db_records(self):
        """
        Verify that if an upload batch fails after the first file has been processed,
        all storage files and DB records are safely cleaned up (no orphaned records or files).
        """
        self.client.force_authenticate(user=self.vendor)
        file1 = create_test_image("clean1.jpg")
        file2 = create_test_image("clean2.jpg")

        original_save = ProductRequestImage.save
        saved_names = []

        def partial_failure_save(instance, *args, **kwargs):
            if len(saved_names) == 0:
                res = original_save(instance, *args, **kwargs)
                saved_names.append(instance.image.name)
                return res
            raise IOError("Simulated storage failure on 2nd file")

        with patch.object(ProductRequestImage, "save", partial_failure_save):
            response = self.client.post(
                self._upload_url(),
                {"images": [file1, file2]},
                format="multipart",
            )

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        res_data = response.json()
        self.assertFalse(res_data["status"])
        self.assertIn("retry", str(res_data["data"]["details"]).lower())
        self._assert_no_secrets(res_data)

        # Verify no DB records were left behind
        self.assertEqual(ProductRequestImage.objects.filter(productrequest=self.product_request).count(), 0)

        # Verify the file saved for the first image was cleaned up from storage
        self.assertEqual(len(saved_names), 1)
        storage = product_image_storage
        self.assertFalse(storage.exists(saved_names[0]))

    def test_local_storage_fallback_when_s3_not_configured(self):
        product_image_storage._underlying = None
        self.client.force_authenticate(user=self.vendor)
        response = self.client.post(
            self._upload_url(),
            {"images": [create_test_image("local.jpg")]},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        img = ProductRequestImage.objects.get(productrequest=self.product_request)
        self.assertTrue(img.image.name.startswith("product_request_images/"))
        self.assertTrue(img.image.storage.exists(img.image.name))
        self.assertIsInstance(img.image.storage._get_underlying(), FileSystemStorage)

    @override_settings(AWS_STORAGE_BUCKET_NAME="motospar-test-local")
    def test_mocked_storage_url_formatting_without_live_s3_upload(self):
        """
        Verify downstream URL formatting with mocked storage.
        NOTE: This test uses MockedUrlStorage on the local filesystem to verify URL
        construction in responses. It does NOT perform or prove a live S3 upload.
        """
        tmpdir = tempfile.mkdtemp(prefix="motospar-s3-mock-")
        mocked_storage = MockedUrlStorage(location=tmpdir)
        product_image_storage._underlying = mocked_storage
        try:
            self.client.force_authenticate(user=self.vendor)
            response = self.client.post(
                self._upload_url(),
                {"images": [create_test_image("s3-mock.jpg")]},
                format="multipart",
            )
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            res_data = response.json()
            self._assert_no_secrets(res_data)
            image_url = res_data["data"]["images"][0]["image_url"]
            self.assertTrue(image_url.startswith("https://motospar-test-local.s3.amazonaws.com/"))
            self.assertNotIn("X-Amz-Signature", image_url)
            img = ProductRequestImage.objects.get(productrequest=self.product_request)
            self.assertTrue(os.path.exists(os.path.join(tmpdir, img.image.name)))
        finally:
            product_image_storage._underlying = None

    def test_storage_selection_and_configuration_without_network(self):
        """
        Controlled test of storage backend selection:
        - Local filesystem fallback when AWS_STORAGE_BUCKET_NAME is empty.
        - S3Boto3Storage selection with private bucket settings when configured.
        Tested safely without network access or live S3 writes.
        """
        from product.storage import ProductImageS3Storage
        # 1. Fallback to FileSystemStorage when bucket is empty
        with override_settings(AWS_STORAGE_BUCKET_NAME=""):
            storage = ProductImageS3Storage()
            underlying = storage._get_underlying()
            self.assertIsInstance(underlying, FileSystemStorage)
            self.assertEqual(underlying.location, os.path.join(settings.BASE_DIR, "media"))

        # 2. S3 storage selection when bucket is configured
        with override_settings(
            AWS_STORAGE_BUCKET_NAME="motospar-test-staging-bucket",
            AWS_S3_REGION_NAME="ap-south-1",
            AWS_QUERYSTRING_AUTH=True,
            AWS_QUERYSTRING_EXPIRE=3600,
            AWS_ACCESS_KEY_ID="MOCK_KEY",
            AWS_SECRET_ACCESS_KEY="MOCK_SECRET",
        ):
            with patch("storages.backends.s3boto3.S3Boto3Storage.connection"):
                from storages.backends.s3boto3 import S3Boto3Storage
                storage = ProductImageS3Storage()
                underlying = storage._get_underlying()
                self.assertIsInstance(underlying, S3Boto3Storage)
                self.assertEqual(underlying.bucket_name, "motospar-test-staging-bucket")
                self.assertEqual(underlying.region_name, "ap-south-1")
                self.assertTrue(underlying.querystring_auth)
                self.assertEqual(underlying.querystring_expire, 3600)
                self.assertFalse(underlying.file_overwrite)
