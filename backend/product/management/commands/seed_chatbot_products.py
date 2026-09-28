from django.core.management.base import BaseCommand
from django.db import transaction

from app.models import User
from product.models import (
    Category, Product, ProductCompatibility, ProductImage, ProductVariant,
    SubCategory,
)


class Command(BaseCommand):
    help = 'Create or update six active, in-stock products for local chatbot testing.'

    products = [
        {
            'code': 'MS000001',
            'category': 'bike',
            'sub_category': 'brake pad',
            'name': 'Honda Activa 6G Ceramic Brake Pad',
            'description': 'Durable ceramic front brake pad set for Honda Activa 6G scooters. Designed for reliable daily-city braking.',
            'brand': 'MotoSpar',
            'model': 'Honda Activa 6G',
            'year': '2020-2025',
            'price': '499.00',
            'sku': 'MS-ACT6-BP',
            'quantity': 25,
            'features': 'Ceramic compound, low noise, easy fitment',
            'image': '/media/product_images/pro_bakeoil.jpeg',
            'requires_fitment': True,
            'compatibilities': [
                {'make': 'Honda', 'model': 'Activa 6G', 'year_from': 2020, 'year_to': 2025, 'engine_variant': '110cc'},
            ],
        },
        {
            'code': 'MS000002',
            'category': 'bike',
            'sub_category': 'head light',
            'name': 'Universal LED Motorcycle Headlight',
            'description': 'High-visibility LED motorcycle headlight for safer night riding, with a universal round mounting design.',
            'brand': 'MotoSpar',
            'model': 'Universal',
            'year': 'All years',
            'price': '899.00',
            'sku': 'MS-UNI-HL',
            'quantity': 18,
            'features': 'Bright LED beam, weather resistant, universal fit',
            'image': '/media/product_images/projector_light.jpeg',
            'requires_fitment': False,
        },
        {
            'code': 'MS000003',
            'category': 'bike',
            'sub_category': 'rims and alloy wheels',
            'name': 'Yamaha R15 Alloy Wheel Set',
            'description': 'Lightweight alloy wheel set designed for Yamaha R15 models, balancing a sporty appearance with everyday durability.',
            'brand': 'MotoSpar',
            'model': 'Yamaha R15',
            'year': '2018-2025',
            'price': '6499.00',
            'sku': 'MS-R15-ALY',
            'quantity': 8,
            'features': 'Lightweight alloy, corrosion resistant finish, direct fit',
            'image': '/media/product_images/bike_rims_pro.jpg',
            'requires_fitment': True,
            'compatibilities': [
                {'make': 'Yamaha', 'model': 'R15', 'year_from': 2018, 'year_to': 2025, 'engine_variant': '155cc'},
            ],
        },
        {
            'code': 'MS000004',
            'category': 'car',
            'sub_category': 'foot mats',
            'name': 'Hyundai Creta Premium 7D Floor Mat Set',
            'description': 'Custom-fit 7D floor mats for Hyundai Creta, providing full cabin coverage and easy-to-clean protection.',
            'brand': 'MotoSpar',
            'model': 'Hyundai Creta',
            'year': '2020-2025',
            'price': '2499.00',
            'sku': 'MS-CRETA-MAT',
            'quantity': 14,
            'features': 'Custom fit, anti-slip base, water resistant, set of four',
            'image': '/media/product_images/inature.png',
            'requires_fitment': True,
            'compatibilities': [
                {'make': 'Hyundai', 'model': 'Creta', 'year_from': 2020, 'year_to': 2025, 'engine_variant': ''},
            ],
        },
        {
            'code': 'MS000005',
            'category': 'car',
            'sub_category': 'wiper',
            'name': 'Maruti Suzuki Swift Front Wiper Blade Set',
            'description': 'All-weather front wiper blade set for Maruti Suzuki Swift with smooth, streak-free wiping performance.',
            'brand': 'MotoSpar',
            'model': 'Maruti Suzuki Swift',
            'year': '2018-2025',
            'price': '749.00',
            'sku': 'MS-SWIFT-WPR',
            'quantity': 30,
            'features': 'All-weather rubber, quiet operation, direct fit',
            'image': '/media/product_images/bumper_protector_pro.png',
            'requires_fitment': True,
            'compatibilities': [
                {'make': 'Maruti Suzuki', 'model': 'Swift', 'year_from': 2018, 'year_to': 2025, 'engine_variant': ''},
            ],
        },
        {
            'code': 'MS000006',
            'category': 'car',
            'sub_category': 'interior lights',
            'name': 'Universal Car Interior LED Light Kit',
            'description': 'Multi-colour LED interior light kit for cars, adding adjustable ambient cabin lighting with simple installation.',
            'brand': 'MotoSpar',
            'model': 'Universal',
            'year': 'All years',
            'price': '1199.00',
            'sku': 'MS-INT-LED',
            'quantity': 20,
            'features': 'Multi-colour LEDs, remote control, simple installation',
            'image': '/media/product_images/interiorlight_kit.jpg',
            'requires_fitment': False,
        },
    ]

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

            for item in self.products:
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

        self.stdout.write(self.style.SUCCESS('Created or updated 6 local chatbot products.'))
