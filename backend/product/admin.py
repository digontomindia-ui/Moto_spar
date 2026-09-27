import csv

# Django Imports
from django.contrib import admin
from django.http import HttpResponse
from django.utils.translation import gettext_lazy as _

# Third-Party Library Imports
from rangefilter.filters import DateRangeFilter

# Django App Imports
from .models import (
    Category, SubCategory, Product, ProductVariant, ProductImage,
    ProductRequest, ProductRequestImage, JobType
)


# ! Custom Admin class for Category Model
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Custom admin class for Category model."""

    list_display = (
        'id', 'name', 'description', 'image', 'created_at', 'last_modified_at', 'is_active'
    )
    list_filter = (
        'is_active',
        ('created_at', DateRangeFilter),  # Enable date range filter for created_at
    )
    search_fields = (
        'name', 'description'
    )
    
    readonly_fields = ('created_at', 'last_modified_at')

    fieldsets = (
        (None, {'fields': ('name', 'description', 'image', 'is_active')}),
        (_('Default Fields'), {
            'fields': ('created_at', 'last_modified_at'),
        }),
    )

    def export_categories_to_csv(self, request, queryset):
        """Export selected Category records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="categories.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'Name', 'Description', 'Image', 'Created At', 'Last Modified At', 'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.name,
                    record.description,
                    record.image.url if record.image else '',
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_categories_to_csv.short_description = "Export selected categories to CSV"

    actions = ['export_categories_to_csv']


# ! Custom Admin class for SubCategory Model
@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    """Custom admin class for SubCategory model."""

    list_display = (
        'id', 'category', 'name', 'description', 'image', 'created_at', 'last_modified_at', 'is_active'
    )
    list_filter = (
        'category',
        'is_active',
        ('created_at', DateRangeFilter),  # Enable date range filter for created_at
    )
    search_fields = (
        'category__name', 'name', 'description'
    )
    
    readonly_fields = ('created_at', 'last_modified_at')

    fieldsets = (
        (None, {'fields': ('category', 'name', 'description', 'image', 'is_active')}),
        (_('Default Fields'), {
            'fields': ('created_at', 'last_modified_at'),
        }),
    )

    def export_subcategories_to_csv(self, request, queryset):
        """Export selected SubCategory records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="subcategories.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'Category', 'Name', 'Description', 'Image', 'Created At', 'Last Modified At', 'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.category.name,
                    record.name,
                    record.description,
                    record.image.url if record.image else '',
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_subcategories_to_csv.short_description = "Export selected subcategories to CSV"

    actions = ['export_subcategories_to_csv']


# ! Inline to associate images with product in admin panel
class ProductImageInline(admin.TabularInline):
    """Inline admin class for ProductImage model."""
    model = ProductImage
    extra = 1  # Number of empty forms to display by default
    readonly_fields = ('created_at', 'last_modified_at')
    fields = ('image', 'caption', 'is_active')
    can_delete = True
    show_change_link = True  # Allows link to edit the ProductImage separately


# ! Inline to associate variants with product in the admin panel
class ProductVariantInline(admin.TabularInline):
    """Inline admin class for ProductVariant model."""
    model = ProductVariant
    extra = 1  # Number of empty forms to display by default
    readonly_fields = ('created_at', 'last_modified_at', 'price_excluding_gst', 'cgst', 'sgst')
    fields = ('listing_price_for_vendor', 'cost_to_vendor', 'motospar_commission_from_vendor', 
                'markup_in_prices', 'final_listing_price_on_motospar', 'final_profit_per_part', 
                'discount', 'in_stock', 'sold_quantity', 'sku', 'color', 'size', 
                'weight', 'dimensions', 'material', 'is_active')
    can_delete = True
    show_change_link = True  # Allows link to edit the ProductVariant separately
    
    # Nested ProductImageInline within the ProductVariantInline
    inlines = [ProductImageInline]


# ! Custom Admin class for ProductImage Model
@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    """Custom admin class for ProductImage model."""

    list_display = (
        'id', 'variant', 'caption', 'image', 'created_at', 'last_modified_at', 'is_active'
    )
    list_filter = (
        'is_active',
        ('created_at', DateRangeFilter),  # Enable date range filter for created_at
    )
    search_fields = (
        'caption', 'variant__product__name'  # You may need to adjust this field depending on the related model
    )

    readonly_fields = ('created_at', 'last_modified_at')

    fieldsets = (
        (None, {'fields': ('variant', 'caption', 'image', 'is_active')}),
        (_('Default Fields'), {
            'fields': ('created_at', 'last_modified_at'),
        }),
    )

    def export_images_to_csv(self, request, queryset):
        """Export selected ProductImage records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="product_images.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'Variant', 'Caption', 'Image', 'Created At', 'Last Modified At', 'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.variant.product.name if record.variant else '',  # Adjust based on related model
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


