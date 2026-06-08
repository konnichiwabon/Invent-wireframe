from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("assets", "0010_cpuspec_manufacturer"),
    ]

    operations = [
        migrations.AddField(
            model_name="asset",
            name="classification",
            field=models.CharField(blank=True, default="In Use", max_length=32),
        ),
    ]
