"""Customer-facing price validation shared by catalog, cart, and checkout."""

from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from django.db.models import DecimalField, ExpressionWrapper, F, Q, Sum, Value
from django.db.models.functions import Coalesce


def nonnegative_product_charges(product):
    """Return whether every configured customer charge has a valid amount."""
    try:
        return all(
            Decimal(str(getattr(product, field))) >= 0
            for field in ('delivery_charge', 'driver_fees', 'mechanic_fees')
        )
    except (InvalidOperation, TypeError, ValueError):
        return False


def customer_sale_price(variant):
    """Return a Decimal price, or None for an offer requiring admin correction."""
    try:
        listing = Decimal(str(variant.final_listing_price_on_motospar))
        discount = Decimal(str(variant.discount or 0))
    except (InvalidOperation, TypeError, ValueError):
        return None
    if (
        not listing.is_finite()
        or not discount.is_finite()
        or listing < 0
        or discount < 0
        or discount > 100
        or not nonnegative_product_charges(variant.product)
    ):
        return None
    return (listing * (Decimal('100') - discount) / Decimal('100')).quantize(
        Decimal('0.01'), rounding=ROUND_HALF_UP
    )


def available_stock_for_variant(variant):
    """Return live vendor stock, matching the count shown in product details."""
    from vendor.models import VendorStock

    return VendorStock.objects.filter(
        variant=variant,
        in_stock=True,
        is_active=True,
    ).aggregate(total=Sum('stock_quantity'))['total'] or 0


def valid_customer_variant_queryset():
    """Keep catalog filtering aligned with the price used by checkout."""
    from product.models import ProductVariant

    decimal_field = DecimalField(max_digits=12, decimal_places=2)
    discount = Coalesce(F('discount'), Value(Decimal('0'), output_field=decimal_field))
    sale_price = ExpressionWrapper(
        F('final_listing_price_on_motospar')
        * (Value(Decimal('100'), output_field=decimal_field) - discount)
        / Value(Decimal('100'), output_field=decimal_field),
        output_field=decimal_field,
    )
    return ProductVariant.objects.filter(
        is_active=True,
        final_listing_price_on_motospar__gte=0,
    ).filter(
        Q(discount__isnull=True) | Q(discount__gte=0, discount__lte=100)
    ).annotate(customer_price=sale_price)
