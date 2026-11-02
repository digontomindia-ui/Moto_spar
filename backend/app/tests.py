from unittest.mock import patch
import os

from django.test import TestCase
from rest_framework.test import APIClient

from app.models import ContactUs, User


class NativeGoogleLoginTests(TestCase):
    @patch('app.views.google_id_token.verify_oauth2_token')
    def test_verified_id_token_creates_customer_session(self, verify_token):
        verify_token.return_value = {
            'email': 'native-buyer@example.org',
            'email_verified': True,
            'given_name': 'Native',
            'family_name': 'Buyer',
        }
        response = self.client.post(
            '/api/google/login/callback/',
            data={'id_token': 'signed-token', 'account_type': 'admin'},
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['data']['access'])
        self.assertEqual(
            User.objects.get(email='native-buyer@example.org').account_type,
            'customer',
        )

    @patch('app.views.google_id_token.verify_oauth2_token')
    def test_id_token_cannot_enter_existing_admin_account(self, verify_token):
        User.objects.create_user(
            username='admin-existing', email='admin-existing@example.org',
            password='test-pass', account_type='admin',
        )
        verify_token.return_value = {
            'email': 'admin-existing@example.org', 'email_verified': True,
        }
        response = self.client.post(
            '/api/google/login/callback/',
            data={'id_token': 'signed-token'},
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 403)

    @patch('app.views.google_id_token.verify_oauth2_token', side_effect=ValueError('bad token'))
    def test_invalid_id_token_is_rejected(self, verify_token):
        response = self.client.post(
            '/api/google/login/callback/',
            data={'id_token': 'bad-token'},
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertFalse(User.objects.filter(email='bad-token').exists())


class CustomerChatTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.customer = User.objects.create_user(
            username='chat-buyer', email='chat-buyer@example.org',
            password='test-pass', account_type='customer',
        )

    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(user=self.customer)

    @patch.dict(os.environ, {'N8N_CHAT_WEBHOOK_URL': 'https://n8n.example.org/webhook/live'})
    @patch('app.views.requests.post')
    def test_authenticated_chat_uses_server_webhook(self, post):
        post.return_value.json.return_value = [{'output': 'Live catalog result'}]
        response = self.client.post(
            '/api/customer/chat/',
            data={'chatInput': 'Find brake pads', 'sessionId': 'session-1'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['reply'], 'Live catalog result')
        self.assertEqual(post.call_args.kwargs['json']['chatInput'], 'Find brake pads')

    @patch.dict(os.environ, {'N8N_CHAT_WEBHOOK_URL': ''})
    def test_unconfigured_chat_fails_without_mock_reply(self):
        response = self.client.post(
            '/api/customer/chat/',
            data={'chatInput': 'Hello', 'sessionId': 'session-1'},
            format='json',
        )
        self.assertEqual(response.status_code, 503)
        self.assertNotIn('reply', response.json())


class AccountDeletionRequestTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.customer = User.objects.create_user(
            username='delete-buyer', email='delete-buyer@example.org',
            password='test-pass', account_type='customer',
        )

    @patch('app.views.notify_admin_about_contact_request')
    def test_authenticated_request_is_recorded_once(self, notify):
        client = APIClient()
        client.force_authenticate(user=self.customer)
        first = client.post('/api/customer/account-deletion-request/')
        second = client.post('/api/customer/account-deletion-request/')
        self.assertEqual(first.status_code, 202)
        self.assertEqual(second.status_code, 202)
        self.assertEqual(ContactUs.objects.filter(email=self.customer.email).count(), 1)
        notify.assert_called_once()


    @patch('app.views.notify_admin_about_contact_request')
    def test_public_page_accepts_valid_request(self, notify):
        page = self.client.get('/account-deletion/')
        self.assertEqual(page.status_code, 200)
        self.assertContains(page, 'MotoSpar account deletion')
        response = self.client.post('/account-deletion/', data={'email': 'buyer@example.org'})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(ContactUs.objects.filter(email='buyer@example.org').exists())
        notify.assert_called_once()


class MobileCorsTests(TestCase):
    def test_android_webview_origin_is_allowed(self):
        response = self.client.options(
            '/api/customer/register/',
            HTTP_ORIGIN='https://localhost',
            HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST',
            HTTP_ACCESS_CONTROL_REQUEST_HEADERS='content-type',
        )
        self.assertEqual(response['Access-Control-Allow-Origin'], 'https://localhost')
