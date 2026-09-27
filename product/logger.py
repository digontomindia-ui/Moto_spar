#logger.py
import logging
from django.conf import settings

# Get the logger for bulk upload
logger = logging.getLogger('bulk_upload')

def log_info(message):
    """
    Log an info message.
    """
    logger.info(message)

def log_error(message):
    """
    Log an error message.
    """
    logger.error(message)

def log_warning(message):
    """
    Log a warning message.
    """
    logger.warning(message)

def log_debug(message):
    """
    Log a debug message.
    """
    logger.debug(message)