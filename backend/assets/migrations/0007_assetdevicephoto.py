from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("assets", "0006_asset_email"),
    ]

    operations = [
        migrations.CreateModel(
            name="AssetDevicePhoto",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("objectKey", models.TextField(blank=True, default="")),
                ("position", models.PositiveIntegerField(default=0)),
                ("createdAt", models.DateTimeField(auto_now_add=True)),
                (
                    "asset",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="device_photos",
                        to="assets.asset",
                    ),
                ),
            ],
            options={
                "ordering": ["position", "id"],
            },
        ),
    ]
