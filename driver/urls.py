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


app_name = 'driver'


urlpatterns = [
    # Add a new driver
    path('api/admin/driver/add/', views.add_driver, name='add_driver'),

    # Edit an existing driver
    path('api/admin/driver/<uuid:driver_id>/edit/', views.edit_driver, name='edit_driver'),

    # View all drivers (with pagination)
    path('api/admin/driver/view/', views.view_drivers, name='view_drivers'),

    # Delete a driver (soft delete)
    path('api/admin/driver/<uuid:driver_id>/delete/', views.delete_driver, name='delete_driver'),
]