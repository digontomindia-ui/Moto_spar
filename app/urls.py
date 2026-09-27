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
from rest_framework_simplejwt.views import TokenRefreshView


app_name = 'app'


urlpatterns = [
    # ? views.py URLS
    path('', views.Home.as_view(), name='home'),

    # ! URLS for Creating New Token. 
    path('api/token/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # ! URLS for Registration.
    path('api/admin/register/', views.admin_registration, name='admin_registration'),
    path('api/vendor/register/', views.vendor_registration, name='vendor_registration'),
    path('api/customer/register/', views.customer_registration, name='customer_registration'),
    path('api/mechanic/register/', views.mechanic_registration, name='mechanic_registration'),

    # # ! URLS for Login, Logout.
    path('api/login-via-email/', views.login_via_email, name='login_via_email'),
    path('api/logout/', views.logout_user, name='logout_user'),

    # ! URLS for sign in via phone number.
    path('api/send-otp/login-via-number/', views.send_otp_for_sign_in_via_phone_number, name='send_otp_for_sign_in_via_phone_number'),
    path('api/login-via-number/', views.sign_in_via_phone_number, name='sign_in_via_phone_number'),
    
    # ! URLS for Password Reset.
    path('api/change-password/', views.change_password, name='change_password'),
    path('api/request-password-reset/', views.request_password_reset, name='request_password_reset'),  # Request password reset
    path('api/password-reset/verify-otp/', views.verify_otp_for_reset_password, name='verify_otp_reset_password'),  # Verify OTP for reset
    path('api/reset-password/', views.reset_password_with_token, name='reset_password'),  # Reset password
    
    # ! URLS for Social Login via GMAIL
    path('api/google/login/', views.google_oauth2_login, name='google_oauth2_login'),
    path('api/google/login/callback/', views.sign_in_via_gmail, name='sign_in_via_gmail'),
    
    # ! URLS for Social Login via Facebook
    path('api/facebook/login/', views.facebook_oauth2_callback, name='facebook_oauth2_callback'),

    # ! URLS for User Profile.
    path('api/profile/', views.get_user_profile, name='get_user_profile'),  # Get user profile
    path('api/profile/update/', views.update_user_profile, name='update_user_profile'),  # Update user profile
    
    # ! URLS for Contact Us Form.
    path('api/contact-us/', views.contact_us, name='contact_us'),

    # ! URLS for Admin Login with OTP
    path('api/admin-login-with-otp/', views.admin_login_with_otp, name='admin_login_with_otp'),  # Send OTP to Admin
    path('api/verify-admin-otp/', views.verify_admin_otp, name='verify_admin_otp'),  # Verify Admin OTP and login
]