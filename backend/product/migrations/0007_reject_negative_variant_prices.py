from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import migrations, models
from django.db.models import Q


def quarantine_negative_priced_variants(apps, schema_editor):
    ProductVariant = apps.get_model('product', 'ProductVariant')
    Product = apps.get_model('product', 'Product')
    CartItem = apps.get_model('cart', 'CartItem')

    invalid_variants = ProductVariant.objects.filter(
        is_active=True,
    ).filter(
        Q(final_listing_price_on_motospar__lt=0)
        | Q(discount__lt=0)
        | Q(discount__gt=100)
    )
    invalid_variant_ids = list(invalid_variants.values_list('pk', flat=True))

    invalid_products = Product.objects.filter(is_active=True).filter(
        Q(delivery_charge__lt=0)
        | Q(driver_fees__lt=0)
        | Q(mechanic_fees__lt=0)
    )
    invalid_product_ids = list(invalid_products.values_list('pk', flat=True))
    invalid_variants_for_fees = list(
        ProductVariant.objects.filter(product_id__in=invalid_product_ids).values_list('pk', flat=True)
    )

    # Preserve source values for admin correction while blocking purchases.
    invalid_variants.update(is_active=False)
    invalid_products.update(is_active=False)
    ProductVariant.objects.filter(product_id__in=invalid_product_ids).update(is_active=False)
    CartItem.objects.filter(
        variant_id__in=invalid_variant_ids + invalid_variants_for_fees,
        is_active=True,
    ).update(is_active=False)


class Migration(migrations.Migration):
    dependencies = [
        ('product', '0006_productrequestimage_s3_storage'),
        ('cart', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(
            quarantine_negative_priced_variants,
            reverse_code=migrations.RunPython.noop,
        ),
        migrations.AlterField(
            model_name='productvariant',
            name='listing_price_for_vendor',
            field=models.DecimalField(
                decimal_places=2,
                default=0.0,
                max_digits=10,
                validators=[MinValueValidator(0)],
            ),
        ),
        migrations.AlterField(
            model_name='productvariant',
            name='cost_to_vendor',
            field=models.DecimalField(
                decimal_places=2,
                default=0.0,
                max_digits=10,
                validators=[MinValueValidator(0)],
            ),
        ),
        migrations.AlterField(
            model_name='productvariant',
            name='motospar_commission_from_vendor',
            field=models.DecimalField(
                decimal_places=2,
                default=0.0,
                max_digits=10,
                validators=[MinValueValidator(0)],
            ),
        ),
        migrations.AlterField(
            model_name='productvariant',
            name='markup_in_prices',
            field=models.DecimalField(
                decimal_places=2,
                default=0.0,
                max_digits=10,
                validators=[MinValueValidator(0)],
            ),
        ),
        migrations.AlterField(
            model_name='productvariant',
            name='final_listing_price_on_motospar',
            field=models.DecimalField(
                decimal_places=2,
                default=0.0,
                max_digits=10,
                validators=[MinValueValidator(0)],
            ),
        ),
        migrations.AlterField(
            model_name='productvariant',
            name='discount',
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                max_digits=5,
                null=True,
                validators=[MinValueValidator(0), MaxValueValidator(100)],
            ),
        ),
        migrations.AlterField(
            model_name='product',
            name='delivery_charge',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=10, validators=[MinValueValidator(0)]),
        ),
        migrations.AlterField(
            model_name='product',
            name='driver_fees',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=10, validators=[MinValueValidator(0)]),
        ),
        migrations.AlterField(
            model_name='product',
            name='mechanic_fees',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=10, validators=[MinValueValidator(0)]),
        ),
        migrations.AddConstraint(
            model_name='productvariant',
            constraint=models.CheckConstraint(
                check=Q(is_active=False) | Q(final_listing_price_on_motospar__gte=0),
                name='product_variant_active_price_nonnegative',
            ),
        ),
        migrations.AddConstraint(
            model_name='productvariant',
            constraint=models.CheckConstraint(
                check=(
                    Q(is_active=False)
                    | Q(discount__isnull=True)
                    | (Q(discount__gte=0) & Q(discount__lte=100))
                ),
                name='product_variant_active_discount_valid',
            ),
        ),
        migrations.AddConstraint(
            model_name='product',
            constraint=models.CheckConstraint(
                check=(
                    Q(is_active=False)
                    | (
                        Q(delivery_charge__gte=0)
                        & Q(driver_fees__gte=0)
                        & Q(mechanic_fees__gte=0)
                    )
                ),
                name='product_active_charges_nonnegative',
            ),
        ),
    ]
