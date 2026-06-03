from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("assets", "0003_asset_idtag_asset_profilepictureurl"),
    ]

    operations = [
        migrations.AlterField(
            model_name="asset",
            name="profilePictureUrl",
            field=models.TextField(blank=True, default=""),
        ),
    ]
