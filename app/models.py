# aap/models.py

# Standard Library Imports
import uuid
import random
import string

# Django Imports
from django.contrib.auth.models import AbstractUser 
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext as _
from django.conf import settings

# Third-party Imports
# from django_rest_passwordreset.signals import reset_password_token_created


# Create your models here.


# ! For DRF Password Reset
# @receiver(reset_password_token_created)
# def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
#     subject = 'Password Reset Request - MotoSpar'
#     from_email = settings.EMAIL_HOST_USER
#     recipient_list = [reset_password_token.user.email]

#     # Render the email content using the HTML template
#     html_content = render_to_string('password_reset_email.html', {
#         'user': reset_password_token.user,
#         'reset_password_token': reset_password_token,
#         'current_year': datetime.now().year
#     })
#     text_content = strip_tags(html_content)

#     try:
#         msg = EmailMultiAlternatives(subject, text_content, from_email, recipient_list)
#         msg.attach_alternative(html_content, "text/html")
#         msg.send(fail_silently=False)
#     except Exception:
#         pass
# ***** =====  END  ===== *****


# ***** =====  Tables for User Related Data  ===== *****
# ! User Table
class User(AbstractUser):
    # -------------------------------
    # Choices
    # -------------------------------
    USER_TYPE_CHOICES = [
        ('customer', 'customer'),
        ('vendor', 'vendor'),
        ('admin', 'admin'),
        ('mechanic', 'mechanic'),
    ]

    # -------------------------------
    # Primary Identification
    # -------------------------------        
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_('email address'), unique=True)
    country_code = models.CharField(max_length=8, default="91")
    phone_number = models.CharField(max_length=16, unique=True, null=True, blank=True)
    
    # -------------------------------
    # Account Type and Profile
    # -------------------------------
    account_type = models.CharField(max_length=16, choices=USER_TYPE_CHOICES, default='customer')
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    bio = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)

    # -------------------------------
    # Address & Location
    # -------------------------------
    address = models.TextField(blank=True)
    city = models.CharField(max_length=32, blank=True)
    state = models.CharField(max_length=16, blank=True)
    country = models.CharField(max_length=32, blank=True)    
    postal_code = models.CharField(max_length=8, blank=True)

    # -------------------------------
    # Settings
    # -------------------------------
    device_token = models.CharField(max_length=255, null=True, blank=True)  # To store the device token
    is_voice_alert = models.BooleanField(default=False)
    is_push_notification = models.BooleanField(default=True)

    # -------------------------------
    # Audit Fields
    # -------------------------------
    date_joined = models.DateTimeField(auto_now_add=True, verbose_name=_('Date Joined'))
    
    # -------------------------------
    # OTP Verification (Phone Login)
    # -------------------------------
    verification_code = models.CharField(max_length=6, null=True, blank=True)  # Assuming a 6-digit code
    expiration_time = models.DateTimeField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)

    # -------------------------------
    # Django Auth Settings
    # -------------------------------
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username'] # removes email from REQUIRED_FIELDS


    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        indexes = [
                models.Index(fields=['account_type'], name='idx_user_account_type'),  # For filtering by account type (e.g., customer, vendor)
                models.Index(fields=['date_joined'], name='idx_user_date_joined'),  # For sorting/filtering by join date
            ]

    # * For creating superuser
    def create_superuser(self, email, password=None):
        user = self.create_user(
            email,
            password=password,
            is_staff=True,
            is_admin=True,
        )
        return user
    
    # -------------------------------
    # Instance Methods
    # -------------------------------    
    def __str__(self):
        return self.email

    # * To prevent duplicate phone number with same country code 
    def save(self, *args, **kwargs):
        # Check if the phone_number is unique for the given country_code
        if self.phone_number and self.country_code:
            existing_users_with_same_phone = User.objects.filter(
                phone_number=self.phone_number,
                country_code=self.country_code
            ).exclude(id=self.id)

            if existing_users_with_same_phone.exists():
                raise ValidationError(_('A user with this phone number and country code already exists.'))

        super().save(*args, **kwargs)

    def generate_referral_code(self):
        """Generate a unique referral code."""
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        while User.objects.filter(referral_code=code).exists():
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return code
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def is_customer(self):
        return self.account_type == 'customer'
    
    def is_mechanic(self):
        return self.account_type == 'mechanic'

    def is_vendor(self):
        return self.account_type == 'vendor'

    def is_admin(self):
        return self.account_type == 'admin'

    # * For soft delete
    def soft_delete(self, *args, **kwargs):
        self.is_active = False  # set is_active field to False
        self.save()
    
    # * For Hard delete
    def hard_delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)

    # -------------------------------
    # Static & Class Methods
    # -------------------------------
    @staticmethod
    def is_email_registered(email):
        return User.objects.filter(email=email.strip().lower()).exists()

    @staticmethod
    def is_phone_registered(phone_number, country_code):
        return User.objects.filter(phone_number=phone_number, country_code=country_code).exists()

    @classmethod
    def create_admin(cls, validated_data):
        user_data = {
            'email': validated_data['email'].strip().lower(),
            'username': validated_data['email'].strip().lower(),
            'password': validated_data['password'],
            'first_name': validated_data.get('first_name'),
            'last_name': validated_data.get('last_name'),
            'account_type': 'admin',
            'phone_number': validated_data.get('phone_number'),
            'country_code': validated_data.get('country_code'),
        }

        # Remove None values
        user_data = {k: v for k, v in user_data.items() if v is not None}

        user = cls.objects.create_user(**user_data)
        return user

    @classmethod
    def create_vendor(cls, validated_data):
        user_data = {
            'email': validated_data['email'].strip().lower(),
            'username': validated_data['email'].strip().lower(),
            'password': validated_data['password'],
            'first_name': validated_data.get('first_name'),
            'last_name': validated_data.get('last_name'),
            'account_type': 'vendor',
            'phone_number': validated_data.get('phone_number'),
            'country_code': validated_data.get('country_code'),
        }

        # Remove None values
        user_data = {k: v for k, v in user_data.items() if v is not None}

        user = cls.objects.create_user(**user_data)
        return user

    @classmethod
    def create_mechanic(cls, validated_data):
        user_data = {
            'email': validated_data['email'].strip().lower(),
            'username': validated_data['email'].strip().lower(),
            'password': validated_data['password'],
            'first_name': validated_data.get('first_name'),
            'last_name': validated_data.get('last_name'),
            'account_type': 'mechanic',
            'phone_number': validated_data.get('phone_number'),
            'country_code': validated_data.get('country_code'),
        }

        # Remove None values
        user_data = {k: v for k, v in user_data.items() if v is not None}

        user = cls.objects.create_user(**user_data)
        return user
    
    @classmethod
    def create_customer(cls, validated_data):
        user_data = {
            'email': validated_data['email'].strip().lower(),
            'username': validated_data['email'].strip().lower(),
            'password': validated_data['password'],
            'first_name': validated_data.get('first_name'),
            'last_name': validated_data.get('last_name'),
            'account_type': 'customer',
            'phone_number': validated_data.get('phone_number'),
            'country_code': validated_data.get('country_code'),
        }

        # Remove None values
        user_data = {k: v for k, v in user_data.items() if v is not None}

        user = cls.objects.create_user(**user_data)
        return user
