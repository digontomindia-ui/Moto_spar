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
from . import tasks


app_name = 'product'


urlpatterns = [
    # ! URLS for add / edit / view / delete catagories. 
    path('api/admin/categories/add/', views.add_category, name='add_category'),
    path('api/admin/categories/<uuid:category_id>/edit/', views.edit_category, name='edit_category'),
    path('api/categories/', views.view_category, name='view_category'),
    path('api/admin/categories/<uuid:category_id>/delete/', views.delete_category, name='delete_category'),

    # ! URLS for add / edit / view / delete sub-catagories.
    path('api/admin/sub-categories/add/', views.add_subcategory, name='add_sub_category'),
    path('api/admin/sub-categories/<uuid:subcategory_id>/edit/', views.edit_subcategory, name='edit_sub_category'),
    path('api/sub-categories/', views.view_subcategory, name='view_sub_category'),
    path('api/sub-categories/<uuid:category_id>/', views.view_subcategory, name='view_sub_category_with_category'),
    path('api/admin/sub-categories/<uuid:subcategory_id>/delete/', views.delete_subcategory, name='delete_sub_category'),

    # ! URLS for add / edit / view / delete products.
    path('api/admin/products/add/', views.add_product, name='add_product'),
    path('api/admin/variant/<uuid:product_id>/add/', views.add_variant_and_images, name='add_variant_and_images'),
    path('api/admin/products/<uuid:product_id>/edit/', views.edit_product, name='edit_product'),
    path('api/admin/variant/<uuid:variant_id>/edit/', views.edit_variant_and_images, name='edit_variant_and_images'),
    path('api/products/', views.view_products, name='view_products'),
    path('api/admin/products/<uuid:product_id>/delete/', views.delete_product, name='delete_product'),
    
    # ! URLS for product image deletion.
    path('api/admin/product-images/<uuid:product_image_id>/delete/', views.delete_product_image, name='delete_product_image'),

    # ! URLS for product search.
    path('api/products/search/', views.search_product, name='search_product'),
    path('api/chatbot/products/', views.chatbot_all_products, name='chatbot_all_products'),
    path('api/chatbot/products/search/', views.chatbot_product_search, name='chatbot_product_search'),
    path('api/chatbot/products/validate/', views.chatbot_validate_products, name='chatbot_validate_products'),

    # ! URLS for toggling product in-stock status.
    path('api/admin/variant/<uuid:variant_id>/toggle-stock/', views.toggle_in_variant_stock, name='toggle_in_variant_stock'),

    # ! URLS for product details.
    path('api/products/<uuid:product_id>/', views.product_details, name='product_details'),
    path('products/<uuid:product_id>/', views.public_product_page, name='public_product_page'),

    # ! URLS for toggling product active status.
    path('api/admin/products/<uuid:product_id>/toggle-active/', views.toggle_product_active_status, name='toggle_product_active_status'),

    # ! URL for adding product request by vendor.
    path('api/vendor/product-request/add/', views.add_product_request, name='add_product_request'),

    # ! URL for vendors to view their product requests.
    path('api/vendor/product-request/view/', views.view_product_request_vendor, name='view_product_request_vendor'),

    # ! URL for admins to view all product requests.
    path('api/admin/product-request/view/', views.view_product_request_admin, name='view_product_request_admin'),

    # ! URL for viewing a specific product request.
    path('api/product-request/<uuid:product_request_id>/', views.view_specific_product_request, name='view_specific_product_request'),

    # ! URL for updating a specific product request.
    path('api/product-request/<uuid:product_request_id>/update/', views.update_specific_product_request, name='update_specific_product_request'),


    # ? Views from tasks.py
    # ! URL for bulk product upload.
    path('api/admin/bulk-upload/', tasks.bulk_product_upload_sync, name='bulk_product_upload'),

    # ! URL for downloading the bulk upload template (CSV/Excel).
    path('api/admin/bulk-upload/template/', tasks.download_bulk_upload_template, name='download_bulk_upload_template'),

    # ! URL for downloading the category-subcategory mapping CSV.
    path('api/admin/category-subcategory-mapping/', tasks.download_category_subcategory_mapping, name='download_category_subcategory_mapping'),

    # ! URL for downloading a dummy CSV with example data.
    path('api/admin/dummy-csv/', tasks.download_dummy_csv, name='download_dummy_csv'),
]
