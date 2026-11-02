from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from app.models import User
from cart.models import Cart, CartItem
from cart.views import add_cart_item, delete_cart_item, edit_cart_item
from product.models import Category, Product, ProductVariant, SubCategory
from vendor.models import VendorProfile, VendorStock


class CartCheckoutGuardTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.customer = User.objects.create_user(
            username='buyer-one', email='buyer-one@example.org',
            password='test-pass', account_type='customer',
        )
        cls.other_customer = User.objects.create_user(
            username='buyer-two', email='buyer-two@example.org',
            password='test-pass', account_type='customer',
        )
        owner = User.objects.create_user(
            username='catalog-admin', email='catalog-admin@example.org',
            password='test-pass', account_type='admin',
        )
        vendor = User.objects.create_user(
            username='stock-vendor', email='stock-vendor@example.org',
            password='test-pass', account_type='vendor',
        )
        category = Category.objects.create(name='Car')
        subcategory = SubCategory.objects.create(category=category, name='Lamps')
        product = Product.objects.create(
            name='Cart Headlight', description='Test part',
            category=category, sub_category=subcategory, created_by=owner,
            delivery_charge=Decimal('25'), driver_fees=Decimal('5'),
            mechanic_fees=Decimal('40'),
        )
        cls.variant = ProductVariant.objects.create(
            product=product, sku='CART-TEST-1',
            final_listing_price_on_motospar=Decimal('100'),
            discount=Decimal('10'),
        )
        VendorStock.objects.create(
            vendorprofile=VendorProfile.objects.get(user=vendor),
            variant=cls.variant, stock_quantity=3, price=Decimal('90'),
        )
        cls.other_cart = Cart.objects.get(user=cls.other_customer)

    def _request(self, method, path, data, user):
        request = getattr(APIRequestFactory(), method)(path, data, format='json')
        force_authenticate(request, user=user)
        return request

    def test_cart_uses_server_price_and_fees(self):
        request = self._request('post', '/api/customer/cart/add/', {
            'variant': str(self.variant.pk), 'quantity': 1,
            'price_at_addition': '-100', 'delivery_charge': '-50',
            'driver_fees': '-20', 'mechanic_fees': '40',
        }, self.customer)
        response = add_cart_item(request)
        self.assertEqual(response.status_code, 201)
        item = CartItem.objects.get(cart__user=self.customer, variant=self.variant)
        self.assertEqual(item.price_at_addition, Decimal('90'))
        self.assertEqual(item.delivery_charge, Decimal('25'))
        self.assertEqual(item.driver_fees, Decimal('5'))
        self.assertEqual(item.mechanic_fees, Decimal('40'))

    def test_cart_owner_is_required_for_edit_and_delete(self):
        item = CartItem.objects.create(
            cart=self.other_cart, variant=self.variant, quantity=1,
            price_at_addition=Decimal('90'),
        )
        edit = self._request('patch', f'/api/customer/cart/{item.pk}/edit/',
                             {'quantity': 2}, self.customer)
        delete = self._request('delete', f'/api/customer/cart/{item.pk}/delete/',
                               {}, self.customer)
        self.assertEqual(edit_cart_item(edit, item.pk).status_code, 404)
        self.assertEqual(delete_cart_item(delete, item.pk).status_code, 404)
        item.refresh_from_db()
        self.assertTrue(item.is_active)
        self.assertEqual(item.quantity, 1)
