from django.db import migrations, models
import product.storage


class Migration(migrations.Migration):

    dependencies = [
        ("product", "0005_productimage_image_file"),
    ]

    operations = [
        migrations.AlterField(
            model_name="productrequestimage",
            name="image",
            field=models.ImageField(
                blank=True,
                null=True,
                storage=product.storage.get_product_image_storage,
                upload_to="product_request_images/",
            ),
        ),
    ]
