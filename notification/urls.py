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


app_name = 'notification'


urlpatterns = [
    # View all notifications for a user
    path('api/customer/notifications/', views.view_user_notifications, name='view_user_notifications'),

    # Mark a single notification as read
    path('api/customer/notification/<int:notification_id>/mark-read/', views.mark_single_notification_as_read, name='mark_single_notification_as_read'),

    # Mark all notifications as read
    path('api/customer/notifications/mark-all-read/', views.mark_all_notifications_as_read, name='mark_all_notifications_as_read'),

    # View all notifications for a mechanic
    path('api/mechanic/notifications/', views.view_mechanic_notifications, name='view_mechanic_notifications'),

    # Mark a single notification as read
    path('api/mechanic/notification/<int:notification_id>/mark-read/', views.mark_single_mechanic_notification_as_read, name='mark_single_mechanic_notification_as_read'),

    # Mark all notifications as read
    path('api/mechanic/notifications/mark-all-read/', views.mark_all_mechanic_notifications_as_read, name='mark_all_mechanic_notifications_as_read'),

]