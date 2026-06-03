import django.db.models.deletion
from django.db import migrations, models


def as_dict(value):
    return value if isinstance(value, dict) else {}


def as_list(value):
    return value if isinstance(value, list) else []


def clean_string(data, key, default=""):
    value = as_dict(data).get(key, default)
    return value if isinstance(value, str) else default


def clean_int(data, key, default=0):
    value = as_dict(data).get(key, default)
    return value if isinstance(value, int) and not isinstance(value, bool) else default


def clean_bool(data, key, default=False):
    value = as_dict(data).get(key, default)
    return value if isinstance(value, bool) else default


def normalize_cpu(data):
    return {
        "model": clean_string(data, "model"),
        "cores": clean_int(data, "cores"),
    }


def normalize_ram(data):
    return {
        "serialNumber": clean_string(data, "serialNumber"),
        "model": clean_string(data, "model"),
        "speed": clean_string(data, "speed"),
        "totalMemory": clean_string(data, "totalMemory"),
    }


def normalize_gpu(data):
    return {
        "serial": clean_string(data, "serial"),
        "manufacturer": clean_string(data, "manufacturer"),
        "model": clean_string(data, "model"),
        "ram": clean_string(data, "ram"),
    }


def normalize_storage(data):
    return {
        "serialNumber": clean_string(data, "serialNumber"),
        "type": clean_string(data, "type"),
        "capacity": clean_string(data, "capacity"),
    }


def normalize_network(data):
    return {
        "hostname": clean_string(data, "hostname"),
        "macAddress": clean_string(data, "macAddress"),
        "dhcp": clean_bool(data, "dhcp", True),
        "currentIp": clean_string(data, "currentIp"),
        "portNumber": clean_string(data, "portNumber"),
    }


def normalize_peripherals(data):
    return {
        "keyboardBrand": clean_string(data, "keyboardBrand"),
        "mouseBrand": clean_string(data, "mouseBrand"),
        "monitor": clean_string(data, "monitor"),
    }


def normalize_system(data):
    return {
        "motherboardSn": clean_string(data, "motherboardSn"),
        "biosSerialNumber": clean_string(data, "biosSerialNumber"),
        "osVersion": clean_string(data, "osVersion"),
    }


def normalize_existing_specs(apps, schema_editor):
    Asset = apps.get_model("assets", "Asset")
    CpuSpec = apps.get_model("assets", "CpuSpec")
    RamSpec = apps.get_model("assets", "RamSpec")
    GpuSpec = apps.get_model("assets", "GpuSpec")
    StorageSpec = apps.get_model("assets", "StorageSpec")
    NetworkSpec = apps.get_model("assets", "NetworkSpec")
    PeripheralSpec = apps.get_model("assets", "PeripheralSpec")
    SystemSpec = apps.get_model("assets", "SystemSpec")

    for asset in Asset.objects.all().iterator():
        CpuSpec.objects.update_or_create(
            asset_id=asset.id,
            defaults=normalize_cpu(asset.cpu),
        )
        NetworkSpec.objects.update_or_create(
            asset_id=asset.id,
            defaults=normalize_network(asset.network),
        )
        PeripheralSpec.objects.update_or_create(
            asset_id=asset.id,
            defaults=normalize_peripherals(asset.peripherals),
        )
        SystemSpec.objects.update_or_create(
            asset_id=asset.id,
            defaults=normalize_system(asset.system),
        )

        RamSpec.objects.bulk_create(
            [
                RamSpec(asset_id=asset.id, position=index, **normalize_ram(spec))
                for index, spec in enumerate(as_list(asset.ram))
                if isinstance(spec, dict)
            ]
        )
        GpuSpec.objects.bulk_create(
            [
                GpuSpec(asset_id=asset.id, position=index, **normalize_gpu(spec))
                for index, spec in enumerate(as_list(asset.gpu))
                if isinstance(spec, dict)
            ]
        )
        StorageSpec.objects.bulk_create(
            [
                StorageSpec(asset_id=asset.id, position=index, **normalize_storage(spec))
                for index, spec in enumerate(as_list(asset.storage))
                if isinstance(spec, dict)
            ]
        )


