from decimal import Decimal
from unittest.mock import patch

import razorpay
from django.test import TestCase
from rest_framework.test import APIClient

from app.models import User
from cart.models import Cart, CartItem
from order.models import Order, OrderItem
from product.models import Category, Product, ProductVariant, SubCategory
from shipping.models import ShippingAddress


class RazorpayCallbackTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.customer = User.objects.create_user(
            username='pay-buyer', email='pay-buyer@example.org',
            password='test-pass', account_type='customer',
        )
        owner = User.objects.create_user(
            username='pay-admin', email='pay-admin@example.org',
            password='test-pass', account_type='admin',
        )
        address = ShippingAddress.objects.create(
            user=cls.customer, street_address='1 Test Road', city='Kolkata',
            state='West Bengal', postal_code='700104', country='India',
        )
        category = Category.objects.create(name='Car')
        subcategory = SubCategory.objects.create(category=category, name='Lamps')
        product = Product.objects.create(
            name='Payment Test Lamp', description='Test part',
            category=category, sub_category=subcategory, created_by=owner,
        )
        cls.purchased = ProductVariant.objects.create(
            product=product, sku='PAY-1', final_listing_price_on_motospar=100,
        )
        cls.unrelated = ProductVariant.objects.create(
            product=product, sku='PAY-2', color='Black',
            final_listing_price_on_motospar=50,
        )
        cls.order = Order.objects.create(
            customer=cls.customer, shipping_address=address,
            total_price=Decimal('100.00'), payment_method='PAYMENT_GATEWAY',
            provider_order_id='order_test_123', checkout_source='FROM_CART',
        )
        OrderItem.objects.create(
            order=cls.order, variant=cls.purchased, quantity=1,
            price=Decimal('100.00'), item_total_price=Decimal('100.00'),
        )
        cart = Cart.objects.get(user=cls.customer)
        CartItem.objects.create(
            cart=cart, variant=cls.purchased, quantity=1,
            price_at_addition=Decimal('100.00'),
        )
        CartItem.objects.create(
            cart=cart, variant=cls.unrelated, quantity=1,
            price_at_addition=Decimal('50.00'),
        )

    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(user=self.customer)
        self.payload = {
            'razorpay_order_id': 'order_test_123',
            'razorpay_payment_id': 'pay_test_123',
            'razorpay_signature': 'signed',
        }

    @patch('payment.views.razorpay.Client')
    def test_rejects_invalid_signature_without_writing_payment(self, client):
        client.return_value.utility.verify_payment_signature.side_effect = (
            razorpay.errors.SignatureVerificationError('bad')
        )
        response = self.client.post(
            '/api/customer/order/payment/razorpay/callback/', self.payload,
            format='json',
        )
        self.assertEqual(response.status_code, 400)
        self.order.refresh_from_db()
        self.assertEqual(self.order.payment_id, '')
        self.assertEqual(self.order.payment_status, 'PENDING')

    @patch('payment.views.razorpay.Client')
    def test_rejects_uncaptured_or_wrong_amount(self, client):
        client.return_value.payment.fetch.return_value = {
            'order_id': 'order_test_123', 'status': 'authorized',
            'currency': 'INR', 'amount': 9999,
        }
        response = self.client.post(
            '/api/customer/order/payment/razorpay/callback/', self.payload,
            format='json',
        )
        self.assertEqual(response.status_code, 409)
        self.order.refresh_from_db()
        self.assertEqual(self.order.payment_status, 'PENDING')

    @patch('payment.views.razorpay.Client')
    def test_captured_payment_only_removes_purchased_cart_line(self, client):
        client.return_value.payment.fetch.return_value = {
            'order_id': 'order_test_123', 'status': 'captured',
            'currency': 'INR', 'amount': 10000,
        }
        response = self.client.post(
            '/api/customer/order/payment/razorpay/callback/', self.payload,
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.order.refresh_from_db()
        self.assertEqual(self.order.payment_status, 'SUCCESS')
        self.assertFalse(CartItem.objects.filter(variant=self.purchased).exists())
        self.assertTrue(CartItem.objects.filter(variant=self.unrelated).exists())
        repeated = self.client.post(
            '/api/customer/order/payment/razorpay/callback/', self.payload,
            format='json',
        )
        self.assertEqual(repeated.status_code, 200)
        self.assertTrue(CartItem.objects.filter(variant=self.unrelated).exists())

    @patch('payment.views.razorpay.Client')
    def test_payment_retry_reuses_provider_order(self, client):
        response = self.client.post(
            '/api/customer/order/payment/razorpay/',
            {'order_id': str(self.order.pk)}, format='json',
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['data']['razorpay_order_id'], 'order_test_123')
        client.return_value.order.create.assert_not_called()

    @patch('payment.views.razorpay.Client')
    def test_direct_purchase_keeps_existing_cart_item(self, client):
        self.order.checkout_source = 'DIRECT'
        self.order.save(update_fields=['checkout_source'])
        client.return_value.payment.fetch.return_value = {
            'order_id': 'order_test_123', 'status': 'captured',
            'currency': 'INR', 'amount': 10000,
        }
        response = self.client.post(
            '/api/customer/order/payment/razorpay/callback/', self.payload,
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(CartItem.objects.filter(variant=self.purchased).exists())