# ! Custom Admin class for ProductVariant Model
@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    """Custom admin class for ProductVariant model."""

    list_display = (
        'id', 'product', 'listing_price_for_vendor', 'discount', 'in_stock', 'sold_quantity', 
        'sku', 'color', 'size', 'weight', 'dimensions', 'material', 
        'created_at', 'last_modified_at', 'is_active'
    )
    list_filter = (
        'in_stock', 'is_active',
        ('created_at', DateRangeFilter),  # Enable date range filter for created_at
    )
    search_fields = (
        'product__name', 'sku', 'color', 'size', 'material'
    )

    readonly_fields = ('created_at', 'last_modified_at', 'price_excluding_gst', 'cgst', 'sgst')

    fieldsets = (
        (None, {'fields': ('product', 'listing_price_for_vendor', 'cost_to_vendor', 
                            'motospar_commission_from_vendor', 'markup_in_prices', 
                            'final_listing_price_on_motospar', 'final_profit_per_part', 
                            'price_excluding_gst', 'cgst', 'sgst',
                            'discount', 'in_stock', 'sold_quantity', 'sku')}),
        (_('Attributes'), {
            'fields': ('color', 'size', 'weight', 'dimensions', 'material', 'features'),
        }),
        (_('Default Fields'), {
            'fields': ('created_at', 'last_modified_at', 'is_active'),
        }),
    )
    
    inlines = [ProductImageInline] 
    
    def export_variants_to_csv(self, request, queryset):
        """Export selected ProductVariant records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="product_variants.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'Product', 'Listing Price for Vendor', 'Cost to Vendor', 
                'Motospar Commission from Vendor', 'Markup in Prices', 
                'Final Listing Price on Motospar', 'Final Profit per Part', 
                'Discount', 'In Stock', 'Sold Quantity', 'SKU', 
                'Color', 'Size', 'Weight', 'Dimensions', 'Material', 
                'Created At', 'Last Modified At', 'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.product.name if record.product else '',
                    record.listing_price_for_vendor,
                    record.cost_to_vendor,
                    record.motospar_commission_from_vendor,
                    record.markup_in_prices,
                    record.final_listing_price_on_motospar,
                    record.final_profit_per_part,
                    record.discount if record.discount else '',
                    record.in_stock,
                    record.sold_quantity,
                    record.sku,
                    record.color,
                    record.size,
                    record.weight if record.weight else '',
                    record.dimensions,
                    record.material,
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_variants_to_csv.short_description = "Export selected variants to CSV"

    actions = ['export_variants_to_csv']


# ! Custom Admin class for Product Model
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Custom admin class for Product model."""
    
    list_display = (
        'id', 'name', 'code', 'category', 'sub_category', 'brand', 'model', 'year', 
        'rating', 'is_gst_applicable', 'gst_rate', 'delivery_charge', 'delivery_time', 'created_by', 'created_at', 'last_modified_at', 'is_active'
    )
    list_filter = (
        'is_active', 'category', 'sub_category', 'model', 'year', 'is_gst_applicable', 'gst_rate',
        ('created_at', DateRangeFilter),  # Enable date range filter for created_at
    )
    search_fields = (
        'name', 'code', 'description', 'brand', 'model'
    )
    
    readonly_fields = ('created_at', 'last_modified_at')
    
    fieldsets = (
        (None, {'fields': ('category', 'sub_category', 'job_type', 'name', 'code', 'description', 'brand', 'model', 'year', 'rating', 
                            'is_gst_applicable', 'gst_rate',
                            'delivery_charge', 'delivery_time', 'driver_fees', 'mechanic_fees', 'created_by', 'is_active')}),
        ('Timestamps', {
            'fields': ('created_at', 'last_modified_at'),
        }),
    )

    inlines = [ProductVariantInline]  # Register the inlines with ProductAdmin

    def export_products_to_csv(self, request, queryset):
        """Export selected Product records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="products.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'Name', 'Code', 'Category', 'Sub Category', 'Brand', 'Model', 'Year',
                'Rating', 'Delivery Charge', 'Delivery Time', 'Driver Fees', 'Mechanic Fees',
                'Created By', 'Created At', 'Last Modified At', 'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.name,
                    record.code,
                    record.category.name if record.category else '',
                    record.sub_category.name if record.sub_category else '',
                    record.brand,
                    record.model,
                    record.year,
                    record.rating,
                    record.delivery_charge,
                    record.delivery_time,
                    record.driver_fees,
                    record.mechanic_fees,
                    record.created_by.username if record.created_by else '',
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_products_to_csv.short_description = "Export selected products to CSV"

    actions = ['export_products_to_csv']


# ! Inline to associate images with product request in admin panel
class ProductRequestImageInline(admin.TabularInline):
    """Inline admin class for ProductRequestImage model."""
    model = ProductRequestImage
    extra = 1  # Number of empty forms to display by default
    readonly_fields = ('created_at', 'last_modified_at')
    fields = ('image', 'is_active')
    can_delete = True
    show_change_link = True  # Allows link to edit the ProductRequestImage separately


# ! Custom Admin class for ProductRequestImage Model
@admin.register(ProductRequestImage)
class ProductRequestImageAdmin(admin.ModelAdmin):
    """Custom admin class for ProductRequestImage model."""
    
    list_display = (
        'id', 'productrequest', 'image', 'created_at', 'last_modified_at', 'is_active'
    )
    list_filter = (
        'is_active',
        ('created_at', DateRangeFilter),  # Enable date range filter for created_at
    )
    readonly_fields = ('created_at', 'last_modified_at')

    fieldsets = (
        (None, {'fields': ('productrequest', 'image', 'is_active')}),
        (_('Default Fields'), {
            'fields': ('created_at', 'last_modified_at'),
        }),
    )

    def export_request_images_to_csv(self, request, queryset):
        """Export selected ProductRequestImage records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="product_request_images.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'Product Request', 'Image', 'Created At', 'Last Modified At', 'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.productrequest.id if record.productrequest else '',  # Adjust based on related model
                    record.image.url if record.image else '',
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_request_images_to_csv.short_description = "Export selected request images to CSV"

    actions = ['export_request_images_to_csv']


