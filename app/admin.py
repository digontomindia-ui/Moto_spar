# app/admin.py

# Python Standard Library Imports
import csv

# Django Imports
from django.contrib import admin
from django.http import HttpResponse
from django.utils.translation import gettext_lazy as _

# Third-Party Library Imports
from rangefilter.filters import DateRangeFilter

# Django App Imports
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, PasswordResetOTP, ContactUs


# ***** =====  Custom Admin Panel Code ===== *****
# ! Custom Admin class for User Model
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin class for User model."""
    
    list_display = (
        'id', 'username', 'email', 'get_full_name', 'phone_number', 'account_type',
        'is_active', 'is_verified', 'date_joined', 'is_superuser'
    )
    list_filter = (
        ('date_joined', DateRangeFilter),  # Enable date range filter for date_joined
        'is_active',
        'is_verified',
        'account_type',
        'is_superuser',
    )
    search_fields = (
        'username', 'email', 'first_name', 'last_name', 'country_code', 'phone_number',
    )

    readonly_fields = ('id','date_joined', 'last_login')

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal Info'), {
            'fields': (
                'email', 'first_name', 'last_name', 'country_code', 'phone_number', 
                'profile_picture', 'bio', 'date_of_birth', 'account_type',
            ),
        }),
        (_('Address'), {
            'fields': ('address', 'city', 'state', 'country', 'postal_code'),
        }),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'is_verified', 'groups', 'user_permissions'),
        }),
        (_('Notifications'), {
            'fields': ('device_token', 'is_push_notification', 'is_voice_alert'),
        }),
        (_('OTP'), {
            'fields': ('verification_code', 'expiration_time'),
        }),
        (_('Important Dates'), {
            'fields': ('last_login', 'date_joined'),
        }),
    )

    # Custom display method for full name
    def get_full_name(self, obj):
        return obj.get_full_name()
    get_full_name.short_description = 'Full Name'

    actions = ['export_users_to_csv', 'soft_delete_selected', 'hard_delete_selected']

    def export_users_to_csv(self, request, queryset):
        """Export selected users to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="users.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'Username', 'Email', 'Full Name', 'Country Code', 'Phone Number',
                'Account Type', 'Is Active', 'Is Verified', 'Date Joined', 'City', 
                'State', 'Country', 'Postal Code', 'Bio', 'Profile Picture',
            ])

            for user in queryset:
                writer.writerow([
                    user.id,
                    user.username,
                    user.email,
                    user.get_full_name(),
                    user.country_code,
                    user.phone_number,
                    user.account_type,
                    user.is_active,
                    user.is_verified,
                    user.date_joined.strftime('%Y-%m-%d %H:%M:%S') if user.date_joined else '',
                    user.city,
                    user.state,
                    user.country,
                    user.postal_code,
                    user.bio,
                    user.profile_picture.url if user.profile_picture else '',
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_users_to_csv.short_description = "Export selected users to CSV"

    def soft_delete_selected(self, request, queryset):
        """Soft delete selected users."""
        try:
            updated = queryset.update(is_active=False)
            self.message_user(request, f"Successfully soft-deleted {updated} users.")
        except Exception as e:
            self.message_user(request, f"Error during soft delete: {str(e)}", level='error')

    soft_delete_selected.short_description = "Soft delete selected users"

    def hard_delete_selected(self, request, queryset):
        """Hard delete selected users."""
        try:
            deleted_count = queryset.count()
            queryset.delete()
            self.message_user(request, f"Successfully hard-deleted {deleted_count} users.")
        except Exception as e:
            self.message_user(request, f"Error during hard delete: {str(e)}", level='error')

    hard_delete_selected.short_description = "Hard delete selected users"

    # Default ordering
    ordering = ['-date_joined']


# ! Custom PasswordResetOTPAdmin Admin Panel Code
@admin.register(PasswordResetOTP)
class PasswordResetOTPAdmin(admin.ModelAdmin):
    """Custom admin class for the PasswordResetOTP model with CSV export functionality."""

    # Fields to display in the admin list view
    list_display = (
        'id', 'user', 'otp', 'is_valid', 'is_verified', 
        'is_expired', 'created_at', 'updated_at', 'is_active'
    )

    # Filters
    list_filter = (
        'is_valid', 'is_verified', 'is_active', 
        ('created_at', DateRangeFilter),  # Date range filter for created_at
        ('updated_at', DateRangeFilter),  # Date range filter for updated_at
    )

    # Searchable fields
    search_fields = (
        'user__email', 'otp'
    )

    # Fields to display as read-only
    readonly_fields = ('created_at', 'updated_at', 'is_expired')

    # Fieldsets for organized form layout
    fieldsets = (
        (None, {
            'fields': ('user', 'otp')
        }),
        ('Status', {
            'fields': ('is_valid', 'is_verified', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'is_expired'),
        }),
    )

    # Custom actions
    actions = ['export_otps_to_csv', 'mark_valid', 'mark_invalid', 'mark_verified', 'mark_unverified']

    def export_otps_to_csv(self, request, queryset):
        """Export selected PasswordResetOTP records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="password_reset_otps.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'User Email', 'OTP', 'Is Valid', 'Is Verified', 
                'Is Expired', 'Created At', 'Updated At', 'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.user.email if record.user else '',  # User email
                    record.otp,
                    record.is_valid,
                    record.is_verified,
                    record.is_expired(),
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_otps_to_csv.short_description = "Export selected Password Reset OTPs to CSV"

    def mark_valid(self, request, queryset):
        """Mark selected OTPs as valid."""
        queryset.update(is_valid=True)
        self.message_user(request, "Selected OTPs have been marked as valid.")
    mark_valid.short_description = "Mark selected OTPs as valid"

    def mark_invalid(self, request, queryset):
        """Mark selected OTPs as invalid."""
        queryset.update(is_valid=False)
        self.message_user(request, "Selected OTPs have been marked as invalid.")
    mark_invalid.short_description = "Mark selected OTPs as invalid"

    def mark_verified(self, request, queryset):
        """Mark selected OTPs as verified."""
        queryset.update(is_verified=True)
        self.message_user(request, "Selected OTPs have been marked as verified.")
    mark_verified.short_description = "Mark selected OTPs as verified"

    def mark_unverified(self, request, queryset):
        """Mark selected OTPs as unverified."""
        queryset.update(is_verified=False)
        self.message_user(request, "Selected OTPs have been marked as unverified.")
    mark_unverified.short_description = "Mark selected OTPs as unverified"

    # Default ordering
    ordering = ['-created_at']


# ! Custom Admin class for ContactUs Model
@admin.register(ContactUs)
class ContactUsAdmin(admin.ModelAdmin):
    """Custom admin class for ContactUs model."""

    list_display = (
        'id', 'name', 'email', 'phone_number', 'message', 'created_at', 'last_modified_at', 'is_active'
    )
    list_filter = (
        'is_active',
        ('created_at', DateRangeFilter),  # Enable date range filter for created_at
    )
    search_fields = (
        'name', 'email', 'phone_number', 'message'
    )

    readonly_fields = ('created_at', 'last_modified_at')

    fieldsets = (
        (None, {'fields': ('name', 'email', 'phone_number', 'message')}),
        (_('Default Fields'), {
            'fields': ('created_at', 'last_modified_at', 'is_active'),
        }),
    )

    def export_contact_us_to_csv(self, request, queryset):
        """Export selected Contact Us records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="contact_us.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'Name', 'Email', 'Phone Number', 'Message', 
                'Created At', 'Last Modified At', 'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.name,
                    record.email,
                    record.phone_number,
                    record.message,
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_contact_us_to_csv.short_description = "Export selected Contact Us records to CSV"

    actions = ['export_contact_us_to_csv']
# ***** =====  End of Custom Admin Panel Code  ===== *****