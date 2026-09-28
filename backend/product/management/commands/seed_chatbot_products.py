from django.core.management.base import BaseCommand
from django.db import transaction

from app.models import User
from product.models import (
    Category, Product, ProductCompatibility, ProductImage, ProductVariant,
    SubCategory,
)


class Command(BaseCommand):
    help = 'Create or update 100 fitment-safe demo car parts: 25 each for Hyundai, BMW, Honda, and Mercedes.'

    # These are demo aftermarket catalog entries, not claims of OEM supply. Each
    # generated product is tied to one specific vehicle range so chatbot fitment
    # filtering can be exercised at a realistic catalog size.
    vehicles = {
        'Hyundai': (
            ('Creta', 2020, 2025, '1.5L'),
            ('Venue', 2019, 2025, '1.0L Turbo'),
            ('i20', 2020, 2025, '1.2L'),
            ('Verna', 2023, 2025, '1.5L'),
            ('Alcazar', 2021, 2025, '1.5L Turbo'),
        ),
        'BMW': (
            ('3 Series', 2019, 2025, '2.0L'),
            ('X1', 2023, 2025, '1.5L Turbo'),
            ('X3', 2018, 2025, '2.0L'),
            ('5 Series', 2017, 2025, '2.0L'),
            ('X5', 2019, 2025, '3.0L'),
        ),
        'Honda': (
            ('City', 2020, 2025, '1.5L'),
            ('Amaze', 2018, 2025, '1.2L'),
            ('Elevate', 2023, 2025, '1.5L'),
            ('Civic', 2019, 2021, '1.8L'),
            ('WR-V', 2017, 2023, '1.2L'),
        ),
        'Mercedes': (
            ('C-Class', 2015, 2025, '2.0L'),
            ('GLC', 2020, 2025, '2.0L'),
            ('E-Class', 2017, 2025, '2.0L'),
            ('A-Class Limousine', 2021, 2025, '1.3L'),
            ('GLE', 2020, 2025, '3.0L'),
        ),
    }

    parts = (
        ('Ceramic Brake Pad Set', 'brake pad', 899),
        ('Front Brake Disc Rotor', 'brake disc', 2499),
        ('Engine Oil Filter', 'oil filter', 449),
        ('Cabin Air Filter', 'cabin air filter', 699),
        ('Engine Air Filter Panel', 'air filter', 799),
        ('Front Wiper Blade Set', 'wiper', 999),
        ('Clutch Kit', 'clutch kit', 5899),
        ('Timing Belt Kit', 'timing belt', 4999),
        ('Suspension Strut Mount', 'suspension', 2499),
        ('Front Shock Absorber', 'suspension', 5999),
        ('Lower Control Arm Assembly', 'suspension', 4699),
        ('Wheel Bearing Kit', 'wheel bearing', 2199),
        ('Radiator Hose Set', 'cooling system', 1999),
        ('Thermostat Housing', 'cooling system', 1899),
        ('Spark Plug Set', 'ignition', 1299),
        ('Ignition Coil', 'ignition', 2799),
        ('Oxygen Sensor', 'exhaust sensor', 3599),
        ('Exhaust Manifold Gasket', 'exhaust', 1099),
        ('Front Bumper Grille', 'exterior', 3999),
        ('Headlamp Assembly', 'head light', 7999),
        ('Tail Lamp Assembly', 'tail light', 6499),
        ('Engine Mounting', 'engine mount', 4299),
        ('Accessory Drive Belt Kit', 'drive belt', 2899),
        ('Transmission Filter Kit', 'transmission filter', 4299),
        ('Premium 7D Floor Mat Set', 'foot mats', 3499),
    )

    make_codes = {'Hyundai': 'HY', 'BMW': 'BM', 'Honda': 'HO', 'Mercedes': 'ME'}
    make_price_additions = {'Hyundai': 0, 'BMW': 1400, 'Honda': 100, 'Mercedes': 1800}
    legacy_seed_codes = (
        'MS000001', 'MS000002', 'MS000003', 'MS000004', 'MS000005', 'MS000006',
    )

    @classmethod
    def build_products(cls):
        products = []
        for make, vehicles in cls.vehicles.items():
            for number, (part_name, sub_category, base_price) in enumerate(cls.parts, start=1):
                model, year_from, year_to, engine_variant = vehicles[(number - 1) % len(vehicles)]
                make_code = cls.make_codes[make]
                price = base_price + cls.make_price_additions[make]
                products.append({
                    'code': f'MS-{make_code}-{number:03d}',
                    'category': 'car',
                    'sub_category': sub_category,
                    'name': f'{make} {model} {part_name}',
                    'description': (
                        f'Aftermarket {part_name.lower()} engineered for {make} {model} '
                        f'model years {year_from}-{year_to}. Confirm the vehicle engine '
                        'variant before installation.'
                    ),
                    'brand': 'MotoSpar Select',
                    'model': f'{make} {model}',
                    'year': f'{year_from}-{year_to}',
                    'price': f'{price}.00',
                    'sku': f'MS-{make_code}-{number:02d}',
                    'quantity': 8 + ((number * 3) % 20),
                    'features': (
                        'Vehicle-specific fitment, active inventory, aftermarket replacement part'
                    ),
                    'requires_fitment': True,
                    'compatibilities': [{
                        'make': make,
                        'model': model,
                        'year_from': year_from,
                        'year_to': year_to,
                        'engine_variant': engine_variant,
                    }],
                })
        return products

    def handle(self, *args, **options):
        with transaction.atomic():
            admin, created = User.objects.get_or_create(
                email='local-admin@motospar.test',
                defaults={
                    'username': 'local_motospar_admin',
                    'first_name': 'Local',
                    'last_name': 'Admin',
                    'account_type': 'admin',
                    'is_staff': True,
                    'is_superuser': True,
                    'is_active': True,
                    'is_verified': True,
                },
            )
            if created:
                admin.set_unusable_password()
                admin.save(update_fields=['password'])

            # Replace only the original six local demo records. Real catalog
            # products and any other product codes are never removed here.
            Product.objects.filter(code__in=self.legacy_seed_codes).delete()

            for item in self.build_products():
                category, _ = Category.objects.get_or_create(
                    name=item['category'],
                    defaults={'description': f"Parts and accessories for {item['category']}s.", 'is_active': True},
                )
                sub_category, _ = SubCategory.objects.get_or_create(
                    category=category,
                    name=item['sub_category'],
                    defaults={'description': f"{item['sub_category'].title()} for {category.name}.", 'is_active': True},
                )

                product, _ = Product.objects.update_or_create(
                    code=item['code'],
                    defaults={
                        'category': category,
                        'sub_category': sub_category,
                        'name': item['name'],
                        'description': item['description'],
                        'brand': item['brand'],
                        'model': item['model'],
                        'year': item['year'],
                        'rating': '4.5',
                        'created_by': admin,
                        'is_active': True,
                        'requires_fitment': item['requires_fitment'],
                    },
                )

                variant, _ = ProductVariant.objects.update_or_create(
                    product=product,
                    color='standard',
                    size='standard',
                    defaults={
                        'listing_price_for_vendor': item['price'],
                        'cost_to_vendor': item['price'],
                        'motospar_commission_from_vendor': '0.00',
                        'markup_in_prices': '0.00',
                        'final_listing_price_on_motospar': item['price'],
                        'final_profit_per_part': '0.00',
                        'quantity': item['quantity'],
                        'in_stock': True,
                        'sku': item['sku'],
                        'material': 'Automotive grade',
                        'features': item['features'],
                        'is_active': True,
                    },
                )
                if item.get('image'):
                    ProductImage.objects.update_or_create(
                        variant=variant,
                        caption='Primary product image',
                        defaults={'image': item['image'], 'is_active': True},
                    )

                ProductCompatibility.objects.filter(product=product).delete()
                ProductCompatibility.objects.bulk_create([
                    ProductCompatibility(product=product, **compatibility)
                    for compatibility in item.get('compatibilities', [])
                ])

        self.stdout.write(self.style.SUCCESS(
            'Created or updated 100 fitment-safe demo car products: '
            '25 each for Hyundai, BMW, Honda, and Mercedes.'
        ))
