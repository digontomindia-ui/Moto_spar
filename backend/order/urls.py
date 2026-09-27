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


app_name = 'order'


urlpatterns = [
    # Create a new order
    path('api/customer/order/create/', views.create_order, name='create_order'),

    # Create an order from the user's cart
    path('api/customer/order/create-from-cart/', views.create_order_from_cart, name='create_order_from_cart'),

    # View all orders for a customer
    path('api/customer/orders/', views.view_customer_orders, name='view_customer_orders'),

    # View all orders assigned to a vendor
    path('api/vendor/orders/', views.view_vendor_orders, name='view_vendor_orders'),

    # Find nearest vendors for an order item
    path('api/admin/order-item/<uuid:order_item_id>/find-nearest-vendors/', views.find_nearest_vendors_for_order_item, name='find_nearest_vendors_for_order_item'),

    # Assign a vendor to an order item
    path('api/admin/order-item/assign-vendor/', views.assign_vendor_to_order_item, name='assign_vendor_to_order_item'),

    # Update order item status
    path('api/order-item/<uuid:order_item_id>/update-status/', views.update_order_item_status, name='update_order_item_status'),

    # Assign a driver to an order (Admin-only access)
    path('api/admin/order/assign-driver/', views.assign_driver_to_order, name='assign_driver_to_order'),

    # View driver details for an order (Customer-only access)
    path('api/customer/order/view-driver/', views.view_driver_details, name='view_driver_details'),
]