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
from django.contrib import admin
from django.urls import path, include

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("esrotlabs/", admin.site.urls),

    # app-specific URLs
    path('', include('analytics.urls', namespace='analytics')),
    path('', include('app.urls', namespace='app')),
    path('', include('cart.urls', namespace='cart')),
    path('', include('coupon.urls', namespace='coupon')),
    path('', include('driver.urls', namespace='driver')),
    path('', include('mechanic.urls', namespace='mechanic')),
    path('', include('notification.urls', namespace='notification')),
    path('', include('order.urls', namespace='order')),
    path('', include('payment.urls', namespace='payment')),
    path('', include('product.urls', namespace='product')),
    path('', include('review.urls', namespace='review')),
    path('', include('shipping.urls', namespace='shipping')),
    path('', include('vendor.urls', namespace='vendor')),
    path('', include('wishlist.urls', namespace='wishlist')),

    # Django Rest Framework URLs
    path('api-auth/', include('rest_framework.urls')),

    # Allauth URLs
    path('auth/', include('allauth.urls')),
    path('auth/social/', include('allauth.socialaccount.urls')),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



#manish test