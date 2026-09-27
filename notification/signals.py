from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Notification
from order.models import Order, OrderItem
from mechanic.models import MechanicJob

# ********** Signals for Notification **********
@receiver(post_save, sender=OrderItem)
def handle_order_item_creation(sender, instance, created, **kwargs):
    if created and instance.order.payment_method == 'CASH_ON_DELIVERY':
        # Retrieve all product names for the order
        product_names = [item.variant.product.name for item in instance.order.order_items.all()]
        notification_message = f"Your order has been confirmed with the following product(s): {', '.join(product_names)}. Thank you for shopping with us!"
        
        Notification.objects.create(
            user=instance.order.customer,
            message=notification_message,
            notification_type="ORDER",
            redirect_url="api/customer/orders/"
        )


@receiver(post_save, sender=OrderItem)
def handle_order_item_status_change(sender, instance, created, **kwargs):
    if instance.order_status in ['ASSIGNED_TO_VENDOR', 'VENDOR_ACCEPTED', 'DELIVERED', 'CANCELLED']:
        # Create a notification for the change in order status
        product_name = instance.variant.product.name  # Get the product name from the variant
        notification_message = f"The status of your order for {product_name} has been updated. The new status is: {instance.order_status}. We're working to get it to you soon!"
        
        Notification.objects.create(
            user=instance.order.customer,
            message=notification_message,
            notification_type="ORDER",
            redirect_url="api/customer/orders/"
        )




@receiver(post_save, sender=Order)
def send_driver_otp_notification(sender, instance, created, **kwargs):
    """
    Sends a notification to the customer when the driver's OTP is updated for the order.
    """
    if not created and instance.driver_otp:  # Ensure the order is not newly created and OTP is not empty
        notification_message = f"Your OTP for driver pickup is: {instance.driver_otp}. Please share this with the driver."
        
        Notification.objects.create(
            user=instance.customer,
            message=notification_message,
            notification_type="ORDER",
            redirect_url="api/customer/orders/"
        )


# ? Signals for MechanicJob Notifications
@receiver(post_save, sender=MechanicJob)
def handle_mechanic_job_creation(sender, instance, created, **kwargs):
    """
    Sends a notification to the mechanic when a new mechanic job is created.
    """
    if created and instance.mechanic:
        try:
            order_item = instance.order_item
            product_name = order_item.variant.product.name
            notification_message = (
                f"A new mechanic job has been assigned to you for {product_name}."
                f"Job status: {instance.job_status}. Please review and accept the job."
            )
            
            Notification.objects.create(
                user=instance.mechanic,
                message=notification_message,
                notification_type="MECHANIC_JOB",
                redirect_url="api/mechanic/jobs/view/"
            )
        except (OrderItem.DoesNotExist, AttributeError) as e:
            # Log the error if necessary, but don't raise to avoid breaking the save
            pass


@receiver(post_save, sender=MechanicJob)
def handle_mechanic_job_status_change(sender, instance, created, **kwargs):
    """
    Sends a notification to the mechanic when the job status changes.
    """
    if not created and instance.mechanic and instance.job_status in ['in_progress', 'completed', 'cancelled']:
        try:
            order_item = instance.order_item
            product_name = order_item.variant.product.name
            status_display = dict(MechanicJob.JOB_STATUS_CHOICES).get(instance.job_status, instance.job_status)
            notification_message = (
                f"The status of your mechanic job for {product_name} has been updated to {status_display}."
            )
            
            Notification.objects.create(
                user=instance.mechanic,
                message=notification_message,
                notification_type="MECHANIC_JOB",
                redirect_url="api/mechanic/jobs/view/"
            )
        except (OrderItem.DoesNotExist, AttributeError) as e:
            # Log the error if necessary, but don't raise to avoid breaking the save
            pass


@receiver(post_save, sender=MechanicJob)
def handle_mechanic_job_payment_success(sender, instance, created, **kwargs):
    """
    Sends a notification to the mechanic when payment for the mechanic job is successful.
    """
    if instance.payment_status == 'success' and instance.mechanic:
        try:
            order_item = instance.order_item
            product_name = order_item.variant.product.name
            notification_message = (
                f"Payment of {instance.mechanic_fees} for your mechanic job related to {product_name} "
                f"has been successfully processed."
            )
            
            Notification.objects.create(
                user=instance.mechanic,
                message=notification_message,
                notification_type="PAYMENT",
                redirect_url="api/mechanic/jobs/view/"
            )
        except (OrderItem.DoesNotExist, AttributeError) as e:
            # Log the error if necessary, but don't raise to avoid breaking the save
            pass


@receiver(post_save, sender=MechanicJob)
def handle_mechanic_job_completion(sender, instance, created, **kwargs):
    """
    Sends a notification to the mechanic when the mechanic job is completed.
    """
    if instance.job_status == 'completed' and not created and instance.mechanic:
        try:
            order_item = instance.order_item
            product_name = order_item.variant.product.name
            notification_message = (
                f"Your mechanic job for {product_name} has been successfully completed. "
                f"Thank you for your service!"
            )
            
            Notification.objects.create(
                user=instance.mechanic,
                message=notification_message,
                notification_type="MECHANIC_JOB",
                redirect_url="api/mechanic/jobs/view/"
            )
        except (OrderItem.DoesNotExist, AttributeError) as e:
            # Log the error if necessary, but don't raise to avoid breaking the save
            pass
# ***** =====  END  ===== *****