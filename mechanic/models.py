# Standard Library Imports
import uuid
from datetime import datetime

# Django Imports
from django.db import models
from django.utils.translation import gettext as _
from django.core.exceptions import ValidationError

# Local Imports
from app.models import User
from order.models import OrderItem
from product.models import JobType  # Assuming JobType is defined in product.models
# Create your models here.




# ***** =====  Tables for Mechanic Related Data  ===== *****
# ? Mechanic Profile Model to store information about mechanics.
class MechanicProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # One-to-one relationship with User (mechanic)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mechanic_profile')
    
    # Mechanic's professional info
    expertise = models.CharField(max_length=255, blank=True)  # e.g. "Engine Specialist, Electrical Systems"
    years_of_experience = models.PositiveIntegerField(null=True, blank=True)
    certifications = models.TextField(blank=True)  # certifications or qualifications
    
    # Contact info (optional to override user contact)
    contact_phone = models.CharField(max_length=15, blank=True)
    contact_email = models.EmailField(blank=True, null=True)
    
    # Service area or location from which mechanic operates (optional)
    base_address = models.TextField(blank=True)
    base_city = models.CharField(max_length=32, blank=True)
    base_state = models.CharField(max_length=16, blank=True)
    base_country = models.CharField(max_length=32, blank=True)
    base_postal_code = models.CharField(max_length=8, blank=True)
    
    # Geolocation (optional, useful for mapping mechanic locations)
    latitude = models.DecimalField(max_digits=24, decimal_places=20, null=True, blank=True)
    longitude = models.DecimalField(max_digits=24, decimal_places=20, null=True, blank=True)
    
    # Availability (could be further extended)
    is_available = models.BooleanField(default=True)
    working_hours = models.CharField(max_length=100, blank=True)  # e.g. "9 AM - 6 PM"
    
    # Bank/payment details for payouts (optional)
    bank_account_number = models.CharField(max_length=50, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    ifsc_code = models.CharField(max_length=11, blank=True)  # for India

    # Specialization fields (optional)
    specialization = models.CharField(max_length=255, blank=True)  # e.g. "Car, Bike, Truck"
    service_types = models.TextField(blank=True)  # e.g. "Oil Change, Brake Repair, Electrical Work"
    uploaded_documents = models.FileField(upload_to='mechanic_documents/', blank=True, null=True)  # e.g. certifications, licenses
    uploaded_documents_type = models.CharField(
        max_length=50, blank=True, null=True,
        help_text="Type of the uploaded document (e.g. 'License', 'Certification')"
    )

    # Referral fields (optional)
    referral_code = models.CharField(max_length=20, blank=True)  # for tracking referrals
    
    # Boolean fields for additional features
    is_verified = models.BooleanField(default=False)  # Mechanic's verification status

    # Top-up related fields
    total_top_up = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Total amount topped up by the mechanic")
    top_up_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Current top-up balance available")

    # Default fields
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.user.email} - Mechanic Profile"

    # * For soft delete
    def soft_delete(self, *args, **kwargs):
        self.is_active = False  # set is_active field to False
        self.save()
    
    # * For Hard delete
    def hard_delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)


