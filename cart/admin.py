# Python Standard Library Imports
import csv

# Django Imports
from django.contrib import admin
from django.http import HttpResponse
from django.utils.translation import gettext_lazy as _

# Third-Party Library Imports
from rangefilter.filters import DateRangeFilter

# Django App Imports
from .models import Cart, CartItem


# ***** =====  Custom Admin Panel Code ===== *****
# ! Custom Admin class for Cart Model
@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    """Custom admin class for Cart model."""

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

    def export_cart_to_csv(self, request, queryset):
        """Export selected Cart records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="carts.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'User Email', 'Created At', 
                'Last Modified At', 'Is Active'
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

    export_cart_to_csv.short_description = "Export selected Carts to CSV"

    actions = ['export_cart_to_csv']


# ! Custom Admin class for CartItem Model
@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    """Custom admin class for CartItem model."""

    list_display = (
        'id', 'cart', 'variant', 'quantity', 'price_at_addition', 'total_price', 'created_at', 'last_modified_at', 'is_active'
    )
    list_filter = (
        'cart',
        'variant',
        'is_active',
        ('created_at', DateRangeFilter),  # Enable date range filter for created_at
    )
    search_fields = (
        'cart__user__email', 'variant__product__name', 'quantity', 'price_at_addition'
    )

    readonly_fields = ('created_at', 'last_modified_at', 'total_price')

    fieldsets = (
        (None, {'fields': ('cart', 'variant', 'quantity', 'price_at_addition', 'delivery_charge', 'driver_fees', 'mechanic_fees',)}),
        ('Default Fields', {
            'fields': ('created_at', 'last_modified_at', 'is_active'),
        }),
    )

    def export_cartitem_to_csv(self, request, queryset):
        """Export selected CartItem records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="cart_items.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'Cart ID', 'Product Name', 'Quantity', 'Price at Addition', 'Total Price', 
                'Delivery Charge', 'Driver Fees', 'Mechanic Fees', 'Created At', 'Last Modified At', 'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.cart.id,
                    record.variant.product.name,
                    record.quantity,
                    record.price_at_addition,
                    record.total_price(),
                    record.delivery_charge,
                    record.driver_fees,
                    record.mechanic_fees,
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_cartitem_to_csv.short_description = "Export selected Cart Items to CSV"

    actions = ['export_cartitem_to_csv']
# ***** =====  END  ===== *****