import csv

# Django Imports
from django.contrib import admin
from django.http import HttpResponse
from django.utils.translation import gettext_lazy as _

# Third-Party Library Imports
from rangefilter.filters import DateRangeFilter

# Django App Imports
from .models import (
    Review, ReviewImage
)


# Register your models here.


# ***** =====  Custom Admin Panel Code ===== *****
# ! Inline to associate ReviewImage with Review in the admin panel
class ReviewImageInline(admin.TabularInline):
    """Inline admin class for ReviewImage model."""
    model = ReviewImage
    extra = 1  # Number of empty forms to display by default
    readonly_fields = ('created_at', 'last_modified_at')
    fields = ('image', 'caption', 'is_active')
    can_delete = True
    show_change_link = True  # Allows link to edit the ReviewImage separately


# ! Custom Admin class for Review Model
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """Custom admin class for Review model."""

    list_display = (
        'id', 'product', 'user', 'title', 'rating', 'created_at', 
        'last_modified_at', 'is_active'
    )
    list_filter = (
        'is_active', 'rating', 
        ('created_at', DateRangeFilter),  # Date range filter for created_at
    )
    search_fields = (
        'title', 'product__name', 'user__username', 'body'
    )

    readonly_fields = ('created_at', 'last_modified_at')
    inlines = [ReviewImageInline]  # Register the inlines with ReviewAdmin

    fieldsets = (
        (None, {'fields': ('product', 'user', 'title', 'body', 'rating', 'is_active')}),
        ('Timestamps', {
            'fields': ('created_at', 'last_modified_at'),
        }),
    )

    def export_reviews_to_csv(self, request, queryset):
        """Export selected Review records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="reviews.csv"'

            writer = csv.writer(response)
            writer.writerow(['ID', 'Product', 'User', 'Title', 'Body', 'Rating', 
                                'Created At', 'Last Modified At', 'Is Active'])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.product.name if record.product else '',
                    record.user.username if record.user else '',
                    record.title,
                    record.body,
                    record.rating,
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_reviews_to_csv.short_description = "Export selected reviews to CSV"

    actions = ['export_reviews_to_csv']


# ! Custom Admin class for ReviewImage Model
@admin.register(ReviewImage)
class ReviewImageAdmin(admin.ModelAdmin):
    """Custom admin class for ReviewImage model."""

    list_display = (
        'id', 'review', 'caption', 'image', 'created_at', 
        'last_modified_at', 'is_active'
    )
    list_filter = (
        'is_active',
        ('created_at', DateRangeFilter),  # Date range filter for created_at
    )
    search_fields = (
        'caption', 'review__title', 'review__product__name'
    )

    readonly_fields = ('created_at', 'last_modified_at')

    fieldsets = (
        (None, {'fields': ('review', 'image', 'caption', 'is_active')}),
        ('Timestamps', {
            'fields': ('created_at', 'last_modified_at'),
        }),
    )

    def export_images_to_csv(self, request, queryset):
        """Export selected ReviewImage records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="review_images.csv"'

            writer = csv.writer(response)
            writer.writerow(['ID', 'Review', 'Caption', 'Image', 'Created At', 'Last Modified At', 'Is Active'])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.review.title if record.review else '',
                    record.caption,
                    record.image.url if record.image else '',
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_images_to_csv.short_description = "Export selected images to CSV"

    actions = ['export_images_to_csv']
# ***** =====  END  ===== *****