from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("assets", "0004_alter_asset_profilepictureurl"),
    ]

    operations = [
        migrations.AddField(
            model_name="asset",
            name="profilePictureKey",
            field=models.TextField(blank=True, default=""),
        ),
    ]
