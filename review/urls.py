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


app_name = 'review'


urlpatterns = [
    # ! URLS for add / edit / view / delete reviews.
    path('api/customer/reviews/add/', views.add_review, name='add_review'),  # Adding a new review
    path('api/reviews/<uuid:review_id>/edit/', views.edit_review, name='edit_review'),  # Editing an existing review
    path('api/reviews/<uuid:review_id>/delete/', views.delete_review, name='delete_review'),  # Deleting a review
    path('api/reviews/<uuid:review_id>/images/<uuid:image_id>/delete/', views.delete_review_image, name='delete_review_image'),  # Deleting a specific image from a review
    path('api/reviews/<uuid:product_id>/view/', views.view_reviews, name='view_reviews')  # Viewing reviews for product
]