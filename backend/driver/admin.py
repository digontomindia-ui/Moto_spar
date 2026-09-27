# Python Standard Library Imports
import csv

# Django Imports
from django.contrib import admin
from django.http import HttpResponse
from django.utils.translation import gettext_lazy as _

# Third-Party Library Imports
from rangefilter.filters import DateRangeFilter

# Django App Imports
from .models import Driver


# Register your models here.


# ***** =====  Custom Admin Panel Code ===== *****
@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    """Custom admin class for Driver model."""

    list_display = (
        'id', 'first_name', 'last_name', 'email', 'phone_number', 
        'license_number', 'license_status', 'is_available', 
        'employment_status', 'total_deliveries', 'rating', 
        'city', 'state', 'created_at', 'last_modified_at', 'is_active'
    )
    list_filter = (
        'license_status',
        'is_available',
        'employment_status',
        'city',
        'state',
        ('created_at', DateRangeFilter),  # Enable date range filter for created_at
    )
    search_fields = (
        'first_name', 
        'last_name', 
        'email', 
        'phone_number', 
        'license_number', 
        'city', 
        'state',
    )
    readonly_fields = ('created_at', 'last_modified_at')

    fieldsets = (
        (None, {
            'fields': ('first_name', 'last_name', 'email', 'phone_number', 
                       'date_of_birth', 'profile_picture')
        }),
        ('Driver License Details', {
            'fields': ('license_number', 'license_type', 'license_expiry_date', 'license_status')
        }),
        ('Employment and Availability', {
            'fields': ('is_available', 'employment_status', 'total_deliveries', 'rating')
        }),
        ('Address Details', {
            'fields': ('address_line_1', 'address_line_2', 'city', 'state', 'postal_code', 'country')
        }),
        ('Emergency Contact', {
            'fields': ('emergency_contact_name', 'emergency_contact_phone')
        }),
        ('Default Fields', {
            'fields': ('created_at', 'last_modified_at', 'is_active'),
        }),
    )

    def export_drivers_to_csv(self, request, queryset):
        """Export selected Driver records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="drivers.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'First Name', 'Last Name', 'Email', 'Phone Number', 
                'License Number', 'License Status', 'Is Available', 
                'Employment Status', 'Total Deliveries', 'Rating', 
                'City', 'State', 'Created At', 'Last Modified At', 'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.first_name,
                    record.last_name,
                    record.email,
                    record.phone_number,
                    record.license_number,
                    record.get_license_status_display(),
                    'Yes' if record.is_available else 'No',
                    record.get_employment_status_display(),
                    record.total_deliveries,
                    record.rating,
                    record.city,
                    record.state,
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    'Active' if record.is_active else 'Inactive',
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_drivers_to_csv.short_description = "Export selected Drivers to CSV"

    actions = ['export_drivers_to_csv']
# ***** =====  END  ===== *****