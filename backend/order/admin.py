# Python Standard Library Imports
import csv

# Django Imports
from django.contrib import admin
from django.http import HttpResponse
from django.utils.translation import gettext_lazy as _

# Third-Party Library Imports
from rangefilter.filters import DateRangeFilter

# Django App Imports
from .models import Order, OrderItem


# Register your models here.


# ***** =====  Custom Admin Panel Code ===== *****
# ! Inline class for OrderItem to be displayed within OrderAdmin
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0  # Set to 0 to avoid displaying extra blank forms
    readonly_fields = ('created_at', 'last_modified_at', 'total_price')
    fields = (
        'variant', 'quantity', 'price', 'item_total_price', 'payment_status', 'mechanic_fees_for_customer', 'mechanic_fees_for_mechanic',
        'installation_required', 'vendor_selling_price', 'vendor_payment_status', 'assigned_vendor', 'order_status'
    )


# ! Custom Admin class for Order Model
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Custom admin class for Order model."""

    list_display = (
        'id', 'customer', 'shipping_address', 'billing_address', 'order_code', 
        'total_price', 'payment_method', 'payment_status', 
        'is_successful', 'created_at', 'last_modified_at', 'is_active'
    )
    list_filter = (
        'is_active',
        'payment_status',
        'payment_method',
        ('created_at', DateRangeFilter),  # Enable date range filter for created_at
    )
    search_fields = (
        'customer__email',
        'customer__first_name',
        'customer__last_name',
        'order_code'
    )

    readonly_fields = ('order_code', 'created_at', 'last_modified_at')

    fieldsets = (
        (None, {'fields': ('customer', 'shipping_address', 'billing_address', 'total_price', 'delivery_charge', 
                            'driver_fees', 'driver_details', 'driver_otp', 'payment_method', 'payment_status', 'provider_order_id', 
                            'payment_id', 'signature_id', 'is_successful')}),
        ('Default Fields', {
            'fields': ('created_at', 'last_modified_at', 'is_active'),
        }),
    )

    inlines = [OrderItemInline]  # Add OrderItem inline

    def export_orders_to_csv(self, request, queryset):
        """Export selected Order records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="orders.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'Customer Email', 'Order Code', 'Shipping Address', 'Billing Address', 
                'Total Price', 'Delivery Charge', 'Driver Fees', 'Driver Details', 'Driver OTP',
                'Payment Method', 'Payment Status', 
                'Is Successful', 'Created At', 'Last Modified At', 'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.customer.email,
                    record.order_code,
                    str(record.shipping_address),  # Customize as needed
                    str(record.billing_address),    # Customize as needed
                    record.total_price,
                    record.delivery_charge,
                    record.driver_fees,
                    record.driver_details,
                    record.driver_otp,
                    record.payment_method,
                    record.payment_status,
                    record.is_successful,
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_orders_to_csv.short_description = "Export selected Orders to CSV"

    actions = ['export_orders_to_csv']


# ! Custom Admin class for OrderItem Model
@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    """Custom admin class for OrderItem model."""

    list_display = (
        'id', 'order', 'variant', 'quantity', 'price', 
        'item_total_price', 'payment_status', 'vendor_selling_price', 
        'vendor_payment_status', 'assigned_vendor', 'order_status', 
        'total_price', 'created_at', 'last_modified_at', 'is_active'
    )
    list_filter = (
        'order',
        'variant',
        'assigned_vendor',
        'order_status',
        'is_active',
        ('created_at', DateRangeFilter),  # Enable date range filter for created_at
    )
    search_fields = (
        'order__customer__email', 
        'variant__product__name', 
        'quantity', 
        'price',
        'order_status'
    )

    readonly_fields = ('created_at', 'last_modified_at', 'total_price')

    fieldsets = (
        (None, {
            'fields': ('order', 'variant', 'quantity', 'price',)
        }),
        ('Vendor Details', {
            'fields': ('assigned_vendor', 'vendor_selling_price', 
                        'vendor_payment_status',
                        )
        }),
        ('Mechanic Details', {
            'fields': ('mechanic', 'mechanic_fees_for_customer', 
                        'mechanic_fees_for_mechanic', 'mechanic_otp',
                        'installation_required',
                        )
        }),                
        ('Order Details', {
            'fields': ('order_status', 'item_total_price', 'payment_status', 
                        )
        }),
        ('Default Fields', {

            'fields': ('created_at', 'last_modified_at', 'is_active'),
        }),
    )

    def export_order_items_to_csv(self, request, queryset):
        """Export selected OrderItem records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="order_items.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'Order ID', 'Product Name', 'Quantity', 'Price', 
                'Assigned Vendor', 'Order Status',
                'Item Total Price', 'Payment Status', 
                'Mechanic ID', 'Installation Required',
                'Vendor Selling Price', 'Vendor Payment Status',  
                'Created At', 'Last Modified At', 'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.order.id,
                    record.variant.product.name,
                    record.quantity,
                    record.price,
                    str(record.assigned_vendor) if record.assigned_vendor else 'N/A',
                    record.order_status,                    
                    record.item_total_price,
                    record.payment_status,
                    str(record.mechanic) if record.mechanic else 'N/A',
                    'Yes' if record.installation_required else 'No',
                    record.vendor_selling_price,
                    'Paid' if record.vendor_payment_status else 'Unpaid',

                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_order_items_to_csv.short_description = "Export selected Order Items to CSV"

    actions = ['export_order_items_to_csv']
# ***** =====  END  ===== *****