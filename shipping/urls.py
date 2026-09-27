"""
URL configuration for carpal project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.urls import path
from . import views


app_name = 'shipping'


urlpatterns = [
    # ! URLs for managing shipping addresses
    path('api/customer/shipping-address/add/', views.add_shipping_address, name='add_shipping_address'),
    path('api/customer/shipping-address/<uuid:address_id>/edit/', views.edit_shipping_address, name='edit_shipping_address'),
    path('api/customer/shipping-address/view/', views.view_shipping_addresses, name='view_shipping_addresses'),
    path('api/customer/shipping-address/<uuid:address_id>/delete/', views.delete_shipping_address, name='delete_shipping_address'),

    # ! URLs for managing billing addresses
    path('api/customer/billing-address/add/', views.add_billing_address, name='add_billing_address'),
    path('api/customer/billing-address/<uuid:address_id>/edit/', views.edit_billing_address, name='edit_billing_address'),
    path('api/customer/billing-address/view/', views.view_billing_addresses, name='view_billing_addresses'),
    path('api/customer/billing-address/<uuid:address_id>/delete/', views.delete_billing_address, name='delete_billing_address'),
]