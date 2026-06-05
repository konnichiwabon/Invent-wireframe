from django.contrib import admin

from .models import (
    Asset,
    AssetDevicePhoto,
    CpuSpec,
    GpuSpec,
    NetworkSpec,
    PeripheralSpec,
    RamSpec,
    StorageSpec,
    SystemSpec,
)


class CpuSpecInline(admin.StackedInline):
    model = CpuSpec
    extra = 0
    max_num = 1


class NetworkSpecInline(admin.StackedInline):
    model = NetworkSpec
    extra = 0
    max_num = 1


class PeripheralSpecInline(admin.StackedInline):
    model = PeripheralSpec
    extra = 0
    max_num = 1


class SystemSpecInline(admin.StackedInline):
    model = SystemSpec
    extra = 0
    max_num = 1


class RamSpecInline(admin.TabularInline):
    model = RamSpec
    extra = 0


class GpuSpecInline(admin.TabularInline):
    model = GpuSpec
    extra = 0


class StorageSpecInline(admin.TabularInline):
    model = StorageSpec
    extra = 0


class AssetDevicePhotoInline(admin.TabularInline):
    model = AssetDevicePhoto
    extra = 0
    readonly_fields = ("createdAt",)


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "idTag", "department", "email", "username", "is_deleted", "version")
    list_filter = ("department", "is_deleted")
    search_fields = ("id", "name", "idTag", "email", "username", "omadaUsername")
    readonly_fields = ("version",)
    inlines = [
        CpuSpecInline,
        RamSpecInline,
        GpuSpecInline,
        StorageSpecInline,
        AssetDevicePhotoInline,
        NetworkSpecInline,
        PeripheralSpecInline,
        SystemSpecInline,
    ]
