import assets.models
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Asset",
            fields=[
                ("id", models.CharField(max_length=64, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=255)),
                ("initials", models.CharField(blank=True, default="", max_length=16)),
                ("department", models.CharField(db_index=True, max_length=120)),
                ("username", models.CharField(blank=True, default="", max_length=120)),
                ("omadaUsername", models.CharField(blank=True, default="", max_length=255)),
                ("avatarColor", models.CharField(blank=True, default="#64748b", max_length=32)),
                ("dateAsOf", models.CharField(blank=True, default="", max_length=32)),
                ("cpu", models.JSONField(default=assets.models.default_cpu)),
                ("ram", models.JSONField(default=list)),
                ("gpu", models.JSONField(default=list)),
                ("storage", models.JSONField(default=list)),
                ("network", models.JSONField(default=assets.models.default_network)),
                ("peripherals", models.JSONField(default=assets.models.default_peripherals)),
                ("system", models.JSONField(default=assets.models.default_system)),
                ("is_deleted", models.BooleanField(default=False)),
                ("version", models.PositiveIntegerField(default=1)),
            ],
            options={
                "ordering": ["name"],
            },
        ),
    ]
