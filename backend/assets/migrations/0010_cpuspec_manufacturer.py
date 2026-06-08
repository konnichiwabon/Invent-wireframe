from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("assets", "0009_peripheralspec_serial_numbers"),
    ]

    operations = [
        migrations.AddField(
            model_name="cpuspec",
            name="manufacturer",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
    ]
