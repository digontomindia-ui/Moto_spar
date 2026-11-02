import json
from decimal import Decimal
from types import SimpleNamespace

from django.test import SimpleTestCase, TestCase

from app.models import User
from product.models import Category, Product, ProductVariant, SubCategory
from product.pricing import customer_sale_price


class CustomerPriceTests(SimpleTestCase):
    def test_invalid_discount_and_charge_never_produce_customer_price(self):
        product = SimpleNamespace(
            delivery_charge=Decimal('0'),
            driver_fees=Decimal('0'),
            mechanic_fees=Decimal('0'),
        )
        variant = SimpleNamespace(
            product=product,
            final_listing_price_on_motospar=Decimal('4807.00'),
            discount=Decimal('240.35'),
        )
        self.assertIsNone(customer_sale_price(variant))
        variant.discount = Decimal('10')
        self.assertEqual(customer_sale_price(variant), Decimal('4326.30'))
        product.driver_fees = Decimal('-1')
        self.assertIsNone(customer_sale_price(variant))


class CatalogSearchPricingTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        owner = User.objects.create_user(
            username='catalog-owner', email='catalog-owner@example.org',
            password='test-pass', account_type='admin',
        )
        category = Category.objects.create(name='Car')
        subcategory = SubCategory.objects.create(category=category, name='Lighting')
        discounted = Product.objects.create(
            name='Discounted Headlight', description='Real stock item',
            category=category, sub_category=subcategory, created_by=owner,
        )
        ProductVariant.objects.create(
            product=discounted, sku='PRICE-TEST-1',
            final_listing_price_on_motospar=Decimal('100.00'),
            discount=Decimal('20.00'),
        )
        regular = Product.objects.create(
            name='Regular Headlight', description='Real stock item',
            category=category, sub_category=subcategory, created_by=owner,
        )
        ProductVariant.objects.create(
            product=regular, sku='PRICE-TEST-2',
            final_listing_price_on_motospar=Decimal('100.00'),
        )

    def test_search_price_range_uses_discounted_customer_price(self):
        response = self.client.post(
            '/api/products/search/',
            data=json.dumps({'search': 'headlight', 'min_price': 75, 'max_price': 85}),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 200)
        products = response.json()['data']['products']
        self.assertEqual([item['name'] for item in products], ['discounted headlight'])
        self.assertEqual(products[0]['variants'][0]['discounted_price'], 80.0)
