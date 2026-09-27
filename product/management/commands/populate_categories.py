# Python Standard Library Imports
import uuid

# Django Imports
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

# Local App Imports
from product.models import Category, SubCategory


class Command(BaseCommand):
    help = "Add initial categories and subcategories to the database."

    def handle(self, *args, **kwargs):
        # Data to be inserted
        # categories_data = [
        #     {
        #         "name": "bike",
        #         "description": "All bike-related accessories and parts.",
        #         "subcategories": [
        #             "Head light", "Side view mirrors", "Digital meter", "Bike handles and handle bar",
        #             "Indicators", "Brake and clutch", "Gear shifters", "Rims + Alloy wheels", "Bike chain",
        #             "Leg guard", "Brake pad", "Bike Silencers", "Tail lights", "Chain cover", "Horn",
        #             "Mud guard", "Bike PPF"
        #         ],
        #     },
        #     {
        #         "name": "car",
        #         "description": "All car-related accessories and parts.",
        #         "subcategories": [
        #             "Head lights", "Indicators", "Wiper", "Side view mirrors", "Sound system", "AC filter",
        #             "Wheel", "Alloys", "Steering wheel + cover", "Tail lights", "Bumper guard", "PPF", "Spoilers",
        #             "Glass cover", "Seat covers", "Foot mats", "LED lights for interior", "Stickers", 
        #             "Number plates modification", "Brake oil", "Gear oil", "Fresheners"
        #         ],
        #     },
        # ]

        categories_data = [
            {
                "name": "bike",
                "description": "All bike-related accessories and parts.",
                "image": "https://example.com/images/bike.png",  # <-- add your category image here
                "subcategories": [
                    {"name": "Head light", "image": "https://example.com/images/headlight.png"},
                    {"name": "Side view mirrors", "image": "https://example.com/images/bike_side_mirror.png"},
                    {"name": "Digital meter", "image": ""},
                    {"name": "Bike handles and handle bar", "image": ""},
                    {"name": "Indicators", "image": ""},
                    {"name": "Brake and clutch", "image": ""},
                    {"name": "Gear shifters", "image": ""},
                    {"name": "Rims + Alloy wheels", "image": ""},
                    {"name": "Bike chain", "image": ""},
                    {"name": "Leg guard", "image": ""},
                    {"name": "Brake pad", "image": ""},
                    {"name": "Bike Silencers", "image": ""},
                    {"name": "Tail lights", "image": ""},
                    {"name": "Chain cover", "image": ""},
                    {"name": "Horn", "image": ""},
                    {"name": "Mud guard", "image": ""},
                    {"name": "Bike PPF", "image": ""},
                ],
            },
            {
                "name": "car",
                "description": "All car-related accessories and parts.",
                "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_headlight.png",  # <-- add your category image here
                "subcategories": [
                    {"name": "Head lights", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_headlight.png"},
                    {"name": "Indicators", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_indicarors.png"},
                    {"name": "Wiper", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_wiper.png"},
                    {"name": "Side view mirrors", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_side_view_mirrors.png"},
                    {"name": "Sound system", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_sound_system.png"},
                    {"name": "AC filter", "image": ""},
                    {"name": "Wheel", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_wheel.png"},
                    {"name": "Alloys", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_alloys.png"},
                    {"name": "Steering wheel cover", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_steering_wheel_cover.png"},
                    {"name": "Tail lights", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_tail_lights.png"},
                    {"name": "Bumper guard", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_bumper_guard.png"},
                    {"name": "PPF", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_ppf.png"},
                    {"name": "Spoilers", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_spoilers.png"},
                    {"name": "Glass cover", "image": ""},
                    {"name": "Seat covers", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_seat_covers.png"},
                    {"name": "Foot mats", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_foot_mats.jpg"},
                    {"name": "LED lights for interior", "image": ""},
                    {"name": "Stickers", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_stickers.png"},
                    {"name": "Number plates modification", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_number_plates_modification.png"},
                    {"name": "Brake oil", "image": ""},
                    {"name": "Gear oil", "image": ""},
                    {"name": "Fresheners", "image": ""},
                    {"name": "Side bidding", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_side_bidding.png"},
                    {"name": "Reflector LED", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_reflector_led.png"},
                    {"name": "Fog DRL", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_fog_drl.png"},
                    {"name": "Fog lamp", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_fog_lamp.jpg"},
                    {"name": "Laminational matting", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_laminational_mating.jpg"},
                    {"name": "Door visor", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_door_visor.jpg"},
                    {"name": "Exhaust system", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_exhaust_system.png"},
                    {"name": "Ambient lighting", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_ambient_lighting.jpg"},
                    {"name": "Grille", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/Car_Grille.png"},
                    {"name": "Back connected DRL", "image": "https://motospar-media.s3.ap-south-1.amazonaws.com/car_sub_category/car_back_connected_drl.jpg"}
                ],
            },
        ]

        # Using a transaction to ensure atomicity
        with transaction.atomic():
            for category_data in categories_data:
                # Creating or getting the Category
                category, created = Category.objects.get_or_create(
                    name=slugify(category_data["name"]),
                    defaults={
                        "description": category_data["description"],
                        "is_active": True,
                        "image": category_data.get("image", ""),
                    },
                )
                if not created:
                    # Update image if provided
                    category.description = category_data["description"]
                    if category_data.get("image"):
                        category.image = category_data["image"]
                    category.save()
                    self.stdout.write(self.style.WARNING(f'Category "{category.name}" updated.'))
                else:
                    self.stdout.write(self.style.SUCCESS(f'Category "{category.name}" created successfully.'))

                # Adding SubCategories
                for sub in category_data["subcategories"]:
                    sub_name = sub["name"]
                    sub_image = sub.get("image", "")

                    subcategory, sub_created = SubCategory.objects.get_or_create(
                        category=category,
                        name=slugify(sub_name),
                        defaults={
                            "description": f"{sub_name} for {category.name}",
                            "is_active": True,
                            "image": sub_image,
                        },
                    )
                    if not sub_created:
                        # Update existing subcategory
                        subcategory.description = f"{sub_name} for {category.name}"
                        if sub_image:
                            subcategory.image = sub_image
                        subcategory.save()
                        self.stdout.write(self.style.WARNING(f'  SubCategory "{subcategory.name}" updated under "{category.name}".'))
                    else:
                        self.stdout.write(self.style.SUCCESS(f'  SubCategory "{subcategory.name}" created under "{category.name}".'))