# Python Standard Library Imports
import csv

# Django Imports
from django.contrib import admin
from django.http import HttpResponse
from django.utils.translation import gettext_lazy as _

# Third-Party Library Imports
from rangefilter.filters import DateRangeFilter

# Django App Imports
from .models import (
    MechanicProfile, MechanicJob, MechanicJobImage,
    MechanicReportApp, MechanicPlatformFee)


# ***** =====  Custom Admin Panel Code ===== *****
@admin.register(MechanicProfile)
class MechanicProfileAdmin(admin.ModelAdmin):
    """Custom admin class for MechanicProfile model."""

    list_display = (
        'id', 'user', 'expertise', 'years_of_experience', 'contact_email', 
        'contact_phone', 'base_city', 'base_state', 'is_available', 
        'is_verified', 'created_at', 'last_modified_at', 'is_active'
    )
    list_filter = (
        'is_active', 'is_available', 'is_verified',
        ('created_at', DateRangeFilter),  # Enable date range filter for created_at
    )
    search_fields = (
        'user__email', 'expertise', 'certifications', 'contact_email', 
        'contact_phone', 'specialization', 'service_types'
    )

    readonly_fields = ('created_at', 'last_modified_at')

    fieldsets = (
        (None, {
            'fields': (
                'user', 'expertise', 'years_of_experience', 'certifications', 
                'contact_phone', 'contact_email', 'base_address', 'base_city', 
                'base_state', 'base_country', 'base_postal_code', 'is_available', 
                'working_hours', 'specialization', 'service_types', 'uploaded_documents',
                'uploaded_documents_type', 'referral_code', 'is_verified', 
                'total_top_up', 'top_up_balance',
            )
        }),
        ('Bank and Payment Details', {
            'fields': ('bank_account_number', 'bank_name', 'ifsc_code'),
        }),
        ('Location', {
            'fields': ('latitude', 'longitude'),
        }),
        ('Default Fields', {
            'fields': ('created_at', 'last_modified_at', 'is_active'),
        }),
    )

    def export_mechanic_profile_to_csv(self, request, queryset):
        """Export selected MechanicProfile records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="mechanic_profiles.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'User Email', 'Expertise', 'Years of Experience', 'Certifications',
                'Contact Email', 'Contact Phone', 'Base Address', 'Base City', 
                'Base State', 'Base Country', 'Base Postal Code', 'Latitude', 'Longitude',
                'Is Available', 'Working Hours', 'Bank Account Number', 'Bank Name', 
                'IFSC Code', 'Specialization', 'Service Types', 'Uploaded Documents',
                'Is Verified', 'Created At', 'Last Modified At', 'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.user.email,
                    record.expertise,
                    record.years_of_experience,
                    record.certifications,
                    record.contact_email,
                    record.contact_phone,
                    record.base_address,
                    record.base_city,
                    record.base_state,
                    record.base_country,
                    record.base_postal_code,
                    record.latitude,
                    record.longitude,
                    record.is_available,
                    record.working_hours,
                    record.bank_account_number,
                    record.bank_name,
                    record.ifsc_code,
                    record.specialization,
                    record.service_types,
                    record.uploaded_documents.url if record.uploaded_documents else '',
                    record.is_verified,
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_mechanic_profile_to_csv.short_description = "Export selected Mechanic Profiles to CSV"

    actions = ['export_mechanic_profile_to_csv']


@admin.register(MechanicPlatformFee)
class MechanicPlatformFeeAdmin(admin.ModelAdmin):
    """Custom admin class for MechanicPlatformFee model."""

    list_display = (
        'id', 'mechanic_email', 'fee_amount', 'payment_status', 'provider_transaction_id',
        'payment_id', 'is_successful', 'created_at', 'last_modified_at', 'is_active'
    )
    list_filter = (
        'payment_status', 'is_successful', 'is_active',
        ('created_at', DateRangeFilter),  # Enable date range filter for created_at
    )
    search_fields = (
        'mechanic__user__email', 'provider_transaction_id',
        'payment_id', 'signature_id'
    )

    readonly_fields = ('created_at', 'last_modified_at', )

    fieldsets = (
        (None, {
            'fields': (
                'mechanic', 'fee_amount', 'payment_status', 'is_successful', 
            )
        }),
        ('Payment Gateway Details', {
            'fields': ('provider_transaction_id', 'payment_id', 'signature_id'),
        }),
        ('Default Fields', {
            'fields': ('created_at', 'last_modified_at', 'is_active'),
        }),
    )

    def mechanic_email(self, obj):
        """Display the mechanic's email in the admin list view."""
        return obj.mechanic.user.email
    mechanic_email.short_description = 'Mechanic Email'

    def export_mechanic_platform_fees_to_csv(self, request, queryset):
        """Export selected MechanicPlatformFee records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="mechanic_platform_fees.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'Mechanic Email', 'Fee Amount', 'Payment Status',
                'Provider Transaction ID', 'Payment ID', 'Signature ID',
                'Is Successful', 'Fee Code', 'Created At', 'Last Modified At', 'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.mechanic.user.email,
                    record.fee_amount,
                    record.payment_status,
                    record.provider_transaction_id,
                    record.payment_id,
                    record.signature_id,
                    record.is_successful,
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_mechanic_platform_fees_to_csv.short_description = "Export selected Platform Fees to CSV"

    actions = ['export_mechanic_platform_fees_to_csv']


@admin.register(MechanicJob)
class MechanicJobAdmin(admin.ModelAdmin):
    """Custom admin class for MechanicJob model."""

    list_display = (
        'id', 'order_item', 'mechanic', 'job_status', 'payment_status', 
        'mechanic_fees', 'scheduled_date', 'start_date', 'completion_date', 
        'created_at', 'last_modified_at', 'is_active'
    )
    list_filter = (
        'job_status', 'payment_status', 'is_active',
        ('created_at', DateRangeFilter),
        ('scheduled_date', DateRangeFilter),
        ('start_date', DateRangeFilter),
        ('completion_date', DateRangeFilter),
    )
    search_fields = (
        'order_item__id', 'order_item__variant__product__name', 
        'mechanic__email', 'mechanic__first_name', 'mechanic__last_name', 
        'notes'
    )

    readonly_fields = ('created_at', 'last_modified_at')

    fieldsets = (
        (None, {
            'fields': (
                'order_item', 'mechanic', 'job_type', 'is_accepted', 'job_status', 'payment_status', 
                'mechanic_fees', 'notes', 'decline_reason',
            )
        }),
        ('Job Timestamps', {
            'fields': ('scheduled_date', 'start_date', 'completion_date', 'payment_date'),
        }),
        ('Review and Rating', {
            'fields': ('review', 'rating'),
        }),
        ('Default Fields', {
            'fields': ('created_at', 'last_modified_at', 'is_active'),
        }),
    )

    def export_mechanic_job_to_csv(self, request, queryset):
        """Export selected MechanicJob records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="mechanic_jobs.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'Job ID', 'Order Item ID', 'Product Name', 'Quantity', 
                'Mechanic Email', 'Mechanic Name', 'Job Status', 'Payment Status', 
                'Mechanic Fees', 'Scheduled Date', 'Start Date', 'Completion Date', 
                'Payment Date', 'Notes', 'Created At', 'Last Modified At', 'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.order_item.id,
                    record.order_item.variant.product.name,
                    record.order_item.quantity,
                    record.mechanic.email if record.mechanic else '',
                    record.mechanic.get_full_name() if record.mechanic else '',
                    record.job_status,
                    record.payment_status,
                    record.mechanic_fees,
                    record.scheduled_date.strftime('%Y-%m-%d %H:%M:%S') if record.scheduled_date else '',
                    record.start_date.strftime('%Y-%m-%d %H:%M:%S') if record.start_date else '',
                    record.completion_date.strftime('%Y-%m-%d %H:%M:%S') if record.completion_date else '',
                    record.payment_date.strftime('%Y-%m-%d %H:%M:%S') if record.payment_date else '',
                    record.notes,
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_mechanic_job_to_csv.short_description = "Export selected Mechanic Jobs to CSV"

    actions = ['export_mechanic_job_to_csv']


