# Python Standard Library Imports
import csv

# Django Imports
from django.contrib import admin
from django.http import HttpResponse
from django.utils.translation import gettext_lazy as _

# Third-Party Library Imports
from rangefilter.filters import DateRangeFilter

# Django App Imports
from .models import Notification


# Register your models here.


# ***** =====  Custom Admin Panel Code for Notification Model ===== *****
# ! Custom Admin class for Notification Model
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Custom admin class for Notification model."""
    
    list_display = (
        'id', 'notification_type', 'message', 'status',
        'user', 'created_at', 'last_modified_at', 'is_active'
    )
    list_filter = (
        'notification_type', 'is_active',
        ('created_at', DateRangeFilter),  # Enable date range filter for created_at
    )
    search_fields = (
        'message', 'user__email', 'user__first_name', 'user__last_name', 'status'
    )
    
    readonly_fields = ('created_at', 'last_modified_at')

    fieldsets = (
        (None, {
            'fields': ('user', 'notification_type', 'message'),
        }),
        ('Additional Details', {
            'fields': ('status', 'redirect_url', 'priority', 'is_urgent', 'extra_data'),
        }),
        ('Default Fields', {
            'fields': ('created_at', 'last_modified_at', 'is_active'),
        }),
    )

    def export_notifications_to_csv(self, request, queryset):
        """Export selected Notification records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="notifications.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'User', 'Notification Type', 'Message', 'Status', 
                'Redirect URL', 'Priority', 'Is Urgent', 'Extra Data', 
                'Created At', 'Last Modified At', 'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.user.get_full_name(),  # Assuming User model has a `get_full_name()` method
                    record.notification_type,
                    record.message,
                    record.status,
                    record.redirect_url if record.redirect_url else '',
                    record.priority,
                    record.is_urgent,
                    record.extra_data,
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_notifications_to_csv.short_description = "Export selected Notifications to CSV"
    
    actions = ['export_notifications_to_csv']  # Register the export action
# ***** =====  END  ===== *****