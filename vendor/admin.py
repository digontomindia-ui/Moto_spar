# Python Standard Library Imports
import csv

# Django Imports
from django.contrib import admin
from django.http import HttpResponse
from django.utils.translation import gettext_lazy as _

# Third-Party Library Imports
from rangefilter.filters import DateRangeFilter

# Django App Imports
from .models import VendorProfile, VendorStock


# ***** =====  Custom Admin Panel Code ===== *****
# ! Custom Admin class for VendorProfile Model
@admin.register(VendorProfile)
class VendorProfileAdmin(admin.ModelAdmin):
    """Custom admin class for VendorProfile model."""

    list_display = (
        'id', 'user', 'store_name', 'store_description', 'store_logo', 
        'store_city', 'store_postal_code', 'store_state', 
        'store_contact_email', 'store_contact_phone', 
        'created_at', 'last_modified_at', 'is_active'
    )
    list_filter = (
        'is_active', 
        ('created_at', DateRangeFilter),  # Enable date range filter for created_at
    )
    search_fields = (
        'user__email', 'store_name', 'store_description', 'store_contact_email', 
        'store_contact_phone', 'website_url'
    )

    readonly_fields = ('created_at', 'last_modified_at')

    fieldsets = (
        (None, {'fields': ('user', 'store_name', 'store_description', 'store_logo', 
                            'store_address', 'store_city', 'store_postal_code', 
                            'store_state', 'store_country', 'store_contact_email', 
                            'store_contact_phone', 'website_url', 
                            'established_date')}),
        ('Bank and Payment Details', {
            'fields': ('bank_account_number', 'bank_name', 'ifsc_code', 'gst_number'),
        }),
        ('Location', {
            'fields': ('latitude', 'longitude'),
        }),
        ('Default Fields', {
            'fields': ('created_at', 'last_modified_at', 'is_active'),
        }),
    )

    def export_vendor_profile_to_csv(self, request, queryset):
        """Export selected VendorProfile records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="vendor_profiles.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'User Email', 'Store Name', 'Store Description', 'Store Logo',
                'Store Address', 'Store City', 'Store Postal Code', 'Store State', 
                'Store Country', 'Store Contact Email', 'Store Contact Phone', 
                'Website URL', 'Established Date', 
                'Latitude', 'Longitude', 'Bank Account Number', 'Bank Name', 'IFSC Code', 'GST Number',
                'Created At', 'Last Modified At', 
                'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.user.email,
                    record.store_name,
                    record.store_description,
                    record.store_logo.url if record.store_logo else '',
                    record.store_address,
                    record.store_city,
                    record.store_postal_code,
                    record.store_state,
                    record.store_country,
                    record.store_contact_email,
                    record.store_contact_phone,
                    record.website_url,
                    record.established_date.strftime('%Y-%m-%d') if record.established_date else '',
                    record.store_latitude,
                    record.store_longitude,
                    record.bank_account_number,
                    record.bank_name,
                    record.ifsc_code,
                    record.gst_number,
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_vendor_profile_to_csv.short_description = "Export selected Vendor Profiles to CSV"

    actions = ['export_vendor_profile_to_csv']


# ! Custom Admin class for VendorStock Model
@admin.register(VendorStock)
class VendorStockAdmin(admin.ModelAdmin):
    """Custom admin class for VendorStock model."""

    list_display = (
        'id', 'vendorprofile', 'variant', 'stock_quantity', 'in_stock', 'price', 
        'created_at', 'last_modified_at', 'is_active'
    )
    list_filter = (
        'in_stock', 
        'is_active', 
        ('created_at', DateRangeFilter),  # Enable date range filter for created_at
    )
    search_fields = (
        'vendorprofile__user__email', 'variant__product__name'
    )

    readonly_fields = ('created_at', 'last_modified_at')

    fieldsets = (
        (None, {'fields': ('vendorprofile', 'variant', 'stock_quantity', 'in_stock', 'price')}),
        ('Default Fields', {
            'fields': ('created_at', 'last_modified_at', 'is_active'),
        }),
    )

    def export_vendor_stock_to_csv(self, request, queryset):
        """Export selected VendorStock records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="vendor_stocks.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'Vendor Profile', 'Product', 'Stock Quantity', 'In Stock', 
                'Price', 'Created At', 'Last Modified At', 'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.vendorprofile.user.email,
                    record.variant.product.name,
                    record.stock_quantity,
                    record.in_stock,
                    record.price,
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_vendor_stock_to_csv.short_description = "Export selected Vendor Stocks to CSV"

    actions = ['export_vendor_stock_to_csv']
# ***** =====  END  ===== *****