@admin.register(MechanicJobImage)
class MechanicJobImageAdmin(admin.ModelAdmin):
    """Custom admin class for MechanicJobImage model."""

    list_display = (
        'id',
        'mechanic_job_id',
        'image_preview',
        'description_preview',
        'uploaded_at',
        'created_at',
        'last_modified_at',
        'is_active'
    )
    list_filter = (
        'is_active',
        ('uploaded_at', DateRangeFilter),
        ('created_at', DateRangeFilter),
        ('last_modified_at', DateRangeFilter),
    )
    search_fields = (
        'mechanic_job__id',
        'description',
    )

    readonly_fields = ('id', 'uploaded_at', 'created_at', 'last_modified_at')

    fieldsets = (
        (None, {
            'fields': (
                'mechanic_job',
                'image',
                'description'
            )
        }),
        ('Default Fields', {
            'fields': (
                'id',
                'uploaded_at',
                'created_at',
                'last_modified_at',
                'is_active'
            )
        }),
    )

    def mechanic_job_id(self, obj):
        """Display the UUID of the related MechanicJob."""
        return obj.mechanic_job.id if obj.mechanic_job else 'N/A'
    mechanic_job_id.short_description = 'Mechanic Job ID'

    def image_preview(self, obj):
        """Display a preview of the image."""
        if obj.image:
            return '<img src="{}" style="max-height: 50px;"/>'.format(obj.image.url)
        return 'No Image'
    image_preview.allow_tags = True
    image_preview.short_description = 'Image Preview'

    def description_preview(self, obj):
        """Display a preview of the description."""
        return obj.description[:50] + ('...' if obj.description and len(obj.description) > 50 else '') if obj.description else 'N/A'
    description_preview.short_description = 'Description'

    def export_mechanic_job_images_to_csv(self, request, queryset):
        """Export selected MechanicJobImage records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="mechanic_job_images.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'Image ID',
                'Mechanic Job ID',
                'Image URL',
                'Description',
                'Uploaded At',
                'Created At',
                'Last Modified At',
                'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.mechanic_job.id if record.mechanic_job else '',
                    record.image.url if record.image else '',
                    record.description if record.description else '',
                    record.uploaded_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_mechanic_job_images_to_csv.short_description = "Export selected Mechanic Job Images to CSV"

    actions = ['export_mechanic_job_images_to_csv']


@admin.register(MechanicReportApp)
class MechanicReportAppAdmin(admin.ModelAdmin):
    """Custom admin class for MechanicReportApp model."""

    list_display = (
        'id',
        'mechanic_email',
        'text_type',
        'text_content_preview',
        'created_at',
        'last_modified_at',
        'is_active'
    )
    list_filter = (
        'text_type',
        'is_active',
        ('created_at', DateRangeFilter),
        ('last_modified_at', DateRangeFilter),
    )
    search_fields = (
        'mechanic__user__email',
        'mechanic__user__first_name',
        'mechanic__user__last_name',
        'text_content'
    )

    readonly_fields = ('id', 'created_at', 'last_modified_at')

    fieldsets = (
        (None, {
            'fields': (
                'mechanic',
                'text_type',
                'text_content'
            )
        }),
        ('Default Fields', {
            'fields': (
                'id',
                'created_at',
                'last_modified_at',
                'is_active'
            )
        }),
    )

    def mechanic_email(self, obj):
        """Display the mechanic's email."""
        return obj.mechanic.user.email if obj.mechanic and obj.mechanic.user else 'N/A'
    mechanic_email.short_description = 'Mechanic Email'

    def text_content_preview(self, obj):
        """Display a preview of the text content."""
        return obj.text_content[:50] + ('...' if len(obj.text_content) > 50 else '')
    text_content_preview.short_description = 'Text Content'

    def export_mechanic_report_to_csv(self, request, queryset):
        """Export selected MechanicReportApp records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="mechanic_reports.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'Report ID',
                'Mechanic Email',
                'Mechanic Name',
                'Text Type',
                'Text Content',
                'Created At',
                'Last Modified At',
                'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.mechanic.user.email if record.mechanic and record.mechanic.user else '',
                    record.mechanic.user.get_full_name() if record.mechanic and record.mechanic.user else '',
                    record.text_type,
                    record.text_content,
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_mechanic_report_to_csv.short_description = "Export selected Mechanic Reports to CSV"

    actions = ['export_mechanic_report_to_csv']
# ***** =====  END  ===== *****