def restore_json_specs(apps, schema_editor):
    Asset = apps.get_model("assets", "Asset")
    CpuSpec = apps.get_model("assets", "CpuSpec")
    RamSpec = apps.get_model("assets", "RamSpec")
    GpuSpec = apps.get_model("assets", "GpuSpec")
    StorageSpec = apps.get_model("assets", "StorageSpec")
    NetworkSpec = apps.get_model("assets", "NetworkSpec")
    PeripheralSpec = apps.get_model("assets", "PeripheralSpec")
    SystemSpec = apps.get_model("assets", "SystemSpec")

    for asset in Asset.objects.all().iterator():
        cpu = CpuSpec.objects.filter(asset_id=asset.id).first()
        network = NetworkSpec.objects.filter(asset_id=asset.id).first()
        peripherals = PeripheralSpec.objects.filter(asset_id=asset.id).first()
        system = SystemSpec.objects.filter(asset_id=asset.id).first()

        asset.cpu = normalize_cpu(cpu.__dict__ if cpu else {})
        asset.network = normalize_network(network.__dict__ if network else {})
        asset.peripherals = normalize_peripherals(peripherals.__dict__ if peripherals else {})
        asset.system = normalize_system(system.__dict__ if system else {})
        asset.ram = [
            normalize_ram(spec.__dict__)
            for spec in RamSpec.objects.filter(asset_id=asset.id).order_by("position", "id")
        ]
        asset.gpu = [
            normalize_gpu(spec.__dict__)
            for spec in GpuSpec.objects.filter(asset_id=asset.id).order_by("position", "id")
        ]
        asset.storage = [
            normalize_storage(spec.__dict__)
            for spec in StorageSpec.objects.filter(asset_id=asset.id).order_by("position", "id")
        ]
        asset.save(
            update_fields=[
                "cpu",
                "ram",
                "gpu",
                "storage",
                "network",
                "peripherals",
                "system",
            ]
        )


class Migration(migrations.Migration):
    dependencies = [
        ("assets", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="CpuSpec",
            fields=[
                (
                    "asset",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        primary_key=True,
                        related_name="cpu_spec",
                        serialize=False,
                        to="assets.asset",
                    ),
                ),
                ("model", models.CharField(blank=True, default="", max_length=255)),
                ("cores", models.PositiveIntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name="NetworkSpec",
            fields=[
                (
                    "asset",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        primary_key=True,
                        related_name="network_spec",
                        serialize=False,
                        to="assets.asset",
                    ),
                ),
                ("hostname", models.CharField(blank=True, default="", max_length=255)),
                ("macAddress", models.CharField(blank=True, default="", max_length=120)),
                ("dhcp", models.BooleanField(default=True)),
                ("currentIp", models.CharField(blank=True, default="", max_length=120)),
                ("portNumber", models.CharField(blank=True, default="", max_length=120)),
            ],
        ),
        migrations.CreateModel(
            name="PeripheralSpec",
            fields=[
                (
                    "asset",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        primary_key=True,
                        related_name="peripheral_spec",
                        serialize=False,
                        to="assets.asset",
                    ),
                ),
                ("keyboardBrand", models.CharField(blank=True, default="", max_length=255)),
                ("mouseBrand", models.CharField(blank=True, default="", max_length=255)),
                ("monitor", models.CharField(blank=True, default="", max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name="SystemSpec",
            fields=[
                (
                    "asset",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        primary_key=True,
                        related_name="system_spec",
                        serialize=False,
                        to="assets.asset",
                    ),
                ),
                ("motherboardSn", models.CharField(blank=True, default="", max_length=255)),
                ("biosSerialNumber", models.CharField(blank=True, default="", max_length=255)),
                ("osVersion", models.CharField(blank=True, default="", max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name="RamSpec",
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
                ("serialNumber", models.CharField(blank=True, default="", max_length=255)),
                ("model", models.CharField(blank=True, default="", max_length=255)),
                ("speed", models.CharField(blank=True, default="", max_length=120)),
                ("totalMemory", models.CharField(blank=True, default="", max_length=120)),
                ("position", models.PositiveIntegerField(default=0)),
                (
                    "asset",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="ram_specs",
                        to="assets.asset",
                    ),
                ),
            ],
            options={
                "ordering": ["position", "id"],
            },
        ),
        migrations.CreateModel(
            name="GpuSpec",
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
                ("serial", models.CharField(blank=True, default="", max_length=255)),
                ("manufacturer", models.CharField(blank=True, default="", max_length=255)),
                ("model", models.CharField(blank=True, default="", max_length=255)),
                ("ram", models.CharField(blank=True, default="", max_length=120)),
                ("position", models.PositiveIntegerField(default=0)),
                (
                    "asset",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="gpu_specs",
                        to="assets.asset",
                    ),
                ),
            ],
            options={
                "ordering": ["position", "id"],
            },
        ),
        migrations.CreateModel(
            name="StorageSpec",
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
                ("serialNumber", models.CharField(blank=True, default="", max_length=255)),
                ("type", models.CharField(blank=True, default="", max_length=120)),
                ("capacity", models.CharField(blank=True, default="", max_length=120)),
                ("position", models.PositiveIntegerField(default=0)),
                (
                    "asset",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="storage_specs",
                        to="assets.asset",
                    ),
                ),
            ],
            options={
                "ordering": ["position", "id"],
            },
        ),
        migrations.RunPython(normalize_existing_specs, restore_json_specs),
        migrations.RemoveField(model_name="asset", name="cpu"),
        migrations.RemoveField(model_name="asset", name="gpu"),
        migrations.RemoveField(model_name="asset", name="network"),
        migrations.RemoveField(model_name="asset", name="peripherals"),
        migrations.RemoveField(model_name="asset", name="ram"),
        migrations.RemoveField(model_name="asset", name="storage"),
        migrations.RemoveField(model_name="asset", name="system"),
    ]
