from django.core.exceptions import ObjectDoesNotExist
from django.db import models


def default_cpu() -> dict[str, object]:
    return {"manufacturer": "", "model": "", "cores": 0}


def default_network() -> dict[str, object]:
    return {
        "hostname": "",
        "macAddress": "",
        "dhcp": True,
        "currentIp": "",
        "portNumber": "",
    }


def default_peripherals() -> dict[str, str]:
    return {
        "keyboardBrand": "",
        "keyboardSerialNumber": "",
        "mouseBrand": "",
        "mouseSerialNumber": "",
        "monitor": "",
        "monitorSerialNumber": "",
    }


def default_system() -> dict[str, str]:
    return {"chassisName": "", "motherboardSn": "", "biosSerialNumber": "", "osVersion": ""}


class Asset(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    name = models.CharField(max_length=255)
    initials = models.CharField(max_length=16, default="", blank=True)
    department = models.CharField(max_length=120, db_index=True)
    classification = models.CharField(max_length=32, default="In Use", blank=True)
    email = models.CharField(max_length=255, default="", blank=True)
    username = models.CharField(max_length=120, default="", blank=True)
    omadaUsername = models.CharField(max_length=255, default="", blank=True)
    idTag = models.CharField(max_length=120, default="", blank=True)
    profilePictureKey = models.TextField(default="", blank=True)
    profilePictureUrl = models.TextField(default="", blank=True)
    avatarColor = models.CharField(max_length=32, default="#64748b", blank=True)
    dateAsOf = models.CharField(max_length=32, default="", blank=True)

    is_deleted = models.BooleanField(default=False)
    version = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.id})"

    def related_dict(self, related_name: str, default: dict[str, object]) -> dict[str, object]:
        try:
            related = getattr(self, related_name)
        except ObjectDoesNotExist:
            return default
        return related.to_dict()

    def profile_picture_display_url(self) -> str:
        if not self.profilePictureKey:
            return self.profilePictureUrl

        from .r2_storage import get_profile_picture_url

        return get_profile_picture_url(self.profilePictureKey) or self.profilePictureUrl

    def to_dict(self) -> dict[str, object]:
        profile_picture_original_url = self.profile_picture_display_url()

        return {
            "id": self.id,
            "name": self.name,
            "initials": self.initials,
            "department": self.department,
            "classification": self.classification,
            "email": self.email,
            "username": self.username,
            "omadaUsername": self.omadaUsername,
            "idTag": self.idTag,
            "profilePictureKey": self.profilePictureKey,
            "profilePictureUrl": self.profilePictureUrl,
            "profilePictureOriginalUrl": profile_picture_original_url,
            "avatarColor": self.avatarColor,
            "dateAsOf": self.dateAsOf,
            "cpu": self.related_dict("cpu_spec", default_cpu()),
            "ram": [ram.to_dict() for ram in self.ram_specs.all()],
            "gpu": [gpu.to_dict() for gpu in self.gpu_specs.all()],
            "storage": [storage.to_dict() for storage in self.storage_specs.all()],
            "devicePhotos": [photo.to_dict() for photo in self.device_photos.all()],
            "network": self.related_dict("network_spec", default_network()),
            "peripherals": self.related_dict("peripheral_spec", default_peripherals()),
            "system": self.related_dict("system_spec", default_system()),
        }


class AssetDevicePhoto(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name="device_photos")
    objectKey = models.TextField(default="", blank=True)
    position = models.PositiveIntegerField(default=0)
    createdAt = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["position", "id"]

    def __str__(self) -> str:
        return f"Device photo {self.position} for {self.asset_id}"

    def display_url(self) -> str:
        if not self.objectKey:
            return ""

        from .r2_storage import get_device_photo_url

        return get_device_photo_url(self.objectKey)

    def to_dict(self) -> dict[str, object]:
        return {
            "objectKey": self.objectKey,
            "url": self.display_url(),
        }


class CpuSpec(models.Model):
    asset = models.OneToOneField(
        Asset,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="cpu_spec",
    )
    manufacturer = models.CharField(max_length=255, default="", blank=True)
    model = models.CharField(max_length=255, default="", blank=True)
    cores = models.PositiveIntegerField(default=0)

    def __str__(self) -> str:
        return f"CPU for {self.asset_id}"

    def to_dict(self) -> dict[str, object]:
        return {"manufacturer": self.manufacturer, "model": self.model, "cores": self.cores}


