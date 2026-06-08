from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("assets", "0008_systemspec_chassisname"),
    ]

    operations = [
        migrations.AddField(
            model_name="peripheralspec",
            name="keyboardSerialNumber",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="peripheralspec",
            name="mouseSerialNumber",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="peripheralspec",
            name="monitorSerialNumber",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
    ]