# ! Custom Admin class for ProductRequest Model
@admin.register(ProductRequest)
class ProductRequestAdmin(admin.ModelAdmin):
    """Custom admin class for ProductRequest model."""
    
    list_display = (
        'id', 'vendor', 'category', 'sub_category', 'name', 'status',
        'requested_at', 'created_at', 'last_modified_at', 'is_active'
    )
    list_filter = (
        'status', 'is_active', 'category', 'sub_category',
        ('requested_at', DateRangeFilter),  # Enable date range filter for requested_at
    )
    search_fields = (
        'name', 'vendor__username', 'description'
    )

    readonly_fields = ('created_at', 'last_modified_at')

    fieldsets = (
        (None, {'fields': ('vendor', 'category', 'sub_category', 'name', 'description', 'status')}),
        (_('Pricing & Variants'), {
            'fields': ('brand', 'model', 'year', 'price', 'discount', 'color', 'size', 
                        'weight', 'dimensions', 'material', 'features'),
        }),
        (_('Default Fields'), {
            'fields': ('created_at', 'last_modified_at', 'is_active'),
        }),
    )

    inlines = [ProductRequestImageInline]  # Register the inlines with ProductRequestAdmin

    def export_requests_to_csv(self, request, queryset):
        """Export selected ProductRequest records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="product_requests.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'Vendor', 'Category', 'Sub Category', 'Name', 'Description',
                'Requested At', 'Status', 'Brand', 'Model', 'Year', 'Price',
                'Discount', 'Color', 'Size', 'Weight', 'Dimensions', 'Material',
                'Features', 'Created At', 'Last Modified At', 'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.vendor.username if record.vendor else '',
                    record.category.name if record.category else '',
                    record.sub_category.name if record.sub_category else '',
                    record.name,
                    record.description,
                    record.requested_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.status,
                    record.brand,
                    record.model,
                    record.year,
                    record.price,
                    record.discount if record.discount is not None else '',
                    record.color,
                    record.size,
                    record.weight if record.weight is not None else '',
                    record.dimensions,
                    record.material,
                    record.features,
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_requests_to_csv.short_description = "Export selected requests to CSV"

    actions = ['export_requests_to_csv']  # Add the export action to the admin


# ! Custom Admin class for JobType Model
@admin.register(JobType)
class JobTypeAdmin(admin.ModelAdmin):
    """Custom admin class for JobType model."""
    
    list_display = (
        'id', 'description', 'average_duration', 'job_cost', 
        'personnel_required', 'created_at', 'last_modified_at', 'is_active'
    )
    list_filter = (
        'is_active',
        ('created_at', DateRangeFilter),  # Enable date range filter for created_at
        ('last_modified_at', DateRangeFilter),  # Enable date range filter for last_modified_at
    )
    search_fields = (
        'description',  # Allow searching by job description
    )

    readonly_fields = ('id', 'created_at', 'last_modified_at')

    fieldsets = (
        (None, {
            'fields': ('description', 'average_duration', 'job_cost', 'personnel_required')
        }),
        (_('Default Fields'), {
            'fields': ('id', 'created_at', 'last_modified_at', 'is_active'),
        }),
    )

    def export_job_types_to_csv(self, request, queryset):
        """Export selected JobType records to CSV."""
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="job_types.csv"'

            writer = csv.writer(response)
            writer.writerow([
                'ID', 'Description', 'Average Duration', 'Job Cost', 
                'Personnel Required', 'Created At', 'Last Modified At', 'Is Active'
            ])

            for record in queryset:
                writer.writerow([
                    record.id,
                    record.description,
                    str(record.average_duration),  # Convert DurationField to string
                    record.job_cost,
                    record.personnel_required,
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.last_modified_at.strftime('%Y-%m-%d %H:%M:%S'),
                    record.is_active,
                ])

            return response
        except Exception as e:
            self.message_user(request, f"Error during CSV export: {str(e)}", level='error')

    export_job_types_to_csv.short_description = "Export selected job types to CSV"

    actions = ['export_job_types_to_csv']  # Add the export action to the admin