# ***** =====  END  ===== *****


# ***** =====  Tables for assword Reset OTP ===== *****
# ! Password Reset Table 
class PasswordResetOTP(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='password_reset_otps')
    otp = models.CharField(max_length=6)
    is_valid = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)

    # Meta information
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))

    def __str__(self):
        return f"Password Reset OTP for {self.user.email}"

    def is_expired(self):
        """OTP is valid for 10 minutes"""
        if self.created_at is None:
            return True  # If created_at is None, consider the OTP expired
        expiry_time = self.created_at + timezone.timedelta(minutes=10)
        return timezone.now() > expiry_time

    def clean(self):
        """Prevent generating multiple OTPs for the same user within a short period"""
        last_otp = PasswordResetOTP.objects.filter(user=self.user, is_valid=True).last()
        if last_otp and not last_otp.is_expired():
            raise ValidationError("An OTP has already been sent. Please wait before requesting a new one.")

    # * For soft delete
    def soft_delete(self, *args, **kwargs):
        self.is_active = False  # set is_active field to False
        self.save()
    
    # * For Hard delete
    def hard_delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
# ***** =====  END  ===== *****


# ! Contact Us Table 
# ***** =====  Tables for Contact Us Data  ===== *****
class ContactUs(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone_number = models.CharField(max_length=16, blank=True)
    message = models.TextField()

    # Default fields
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)  # add is_active field

    class Meta:
        verbose_name = "Contact Us"
        verbose_name_plural = "Contact Us Entries"
        ordering = ['-created_at']  # Order by created_at descending

    def __str__(self):
        return f"Contact Us from {self.name} ({self.email}) on {self.created_at}"

    # * For soft delete
    def delete(self, *args, **kwargs):
        self.is_active = False  # set is_active field to False
        self.save()

    def save(self, *args, **kwargs):
        # You can add any additional logic here if needed
        super().save(*args, **kwargs)
# ***** =====  END  ===== *****