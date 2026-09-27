# Python Standard Library Imports
import csv

# Django Imports
from django.contrib import admin
from django.http import HttpResponse
from django.utils.translation import gettext_lazy as _

# Third-Party Library Imports
from rangefilter.filters import DateRangeFilter

# Django App Imports
from .models import Wishlist, WishlistItem


# ***** =====  Custom Admin Panel Code ===== *****
# ! Custom Admin class for Wishlist Model
@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    """Custom admin class for Wishlist model."""

    list_display = (
        'id', 'user', 'created_at', 'last_modified_at', 'is_active'
    )
    list_filter = (
        'is_active', 
        ('created_at', DateRangeFilter),  # Enable date range filter for created_at
    )
    search_fields = (
        'user__email',
    )

    readonly_fields = ('created_at', 'last_modified_at')

    fieldsets = (
        (None, {'fields': ('user',)}),
        ('Default Fields', {
            'fields': ('created_at', 'last_modified_at', 'is_active'),
        }),
    )

    def export_wishlist_to_csv(self, request, queryset):
        """Export selected Wishlist records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="wishlist.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'User Email', 'Created At', 'Last Modified At', 'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.user.email,
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_wishlist_to_csv.short_description = "Export selected Wishlist records to CSV"

    actions = ['export_wishlist_to_csv']


# ! Custom Admin class for WishlistItem Model
@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    """Custom admin class for WishlistItem model."""

    list_display = (
        'id', 'wishlist', 'variant', 'created_at', 'last_modified_at', 'is_active'
    )
    list_filter = (
        'is_active', 
        ('created_at', DateRangeFilter),  # Enable date range filter for created_at
    )
    search_fields = (
        'wishlist__user__email', 'variant__product__name',
    )

    readonly_fields = ('created_at', 'last_modified_at')

    fieldsets = (
        (None, {'fields': ('wishlist', 'variant')}),
        ('Default Fields', {
            'fields': ('created_at', 'last_modified_at', 'is_active'),
        }),
    )

    def export_wishlist_item_to_csv(self, request, queryset):
        """Export selected WishlistItem records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="wishlist_items.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'Wishlist Owner Email', 'Product Name', 'Created At', 
                'Last Modified At', 'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.wishlist.user.email,
                    record.variant.product.name,
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_wishlist_item_to_csv.short_description = "Export selected Wishlist Items to CSV"

    actions = ['export_wishlist_item_to_csv']
# ***** =====  END  ===== *****