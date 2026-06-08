from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("assets", "0007_assetdevicephoto"),
    ]

    operations = [
        migrations.AddField(
            model_name="systemspec",
            name="chassisName",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
    ]
