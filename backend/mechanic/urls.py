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


app_name = 'mechanic'


urlpatterns = [
    # ! URLs for mechanic profile management.
    path('api/mechanic/profile/<uuid:mechanic_profile_id>/edit/', views.edit_mechanic_profile, name='edit_mechanic_profile'),

    # ! URL for viewing mechanic users in the admin panel.
    path('api/admin/mechanic/users/view/', views.view_mechanic_users_admin_panel, name='view_mechanic_users_admin_panel'),
    
    # ! URL for viewing details of a specific mechanic user in the admin panel.
    path('api/admin/mechanic/users/<uuid:user_id>/details/', views.detail_mechanic_user_view_admin, name='detail_mechanic_user_view_admin'),
    
    # ! Find nearest mechanic for an order item
    path('api/admin/order-item/<uuid:order_item_id>/find-nearest-mechanics/', views.find_nearest_mechanics_for_order_item, name='find_nearest_mechanics_for_order_item'),

    # ! Assign a mechanic to an order item
    path('api/admin/order-item/<uuid:order_item_id>/assign-mechanic/', views.assign_mechanic_to_order_item, name='assign_mechanic_to_order_item'),

    # ! Accept a mechanic job offer
    path('api/mechanic/job/<uuid:job_id>/accept/', views.accept_job_offer, name='accept_job_offer'),

    # ! Decline a mechanic job offer
    path('api/mechanic/job/<uuid:job_id>/decline/', views.decline_job_offer, name='decline_job_offer'),

    # ! Start a mechanic job
    path('api/mechanic/job/<uuid:job_id>/start/', views.start_mechanic_job, name='start_mechanic_job'),
    
    # ! Upload images for a mechanic job
    path('api/mechanic/job/<uuid:job_id>/upload-images/', views.upload_mechanic_job_images, name='upload_mechanic_job_images'),
    
    # ! Complete a mechanic job with OTP validation
    path('api/mechanic/job/<uuid:job_id>/complete-with-otp/', views.complete_job_with_otp, name='complete_job_with_otp'),

    # ! Validate OTP for a mechanic job
    # path('api/mechanic/job/<uuid:job_id>/validate-otp/', views.validate_job_otp, name='validate_job_otp'),

    # ! Mark a mechanic job as completed
    # path('api/mechanic/job/<uuid:job_id>/complete/', views.mark_job_completed, name='mark_job_completed'),

    # ! Add review and rating for a mechanic job
    path('api/customer/<uuid:order_item_id>/add-mechanic-review/', views.add_mechanic_job_review, name='add_mechanic_job_review'),

    # ! View mechanic jobs
    path('api/mechanic/jobs/view/', views.view_mechanic_jobs, name='view_mechanic_jobs'),

    # ! Mechanic Statistics
    path('api/mechanic/statistics/', views.mechanic_statistics_view, name='mechanic_statistics_view'),

    # ! Mechanic Report App
    path('api/mechanic/report/', views.add_mechanic_report, name='add_mechanic_report'),

    # ! Update payment status and date for a mechanic job
    path('api/admin/mechanic-job/<uuid:mechanic_job_id>/update-payment/', views.update_mechanic_job_payment, name='update_mechanic_job_payment'),

    # ! Create mechanic platform fee payment
    path('api/mechanic/fee-payment/create/', views.create_mechanic_fee_payment_razorpay, name='create_mechanic_fee_payment'),
    
    # ! Handle Razorpay callback for mechanic platform fee
    path('api/mechanic/fee-payment/callback/', views.mechanic_fee_razorpay_callback, name='mechanic_fee_razorpay_callback'),

    # ! View mechanic platform fees
    path('api/mechanic/platform-fees/view/', views.view_mechanic_platform_fees, name='view_mechanic_platform_fees'),
]