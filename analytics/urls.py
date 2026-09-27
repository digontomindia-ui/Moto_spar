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


app_name = 'analytics'


urlpatterns = [
    # ! URL for viewing users in the admin panel.
    path('api/admin/users/view/', views.view_users_admin_panel, name='view_users_admin_panel'),

    # ! URL for viewing details of a specific user in the admin panel.
    path('api/admin/users/<uuid:user_id>/details/', views.detail_user_view_admin, name='detail_user_view_admin'),

    # ! URL for viewing orders in the admin panel.
    path('api/admin/orders/view/', views.view_orders_admin, name='view_orders_admin_panel'),

    # ! URL for viewing products in the admin panel.
    path('api/admin/products/view/', views.view_products_admin_panel, name='view_products_admin_panel'),

    # ! URL for vendors with a specific product in stock.
    path('api/admin/vendors/stock/<uuid:product_id>/in-stock/', views.vendors_with_product_in_stock, name='vendors_with_product_in_stock'),

    # ! URL for viewing user orders in the admin panel.
    path('api/admin/users/<uuid:user_id>/orders/', views.view_user_orders_admin_panel, name='view_user_orders_admin_panel'),

    # ! URL for viewing vendor order items in the admin panel.
    path('api/admin/vendors/<uuid:user_id>/order-items/', views.view_vendor_order_items_admin_panel, name='view_vendor_order_items_admin_panel'),

    # ! URL for admin panel statistics.
    path('api/admin/statistics/', views.admin_panel_statistics, name='admin_panel_statistics'),

    # ! URL for vendor statistics view.
    path('api/vendor/statistics/', views.vendor_statistics_view, name='vendor_statistics_view'),

    # ! URL for viewing all unverified vendor users from the admin panel.
    path('api/admin/vendors/unverified/', views.view_unverified_vendors, name='view_unverified_vendors'),

    # ! URL for updating the is_verified status for a vendor user.
    path('api/admin/vendors/<uuid:user_id>/verify/', views.update_vendor_verification, name='update_vendor_verification'),

    # ! URL for viewing all unverified mechanic users from the admin panel.
    path('api/admin/mechanics/unverified/', views.view_unverified_mechanics, name='view_unverified_mechanics'),

    # ! URL for updating the is_verified status for a mechanic user.
    path('api/admin/mechanics/<uuid:user_id>/verify/', views.update_mechanic_verification, name='update_mechanic_verification'),
]