from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("assets", "0002_normalize_asset_specs"),
    ]

    operations = [
        migrations.AddField(
            model_name="asset",
            name="idTag",
            field=models.CharField(blank=True, default="", max_length=120),
        ),
        migrations.AddField(
            model_name="asset",
            name="profilePictureUrl",
            field=models.URLField(blank=True, default="", max_length=1024),
        ),
    ]
