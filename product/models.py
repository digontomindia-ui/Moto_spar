# Standard Library Imports
import uuid
import re
from datetime import datetime

# Django Imports
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.utils.translation import gettext as _
from django.core.exceptions import ValidationError

# Local and Other module imports
from app.models import User


# Create your models here.


# ***** =====  Tables for JobType  ===== *****
# ? JobType Model to manage different types of mechanic jobs
# ! As per client's request, this model is used to define various job types that mechanics can perform.
class JobType(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    description = models.TextField(help_text="Description of the job type")
    average_duration = models.DurationField(help_text="Average duration to complete the job")
    job_cost = models.DecimalField(max_digits=10, decimal_places=2, help_text="Standard cost for the job type")
    personnel_required = models.PositiveIntegerField(help_text="Number of personnel required for the job")
    
    # Default fields
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Job Type"
        verbose_name_plural = "Job Types"

    def __str__(self):
        return f"{self.description} - ${self.job_cost}"

    def clean(self):
        if self.job_cost < 0:
            raise ValidationError("Job cost cannot be negative.")
        if self.personnel_required < 1:
            raise ValidationError("At least one personnel is required for the job.")
        if self.average_duration.total_seconds() <= 0:
            raise ValidationError("Average duration must be positive.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
# ***** =====  END  ===== *****


# The Product model will be created and managed by the Admin. 
# Vendors will not create products but will have a separate model 
# for managing the products they have in stock.
# ***** =====  Tables for Product Related Data  ===== *****
class Category(models.Model):
    # -------------------------------
    # Primary Identification
    # -------------------------------    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    # image = models.FileField(upload_to='category_images', blank=True, null=True)
    image = models.CharField(max_length=512, blank=True, null=True)

    # -------------------------------
    # Default Fields
    # -------------------------------
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)  # add is_active field

    # -------------------------------
    # Instance Methods
    # -------------------------------
    def __str__(self):
        return self.name
    
    # ? Override the save method to save the name in lowercase
    # ? So that no error occur due to case sensitivity
    def save(self, *args, **kwargs):
        if self.name:
            # Replace special characters with spaces and convert to lowercase
            self.name = re.sub(r'[^a-zA-Z0-9\s]', ' ', self.name).lower()
            # Replace multiple spaces with a single space and strip leading/trailing spaces
            self.name = re.sub(r'\s+', ' ', self.name).strip()
        super().save(*args, **kwargs)

    # * For soft delete
    def soft_delete(self, *args, **kwargs):
        self.is_active = False  # set is_active field to False
        self.save()
    
    # * For Hard delete
    def hard_delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)


class SubCategory(models.Model):
    # -------------------------------
    # Primary Identification
    # -------------------------------       
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='subcategories')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    # image = models.FileField(upload_to='subcategory_images', blank=True, null=True)
    image = models.CharField(max_length=512, blank=True, null=True)
    
    # -------------------------------
    # Default Fields
    # -------------------------------
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)  # add is_active field

    class Meta:
        unique_together = ('category', 'name')

    # -------------------------------
    # Instance Methods
    # -------------------------------
    def __str__(self):
        return f"{self.category.name} - {self.name}"
    
    # ? Override the save method to save the name in lowercase
    # ? So that no error occur due to case sensitivity
    def save(self, *args, **kwargs):
        if self.name:
            # Replace special characters with spaces and convert to lowercase
            self.name = re.sub(r'[^a-zA-Z0-9\s]', ' ', self.name).lower()
            # Replace multiple spaces with a single space and strip leading/trailing spaces
            self.name = re.sub(r'\s+', ' ', self.name).strip()
        super().save(*args, **kwargs)
    
    # * For soft delete
    def soft_delete(self, *args, **kwargs):
        self.is_active = False  # set is_active field to False
        self.save()
    
    # * For Hard delete
    def hard_delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)


