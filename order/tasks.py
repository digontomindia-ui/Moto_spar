from celery import shared_task
from .utils import send_invoice_email
from .models import Order
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_invoice_email_task(order_id):
    """
    Celery task to generate and send invoice email asynchronously.
    """
    try:
        order = Order.objects.get(id=order_id)
        logger.info(f"Starting invoice email task for Order ID: {order_id}")
        
        success = send_invoice_email(order)
        
        if success:
            logger.info(f"Successfully sent invoice email for Order ID: {order_id}")
            return f"Invoice sent for Order {order_id}"
        else:
            logger.warning(f"Failed to send invoice email for Order ID: {order_id}")
            return f"Failed to send invoice for Order {order_id}"
            
    except Order.DoesNotExist:
        logger.error(f"Order with ID {order_id} not found.")
        return f"Order {order_id} not found"
    except Exception as e:
        logger.error(f"Error in send_invoice_email_task for Order ID {order_id}: {e}")
        raise e
