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


app_name = 'vendor'


urlpatterns = [
    # ! URLs for vendor profile management.
    path('api/vendor/vendors/add/', views.add_vendor_profile, name='add_vendor_profile'),
    path('api/vendor/vendors/<uuid:vendor_profile_id>/edit/', views.edit_vendor_profile, name='edit_vendor_profile'),
    path('api/admin/vendors/view/', views.view_vendor_profiles, name='view_vendor_profiles'),  # for all vendor profiles
    path('api/vendor/vendors/<uuid:user_id>/view/', views.view_vendor_profiles, name='view_vendor_profile_by_user'),  # for a specific vendor profile
    path('api/admin/vendors/<uuid:vendor_profile_id>/delete/', views.delete_vendor_profile, name='delete_vendor_profile'),

    # ! URLs for vendor stock management.
    path('api/vendor/vendors/stock/add/', views.add_vendor_stock, name='add_vendor_stock'),
    path('api/vendor/vendors/stock/<uuid:stock_id>/edit/', views.edit_vendor_stock, name='edit_vendor_stock'),
    path('api/vendor/vendors/stock/<uuid:stock_id>/toggle-stock/', views.toggle_in_vendor_stock, name='toggle_in_vendor_stock'),
    path('api/vendors/stock/<uuid:user_id>/list/', views.list_vendor_stock, name='list_vendor_stock'),
]