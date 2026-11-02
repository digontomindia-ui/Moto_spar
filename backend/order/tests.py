from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from app.models import User
from cart.models import Cart, CartItem
from order.models import Order
from order.views import create_order, create_order_from_cart
from product.models import Category, Product, ProductVariant, SubCategory
from shipping.models import ShippingAddress
from vendor.models import VendorProfile, VendorStock


class DirectOrderCheckoutTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.customer = User.objects.create_user(
            username='order-buyer', email='order-buyer@example.org',
            password='test-pass', account_type='customer',
        )
        other = User.objects.create_user(
            username='other-buyer', email='other-buyer@example.org',
            password='test-pass', account_type='customer',
        )
        owner = User.objects.create_user(
            username='order-admin', email='order-admin@example.org',
            password='test-pass', account_type='admin',
        )
        vendor = User.objects.create_user(
            username='order-vendor', email='order-vendor@example.org',
            password='test-pass', account_type='vendor',
        )
        category = Category.objects.create(name='Car')
        subcategory = SubCategory.objects.create(category=category, name='Lamps')
        product = Product.objects.create(
            name='Order Headlight', description='Test part',
            category=category, sub_category=subcategory, created_by=owner,
            delivery_charge=Decimal('25'), driver_fees=Decimal('5'),
            mechanic_fees=Decimal('40'),
        )
        cls.variant = ProductVariant.objects.create(
            product=product, sku='ORDER-TEST-1',
            final_listing_price_on_motospar=Decimal('100'),
            discount=Decimal('10'),
        )
        VendorStock.objects.create(
            vendorprofile=VendorProfile.objects.get(user=vendor),
            variant=cls.variant, stock_quantity=3, price=Decimal('90'),
        )
        address_fields = dict(
            street_address='1 Test Road', city='Kolkata', state='West Bengal',
            postal_code='700104', country='India',
        )
        cls.address = ShippingAddress.objects.create(user=cls.customer, **address_fields)
        cls.other_address = ShippingAddress.objects.create(user=other, **address_fields)

    def _place(self, shipping_address, **overrides):
        payload = {
            'shipping_address': str(shipping_address.pk),
            'billing_address': str(shipping_address.pk),
            'payment_method': 'CASH_ON_DELIVERY',
            'delivery_charge': '-5000', 'driver_fees': '-1000',
            'order_items': [{
                'variant': str(self.variant.pk), 'quantity': 1,
                'mechanic_fees': '40',
            }],
        }
        payload.update(overrides)
        request = APIRequestFactory().post('/api/customer/order/create/', payload, format='json')
        force_authenticate(request, user=self.customer)
        return create_order(request)

    def test_order_ignores_client_fees_and_snapshots_billing_address(self):
        response = self._place(self.address)
        self.assertEqual(response.status_code, 201)
        order = Order.objects.get(customer=self.customer)
        self.assertEqual(order.total_price, Decimal('160'))
        self.assertEqual(order.delivery_charge, Decimal('25'))
        self.assertEqual(order.driver_fees, Decimal('5'))
        self.assertEqual(order.billing_address.user, self.customer)
        self.assertEqual(order.billing_address.street_address, self.address.street_address)

    def test_order_rejects_another_customers_address(self):
        response = self._place(self.other_address)
        self.assertEqual(response.status_code, 400)
        self.assertFalse(Order.objects.filter(customer=self.customer).exists())

    def test_order_rejects_unavailable_quantity(self):
        response = self._place(self.address, order_items=[{
            'variant': str(self.variant.pk), 'quantity': 4,
            'mechanic_fees': '0',
        }])
        self.assertEqual(response.status_code, 400)
        self.assertFalse(Order.objects.filter(customer=self.customer).exists())

    def test_cart_checkout_reprices_saved_rows_from_catalog(self):
        CartItem.objects.create(
            cart=Cart.objects.get(user=self.customer), variant=self.variant,
            quantity=1, price_at_addition=Decimal('-100'),
            delivery_charge=Decimal('-500'), driver_fees=Decimal('-50'),
            mechanic_fees=Decimal('40'),
        )
        request = APIRequestFactory().post('/api/customer/order/create-from-cart/', {
            'shipping_address': str(self.address.pk),
            'billing_address': str(self.address.pk),
            'payment_method': 'CASH_ON_DELIVERY',
            'delivery_charge': '-9999',
        }, format='json')
        force_authenticate(request, user=self.customer)
        response = create_order_from_cart(request)
        self.assertEqual(response.status_code, 201)
        order = Order.objects.get(customer=self.customer)
        self.assertEqual(order.total_price, Decimal('160'))
        self.assertEqual(order.delivery_charge, Decimal('25'))
        self.assertEqual(order.driver_fees, Decimal('5'))
        self.assertEqual(order.checkout_source, 'FROM_CART')

    def test_direct_gateway_order_does_not_mutate_existing_cart(self):
        cart = Cart.objects.get(user=self.customer)
        CartItem.objects.create(
            cart=cart, variant=self.variant, quantity=1,
            price_at_addition=Decimal('90'),
        )
        response = self._place(self.address, payment_method='PAYMENT_GATEWAY')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(CartItem.objects.get(cart=cart, variant=self.variant).quantity, 1)
        self.assertEqual(Order.objects.get(customer=self.customer).checkout_source, 'DIRECT')

    def test_client_cannot_mark_unpaid_order_successful(self):
        response = self._place(
            self.address,
            payment_method='PAYMENT_GATEWAY',
            payment_status='SUCCESS', is_successful=True,
            provider_order_id='forged-provider-order',
            order_items=[{
                'variant': str(self.variant.pk), 'quantity': 1,
                'mechanic_fees': '0', 'payment_status': 'SUCCESS',
                'assigned_vendor': str(self.customer.pk),
            }],
        )
        self.assertEqual(response.status_code, 201)
        order = Order.objects.get(customer=self.customer)
        self.assertEqual(order.payment_status, 'PENDING')
        self.assertFalse(order.is_successful)
        self.assertEqual(order.provider_order_id, '')
        item = order.order_items.get()
        self.assertEqual(item.payment_status, 'PENDING')
        self.assertIsNone(item.assigned_vendor)
