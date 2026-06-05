from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("assets", "0005_asset_profilepicturekey"),
    ]

    operations = [
        migrations.AddField(
            model_name="asset",
            name="email",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
    ]
