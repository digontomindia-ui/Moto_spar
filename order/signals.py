from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order, OrderItem
from .tasks import send_invoice_email_task

@receiver(post_save, sender=OrderItem)
def handle_order_item_status_change_invoice(sender, instance, created, **kwargs):
    """
    Triggers invoice email when an item is delivered, provided all other items are also delivered 
    and payment is successful.
    """
    # Only check if status is DELIVERED
    if instance.order_status == 'DELIVERED':
        order = instance.order
        
        # Check if all items are delivered (excluding cancelled)
        # We check if there are ANY items that are NOT (DELIVERED or CANCELLED)
        pending_items_exist = order.order_items.exclude(order_status__in=['DELIVERED', 'CANCELLED']).exists()
        
        if not pending_items_exist:
            # All items are delivered. Now check payment.
            all_items_paid = not order.order_items.exclude(payment_status='SUCCESS').exclude(order_status='CANCELLED').exists()
            if order.payment_status == 'SUCCESS' or all_items_paid:
                send_invoice_email_task.delay(order.id)
            elif order.payment_method == 'CASH_ON_DELIVERY':
                # For COD, sometimes payment status update might lag or be handled differently.
                # If we assume Delivery = Payment for COD, we might send it here.
                # But safer to rely on payment_status='SUCCESS'.
                # Checking if all items have payment_status='SUCCESS' is also an option if Order status isn't reliable.
                if all_items_paid:
                     send_invoice_email_task.delay(order.id)

@receiver(post_save, sender=OrderItem)
def handle_payment_success_invoice(sender, instance, created, **kwargs):
    """
    Triggers invoice email when payment is successful, provided all items are delivered.
    """
    if instance.payment_status == 'SUCCESS':
        order = instance.order
        
        # Check if all items are delivered
        pending_items_exist = order.order_items.exclude(order_status__in=['DELIVERED', 'CANCELLED']).exists()
        
        if not pending_items_exist:
             # Check if Order is fully paid or if this was the last payment?
             all_items_paid = not order.order_items.exclude(payment_status='SUCCESS').exclude(order_status='CANCELLED').exists()
             if order.payment_method == 'PAYMENT_GATEWAY':
                 if order.payment_status == 'SUCCESS' or all_items_paid:
                     send_invoice_email_task.delay(order.id)
             elif order.payment_method == 'CASH_ON_DELIVERY':
                 if all_items_paid:
                     send_invoice_email_task.delay(order.id)