class Product(models.Model):
    # -------------------------------
    # Primary Identification
    # -------------------------------    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, null=True, related_name='category', db_index=True)
    sub_category = models.ForeignKey(SubCategory, on_delete=models.PROTECT, null=True, related_name='subcategory')
    job_type = models.ForeignKey(JobType, on_delete=models.PROTECT, null=True, blank=True, related_name='products', help_text="Associated mechanic job type")
    
    # -------------------------------
    # Product Details
    # -------------------------------
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=16, unique=True)  # Unique code for the product, auto-generated
    description = models.TextField()
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    brand = models.CharField(max_length=255, blank=True)
    model = models.CharField(max_length=255, blank=True)
    year = models.CharField(max_length=255, blank=True)

    # -------------------------------
    # Tax Fields
    # -------------------------------
    GST_CHOICES = (
        (5, '5%'),
        (18, '18%'),
        (28, '28%'),
    )

    # -------------------------------
    # Delivery Fields
    # -------------------------------    
    is_gst_applicable = models.BooleanField(default=True, help_text="If True, GST will be calculated from the inclusive price.")
    gst_rate = models.PositiveIntegerField(choices=GST_CHOICES, default=18, help_text="GST Rate applicable to this product")
    delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    delivery_time = models.IntegerField(default=7)  # in days
    driver_fees = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    mechanic_fees = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)

    # -------------------------------
    # Default Fields
    # -------------------------------
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)  # add is_active field

    class Meta:
        ordering = ['-created_at']  # Order products by creation date by default

    # -------------------------------
    # Instance Methods
    # -------------------------------
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        self.name = self.name.lower()  # Ensures name is always stored in lowercase

        # * Generate a code if not already set
        if not self.code:
            last_product = Product.objects.order_by('-code').first()
            if last_product and last_product.code.isdigit():
                new_code = str(int(last_product.code) + 1).zfill(6)
            else:
                new_code = '000001'  # Start from 000001 if no code exists
            self.code = new_code
        super(Product, self).save(*args, **kwargs)

    # * For soft delete
    def soft_delete(self, *args, **kwargs):
        self.is_active = False  # set is_active field to False
        self.save()
        
        # Soft delete associated variants
        self.variants.update(is_active=False)

    # * For Hard delete
    def hard_delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)


class ProductVariant(models.Model):
    # -------------------------------
    # Primary Identification
    # -------------------------------      
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    # price = models.DecimalField(max_digits=10, decimal_places=2)

    # -------------------------------
    # Price Fields
    # -------------------------------
    listing_price_for_vendor = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    cost_to_vendor = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    motospar_commission_from_vendor = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    markup_in_prices = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    final_listing_price_on_motospar = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    final_profit_per_part = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    
    # Tax Breakdown Fields (Calculated)
    price_excluding_gst = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, editable=False)
    cgst = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, editable=False)
    sgst = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, editable=False)

    discount = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True,
                                    validators=[MinValueValidator(1), MaxValueValidator(100)])
    # -------------------------------
    # Stock Fields
    # -------------------------------
    quantity = models.PositiveIntegerField(default=0)
    in_stock = models.BooleanField(default=True)
    sold_quantity = models.PositiveIntegerField(default=0)
    sku = models.CharField(max_length=16, unique=True)  # ? Stock Keeping Unit

    # -------------------------------
    # Product Details
    # -------------------------------
    color = models.CharField(max_length=255, blank=True)
    size = models.CharField(max_length=255, blank=True)
    weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    dimensions = models.CharField(max_length=255, blank=True)
    material = models.CharField(max_length=255, blank=True)
    features = models.TextField(blank=True)

    # -------------------------------
    # Default Fields
    # -------------------------------
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['product', 'color', 'size'], name='unique_product_variant')
        ]
        
    def save(self, *args, **kwargs):
        # Calculate GST components from the final listing price (inclusive of GST)
        if self.final_listing_price_on_motospar is not None:
            # Check if GST is applicable on the parent product
            if self.product.is_gst_applicable:
                # Get GST rate from parent product
                rate = self.product.gst_rate
                
                # Convert decimal fields to float for calculation if needed, but Decimal is better for currency
                # Applying formula: Price_Ex_GST = Price_Inc_GST / (1 + Rate/100)
                
                from decimal import Decimal
                dst_rate_decimal = Decimal(str(rate)) / Decimal(100)
                
                # Cast the price to Decimal in case it's a float before save
                final_listing_price = Decimal(str(self.final_listing_price_on_motospar))
                
                # Base Price
                base_price = final_listing_price / (Decimal(1) + dst_rate_decimal)
                self.price_excluding_gst = round(base_price, 2)
                
                # Total Tax Amount
                total_tax = final_listing_price - self.price_excluding_gst
                
                # CGST & SGST (Split 50-50)
                self.cgst = round(total_tax / Decimal(2), 2)
                self.sgst = round(total_tax / Decimal(2), 2)
            else:
                # If GST is not applicable, base price is the full price, and tax components are 0
                self.price_excluding_gst = self.final_listing_price_on_motospar
                self.cgst = 0
                self.sgst = 0
            
        super(ProductVariant, self).save(*args, **kwargs)

    # -------------------------------
    # Instance Methods
    # -------------------------------
    def __str__(self):
        return f"Variant of {self.product.name}"

    # * For soft delete
    def soft_delete(self, *args, **kwargs):
        # Delete all associated variants, which will set their is_active field to False
        for variant in self.variants.all():
            variant.soft_delete()  # This will call the variant's delete method

        # Set the product's is_active to False instead of deleting it
        self.is_active = False
        self.save()

    # * For Hard delete
    def hard_delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)