# ? MechanicPlatformFee Model to manage platform fees charged to mechanics.
class MechanicPlatformFee(models.Model):
    PAYMENT_STATUS_CHOICES = (
        ('PENDING', 'PENDING'),
        ('SUCCESS', 'SUCCESS'),
        ('FAILURE', 'FAILURE'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mechanic = models.ForeignKey(MechanicProfile, on_delete=models.PROTECT, related_name='platform_fees')

    # Fee details
    fee_amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Amount of platform fee charged")
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    
    # Payment gateway fields
    provider_transaction_id = models.CharField(max_length=64, blank=True, help_text="Transaction ID from payment provider")
    payment_id = models.CharField(max_length=64, blank=True, help_text="Payment ID for tracking")
    signature_id = models.CharField(max_length=128, blank=True, help_text="Signature ID for payment verification")
    is_successful = models.BooleanField(default=False, help_text="Indicates if the fee payment was successful")
    
    # Default fields
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Platform Fee for {self.mechanic.user.email}"
    
    # * For soft delete
    def soft_delete(self, *args, **kwargs):
        self.is_active = False  # set is_active field to False
        self.save()
    
    # * For Hard delete
    def hard_delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)


# ? MechanicJob Model to manage mechanic jobs related to order items.
class MechanicJob(models.Model):
    JOB_STATUS_CHOICES = (
        ('pending', 'pending'),
        ('in_progress', 'in_progress'),
        ('completed', 'completed'),
        ('cancelled', 'cancelled'),
    )
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'pending'),
        ('success', 'success'),
        ('failure', 'failure'),
    )
    # Unique identifier for each mechanic job
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_item = models.ForeignKey(OrderItem, on_delete=models.PROTECT, related_name='mechanic_jobs')
    mechanic = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_mechanic_jobs')
    job_type = models.ForeignKey(JobType, on_delete=models.PROTECT, null=True, blank=True, related_name='mechanic_jobs', help_text="Type of mechanic job")

    # Status fields
    is_accepted = models.BooleanField(default=False, help_text="Indicates if the mechanic has accepted the job")
    job_status = models.CharField(max_length=20, choices=JOB_STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Fees and charges related to the job
    mechanic_fees = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    
    # Timestamps for job lifecycle
    start_date = models.DateTimeField(null=True, blank=True, help_text="Date and time when the job started")
    completion_date = models.DateTimeField(null=True, blank=True, help_text="Date and time when the job was completed")
    scheduled_date = models.DateTimeField(null=True, blank=True, help_text="Scheduled date and time for the job")
    payment_date = models.DateField(null=True, blank=True, help_text="Date when payment was processed")
    notes = models.TextField(blank=True, help_text="Additional notes about the job")
    
    # Job Decline fields
    decline_reason = models.TextField(blank=True, null=True, help_text="Reason for declining the job")

    # Review and rating fields
    review = models.TextField(blank=True, help_text="Review given by the customer")
    rating = models.DecimalField(
        max_digits=3, decimal_places=1, null=True, blank=True,
        help_text="Rating given by the customer (1.0-5.0)"
    )

    # Default fields
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['order_item'],
                name='unique_mechanic_job_per_order_item'
            )
        ]

    def __str__(self):
        return f"Job for {self.order_item} - {self.job_status}"

    def clean(self):
        if self.mechanic_fees < 0:
            raise ValidationError("Mechanic fees cannot be negative.")
        # if self.completion_date and self.start_date and self.completion_date < self.start_date:
        #     raise ValidationError("Completion date cannot be before start date.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    # * For soft delete
    def soft_delete(self, *args, **kwargs):
        self.is_active = False  # set is_active field to False
        self.save()
    
    # * For Hard delete
    def hard_delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)


# ? Model to store images associated with a MechanicJob
class MechanicJobImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mechanic_job = models.ForeignKey(MechanicJob, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='mechanic_job_images/', help_text="Image associated with the mechanic job")
    uploaded_at = models.DateTimeField(auto_now_add=True, help_text="Date and time when the image was uploaded")
    description = models.TextField(blank=True, null=True, help_text="Optional description of the image")
    
    # Default fields
    created_at = models.DateTimeField(auto_now_add=True, help_text="Date and time when the image record was created")
    last_modified_at = models.DateTimeField(auto_now=True, help_text="Date and time when the image record was last modified")
    is_active = models.BooleanField(default=True, help_text="Indicates if the image is active")

    class Meta:
        verbose_name = "Mechanic Job Image"
        verbose_name_plural = "Mechanic Job Images"

    def __str__(self):
        return f"Image for {self.mechanic_job} - {self.uploaded_at}"

    def clean(self):
        if not self.image:
            raise ValidationError("An image file is required.")

    # * For soft delete
    def soft_delete(self, *args, **kwargs):
        self.is_active = False  # set is_active field to False
        self.save()
    
    # * For Hard delete
    def hard_delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)


# ? MechanicText Model to store text data related to mechanics.
class MechanicReportApp(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mechanic = models.ForeignKey(MechanicProfile, on_delete=models.CASCADE, related_name='texts')
    text_type = models.CharField(
        max_length=50, choices=[
            ('app_preference', 'app_preference'),
            ('report_issue', 'report_issue'),
            ('other', 'other')
        ],
        help_text="Type of text content (e.g. issue, feedback, note)"
    )
    text_content = models.TextField(help_text="Text content related to the mechanic")
    
    # Default fields
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Text for {self.mechanic.user.email} - {self.text_content[:50]}"

    # * For soft delete
    def soft_delete(self, *args, **kwargs):
        self.is_active = False  # set is_active field to False
        self.save()
    
    # * For Hard delete
    def hard_delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
# ***** =====  END  ===== *****