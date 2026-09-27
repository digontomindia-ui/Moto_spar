# Import future compatibility features
from __future__ import absolute_import, unicode_literals

# Import standard libraries
import os

# Import Celery and related modules
from celery import Celery

# Set default Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'carpal.settings')

# Create a new Celery instance
app = Celery('carpal')

# Load task modules from all registered Django app configs
app.config_from_object('django.conf:settings', namespace='CELERY')

# Autodiscover tasks in installed apps
app.autodiscover_tasks()