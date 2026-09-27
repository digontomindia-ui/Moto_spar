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


app_name = 'cart'


urlpatterns = [
    # ! URLs for customer cart management
    # Add a product to the cart
    path('api/customer/cart/add/', views.add_cart_item, name='add_cart_item'),

    # Edit an existing cart item (update quantity or price)
    path('api/customer/cart/<uuid:cart_item_id>/edit/', views.edit_cart_item, name='edit_cart_item'),

    # View all items in the user's cart
    path('api/customer/cart/view/', views.view_cart_item, name='view_cart_item'),

    # Delete a cart item
    path('api/customer/cart/<uuid:cart_item_id>/delete/', views.delete_cart_item, name='delete_cart_item'),
]