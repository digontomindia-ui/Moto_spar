from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('order', '0002_order_driver_for_me_url'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='checkout_source',
            field=models.CharField(
                choices=[('DIRECT', 'Direct purchase'), ('FROM_CART', 'Cart checkout')],
                default='DIRECT', max_length=16,
            ),
        ),
        migrations.AlterField(
            model_name='orderitem',
            name='order_status',
            field=models.CharField(
                choices=[
                    ('PENDING', 'PENDING'),
                    ('ADMIN_REVIEW', 'ADMIN_REVIEW'),
                    ('ASSIGNED_TO_VENDOR', 'ASSIGNED_TO_VENDOR'),
                    ('VENDOR_ACCEPTED', 'VENDOR_ACCEPTED'),
                    ('DRIVER_FOR_PICK', 'DRIVER_FOR_PICK'),
                    ('DRIVER_FOR_DROP', 'DRIVER_FOR_DROP'),
                    ('WORK_COMPLETED', 'WORK_COMPLETED'),
                    ('DELIVERED', 'DELIVERED'),
                    ('CANCELLED', 'CANCELLED'),
                ], default='PENDING', max_length=20,
            ),
        ),
    ]
