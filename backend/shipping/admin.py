# Python Standard Library Imports
import csv

# Django Imports
from django.contrib import admin
from django.http import HttpResponse
from django.utils.translation import gettext_lazy as _

# Third-Party Library Imports
from rangefilter.filters import DateRangeFilter

# Django App Imports
from .models import ShippingAddress, BillingAddress


# Register your models here.


# ***** =====  Custom Admin Panel Code ===== *****
# ! Custom Admin class for Shipping Address Model
@admin.register(ShippingAddress)
class ShippingAddressAdmin(admin.ModelAdmin):
    """Custom admin class for ShippingAddress model."""

    list_display = (
        'id', 'user', 'street_address', 'city', 'state', 'postal_code',
        'country', 'phone_number', 'alternate_phone_number',
        'created_at', 'last_modified_at', 'is_active'
    )
    list_filter = (
        'is_active', 
        ('created_at', DateRangeFilter),  # Enable date range filter for created_at
    )
    search_fields = (
        'user__email', 'street_address', 'city', 'state', 'postal_code',
    )

    readonly_fields = ('created_at', 'last_modified_at')

    fieldsets = (
        (None, {'fields': ('user', 'name', 'email', 'address_type',
                'street_address', 'city', 'state', 'postal_code', 'country', 'phone_number', 'alternate_phone_number', 'latitude', 'longitude')}),
        ('Default Fields', {
            'fields': ('created_at', 'last_modified_at', 'is_active'),
        }),
    )

    def export_shipping_address_to_csv(self, request, queryset):
        """Export selected ShippingAddress records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="shipping_addresses.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'User Email', 'Name', 'Email', 'Address Type', 
                'Street Address', 'City', 
                'State', 'Postal Code', 'Country', 'Phone Number',
                'Alternate Phone Number', 'Latitude', 'Longitude',
                'Created At', 'Last Modified At', 'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.user.email,
                    record.name,
                    record.email,
                    record.get_address_type_display(),
                    record.street_address,
                    record.city,
                    record.state,
                    record.postal_code,
                    record.country,
                    record.phone_number,
                    record.alternate_phone_number,
                    record.latitude,
                    record.longitude,
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_shipping_address_to_csv.short_description = "Export selected Shipping Addresses to CSV"

    actions = ['export_shipping_address_to_csv']


# ! Custom Admin class for Billing Address Model
@admin.register(BillingAddress)
class BillingAddressAdmin(admin.ModelAdmin):
    """Custom admin class for BillingAddress model."""

    list_display = (
        'id', 'user', 'street_address', 'city', 'state', 'postal_code',
        'country', 'phone_number', 'alternate_phone_number',
        'created_at', 'last_modified_at', 'is_active'
    )
    list_filter = (
        'is_active', 
        ('created_at', DateRangeFilter),  # Enable date range filter for created_at
    )
    search_fields = (
        'user__email', 'street_address', 'city', 'state', 'postal_code',
    )

    readonly_fields = ('created_at', 'last_modified_at')

    fieldsets = (
        (None, {'fields': ('user', 'name', 'email', 'address_type', 
                            'street_address', 'city', 'state', 'postal_code', 'country', 'phone_number', 'alternate_phone_number')}),
        ('Default Fields', {
            'fields': ('created_at', 'last_modified_at', 'is_active'),
        }),
    )

    def export_billing_address_to_csv(self, request, queryset):
        """Export selected BillingAddress records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="billing_addresses.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'User Email', 'Name', 'Email', 'Address Type',
                'Street Address', 'City', 
                'State', 'Postal Code', 'Country', 'Phone Number',
                'Alternate Phone Number', 'Created At', 
                'Last Modified At', 'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.user.email,
                    record.name,
                    record.email,
                    record.get_address_type_display(),
                    record.street_address,
                    record.city,
                    record.state,
                    record.postal_code,
                    record.country,
                    record.phone_number,
                    record.alternate_phone_number,
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_billing_address_to_csv.short_description = "Export selected Billing Addresses to CSV"

    actions = ['export_billing_address_to_csv']
# ***** =====  END  ===== *****