class ProductImage(models.Model):
    # -------------------------------
    # Primary Identification
    # -------------------------------      
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='images')  # variant-specific image
    # image = models.ImageField(upload_to='product_images/')
    image = models.CharField(max_length=512, blank=True, null=True)
    caption = models.CharField(max_length=255, blank=True)  # Optional field for caption

    # -------------------------------
    # Default Fields
    # -------------------------------
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)  # add is_active field

    # -------------------------------
    # Instance Methods
    # -------------------------------
    def __str__(self):
        return f"Image for {self.variant.product.name}"
    
    # * For soft delete
    def soft_delete(self, *args, **kwargs):
        self.is_active = False  # set is_active field to False
        self.save()
    
    # * For Hard delete
    def hard_delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
# ***** =====  END  ===== *****


# ***** =====  Tables for add and managing product request  ===== *****
# Vendor will request new product to admin 
# for adding into the platform
class ProductRequest(models.Model):
    # -------------------------------
    # Choices
    # -------------------------------
    STATUS_CHOICES = (
        ('pending', 'pending'),
        ('approved', 'approved'),
        ('rejected', 'rejected'),
    ) 

    # -------------------------------
    # Primary Identification
    # -------------------------------       
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vendor = models.ForeignKey(User, on_delete=models.PROTECT)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, null=True, related_name='request_category', db_index=True)
    sub_category = models.ForeignKey(SubCategory, on_delete=models.PROTECT, null=True, related_name='request_subcategory')
    
    # -------------------------------
    # Product Details
    # -------------------------------
    name = models.CharField(max_length=255)
    description = models.TextField()
    requested_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # -------------------------------
    # Extra Fields
    # -------------------------------
    brand = models.CharField(max_length=255, blank=True)
    model = models.CharField(max_length=255, blank=True)
    year = models.CharField(max_length=255, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True,
                                    validators=[MinValueValidator(1), MaxValueValidator(100)])

    # -------------------------------
    # Variant-specific attributes
    # -------------------------------
    color = models.CharField(max_length=255, blank=True)
    size = models.CharField(max_length=255, blank=True)
    weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    dimensions = models.CharField(max_length=255, blank=True)
    material = models.CharField(max_length=255, blank=True)
    features = models.TextField(blank=True)

    # -------------------------------
    # Default Fields
    # -------------------------------
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)  # add is_active field

    class Meta:
        ordering = ['-created_at']  # Order products by creation date by default

    # -------------------------------
    # Instance Methods
    # -------------------------------
    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.name = self.name.lower()  # Ensures name is always stored in lowercase
        super(ProductRequest, self).save(*args, **kwargs)

    # * For soft delete
    def soft_delete(self, *args, **kwargs):
        self.is_active = False  # set is_active field to False
        self.save()
    
    # * For Hard delete
    def hard_delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)


class ProductRequestImage(models.Model):
    # -------------------------------
    # Primary Identification
    # -------------------------------     
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    productrequest = models.ForeignKey(ProductRequest, on_delete=models.CASCADE, related_name='images')  # variant-specific image
    image = models.ImageField(upload_to='product_request_images/')

    # -------------------------------
    # Default Fields
    # -------------------------------
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)  # add is_active field

    # -------------------------------
    # Instance Methods
    # -------------------------------
    def __str__(self):
        return f"Image for {self.productrequest.name}"
    
    # * For soft delete
    def soft_delete(self, *args, **kwargs):
        self.is_active = False  # set is_active field to False
        self.save()
    
    # * For Hard delete
    def hard_delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
# ***** =====  END  ===== *****