class RamSpec(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name="ram_specs")
    serialNumber = models.CharField(max_length=255, default="", blank=True)
    model = models.CharField(max_length=255, default="", blank=True)
    speed = models.CharField(max_length=120, default="", blank=True)
    totalMemory = models.CharField(max_length=120, default="", blank=True)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["position", "id"]

    def __str__(self) -> str:
        return f"RAM {self.position} for {self.asset_id}"

    def to_dict(self) -> dict[str, object]:
        return {
            "serialNumber": self.serialNumber,
            "model": self.model,
            "speed": self.speed,
            "totalMemory": self.totalMemory,
        }


class GpuSpec(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name="gpu_specs")
    serial = models.CharField(max_length=255, default="", blank=True)
    manufacturer = models.CharField(max_length=255, default="", blank=True)
    model = models.CharField(max_length=255, default="", blank=True)
    ram = models.CharField(max_length=120, default="", blank=True)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["position", "id"]

    def __str__(self) -> str:
        return f"GPU {self.position} for {self.asset_id}"

    def to_dict(self) -> dict[str, object]:
        return {
            "serial": self.serial,
            "manufacturer": self.manufacturer,
            "model": self.model,
            "ram": self.ram,
        }


class StorageSpec(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name="storage_specs")
    serialNumber = models.CharField(max_length=255, default="", blank=True)
    type = models.CharField(max_length=120, default="", blank=True)
    capacity = models.CharField(max_length=120, default="", blank=True)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["position", "id"]

    def __str__(self) -> str:
        return f"Storage {self.position} for {self.asset_id}"

    def to_dict(self) -> dict[str, object]:
        return {
            "serialNumber": self.serialNumber,
            "type": self.type,
            "capacity": self.capacity,
        }


class NetworkSpec(models.Model):
    asset = models.OneToOneField(
        Asset,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="network_spec",
    )
    hostname = models.CharField(max_length=255, default="", blank=True)
    macAddress = models.CharField(max_length=120, default="", blank=True)
    dhcp = models.BooleanField(default=True)
    currentIp = models.CharField(max_length=120, default="", blank=True)
    portNumber = models.CharField(max_length=120, default="", blank=True)

    def __str__(self) -> str:
        return f"Network for {self.asset_id}"

    def to_dict(self) -> dict[str, object]:
        return {
            "hostname": self.hostname,
            "macAddress": self.macAddress,
            "dhcp": self.dhcp,
            "currentIp": self.currentIp,
            "portNumber": self.portNumber,
        }


class PeripheralSpec(models.Model):
    asset = models.OneToOneField(
        Asset,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="peripheral_spec",
    )
    keyboardBrand = models.CharField(max_length=255, default="", blank=True)
    keyboardSerialNumber = models.CharField(max_length=255, default="", blank=True)
    mouseBrand = models.CharField(max_length=255, default="", blank=True)
    mouseSerialNumber = models.CharField(max_length=255, default="", blank=True)
    monitor = models.CharField(max_length=255, default="", blank=True)
    monitorSerialNumber = models.CharField(max_length=255, default="", blank=True)

    def __str__(self) -> str:
        return f"Peripherals for {self.asset_id}"

    def to_dict(self) -> dict[str, object]:
        return {
            "keyboardBrand": self.keyboardBrand,
            "keyboardSerialNumber": self.keyboardSerialNumber,
            "mouseBrand": self.mouseBrand,
            "mouseSerialNumber": self.mouseSerialNumber,
            "monitor": self.monitor,
            "monitorSerialNumber": self.monitorSerialNumber,
        }


class SystemSpec(models.Model):
    asset = models.OneToOneField(
        Asset,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="system_spec",
    )
    chassisName = models.CharField(max_length=255, default="", blank=True)
    motherboardSn = models.CharField(max_length=255, default="", blank=True)
    biosSerialNumber = models.CharField(max_length=255, default="", blank=True)
    osVersion = models.CharField(max_length=255, default="", blank=True)

    def __str__(self) -> str:
        return f"System for {self.asset_id}"

    def to_dict(self) -> dict[str, object]:
        return {
            "chassisName": self.chassisName,
            "motherboardSn": self.motherboardSn,
            "biosSerialNumber": self.biosSerialNumber,
            "osVersion": self.osVersion,
        }
