"""Authentication for the machine-to-machine chatbot catalog API."""

import secrets

from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class ChatbotAPIKeyUser:
    """Minimal authenticated principal used only for the chatbot API key."""

    is_active = True
    is_anonymous = False
    is_authenticated = True

    def __str__(self):
        return 'chatbot-api-key'


class ChatbotAPIKeyAuthentication(BaseAuthentication):
    """Accept a single server-configured key sent as ``X-API-Key``."""

    header_name = 'X-API-Key'

    def authenticate(self, request):
        configured_key = settings.CHATBOT_API_KEY
        provided_key = request.headers.get(self.header_name, '')

        if not configured_key:
            raise AuthenticationFailed('Chatbot API authentication is not configured.')
        if not provided_key or not secrets.compare_digest(provided_key, configured_key):
            raise AuthenticationFailed('A valid X-API-Key header is required.')

        return (ChatbotAPIKeyUser(), provided_key)

    def authenticate_header(self, request):
        return self.header_name
