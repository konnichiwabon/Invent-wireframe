import json
from json import JSONDecodeError
from typing import Any, Callable

from django.db import models, transaction
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

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
    default_cpu,
    default_network,
    default_peripherals,
    default_system,
)
from .r2_storage import (
    R2StorageError,
    delete_device_photo,
    delete_profile_picture,
    get_profile_picture_url,
    upload_device_photo,
    upload_profile_picture,
)


ASSET_SCALAR_FIELDS = [
    "id",
    "name",
    "initials",
    "department",
    "email",
    "username",
    "omadaUsername",
    "idTag",
    "avatarColor",
    "dateAsOf",
]

ONE_TO_ONE_SPECS = [
    (CpuSpec, "cpu"),
    (NetworkSpec, "network"),
    (PeripheralSpec, "peripherals"),
    (SystemSpec, "system"),
]

CHILD_SPECS = [
    (RamSpec, "ram"),
    (GpuSpec, "gpu"),
    (StorageSpec, "storage"),
]


class ApiError(Exception):
    def __init__(self, status: int, detail: str) -> None:
        self.status = status
        self.detail = detail


def health(request: HttpRequest) -> JsonResponse:
    if request.method != "GET":
        return JsonResponse({"detail": "Method not allowed"}, status=405)
    return JsonResponse({"status": "ok"})


def error_response(error: ApiError) -> JsonResponse:
    return JsonResponse({"detail": error.detail}, status=error.status)


def read_json(request: HttpRequest) -> dict[str, Any]:
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except JSONDecodeError as exc:
        raise ApiError(400, "Request body must be valid JSON") from exc

    if not isinstance(payload, dict):
        raise ApiError(400, "Request body must be a JSON object")

    return payload


def require_string(payload: dict[str, Any], field: str) -> str:
    value = payload.get(field)
    if not isinstance(value, str) or not value.strip():
        raise ApiError(400, f"{field} is required")
    return value


def optional_string(payload: dict[str, Any], field: str, default: str = "") -> str:
    value = payload.get(field, default)
    if value is None:
        return default
    if not isinstance(value, str):
        raise ApiError(400, f"{field} must be a string")
    return value


def optional_int(payload: dict[str, Any], field: str, default: int = 0) -> int:
    value = payload.get(field, default)
    if value is None:
        return default
    if isinstance(value, bool) or not isinstance(value, int):
        raise ApiError(400, f"{field} must be an integer")
    return value


def optional_bool(payload: dict[str, Any], field: str, default: bool = False) -> bool:
    value = payload.get(field, default)
    if value is None:
        return default
    if not isinstance(value, bool):
        raise ApiError(400, f"{field} must be a boolean")
    return value


def optional_object(
    payload: dict[str, Any],
    field: str,
    default: dict[str, object],
) -> dict[str, Any]:
    value = payload.get(field, default)
    if value is None:
        return default
    if not isinstance(value, dict):
        raise ApiError(400, f"{field} must be an object")
    return value


def optional_list(payload: dict[str, Any], field: str) -> list[object]:
    value = payload.get(field, [])
    if value is None:
        return []
    if not isinstance(value, list):
        raise ApiError(400, f"{field} must be an array")
    return value


def normalize_cpu(payload: dict[str, Any]) -> dict[str, object]:
    return {
        "manufacturer": optional_string(payload, "manufacturer"),
        "model": optional_string(payload, "model"),
        "cores": optional_int(payload, "cores"),
    }


def normalize_ram(payload: dict[str, Any]) -> dict[str, object]:
    return {
        "serialNumber": optional_string(payload, "serialNumber"),
        "model": optional_string(payload, "model"),
        "speed": optional_string(payload, "speed"),
        "totalMemory": optional_string(payload, "totalMemory"),
    }


def normalize_gpu(payload: dict[str, Any]) -> dict[str, object]:
    return {
        "serial": optional_string(payload, "serial"),
        "manufacturer": optional_string(payload, "manufacturer"),
        "model": optional_string(payload, "model"),
        "ram": optional_string(payload, "ram"),
    }


def normalize_storage(payload: dict[str, Any]) -> dict[str, object]:
    return {
        "serialNumber": optional_string(payload, "serialNumber"),
        "type": optional_string(payload, "type"),
        "capacity": optional_string(payload, "capacity"),
    }


def normalize_network(payload: dict[str, Any]) -> dict[str, object]:
    return {
        "hostname": optional_string(payload, "hostname"),
        "macAddress": optional_string(payload, "macAddress"),
        "dhcp": optional_bool(payload, "dhcp", True),
        "currentIp": optional_string(payload, "currentIp"),
        "portNumber": optional_string(payload, "portNumber"),
    }


def normalize_peripherals(payload: dict[str, Any]) -> dict[str, object]:
    return {
        "keyboardBrand": optional_string(payload, "keyboardBrand"),
        "keyboardSerialNumber": optional_string(payload, "keyboardSerialNumber"),
        "mouseBrand": optional_string(payload, "mouseBrand"),
        "mouseSerialNumber": optional_string(payload, "mouseSerialNumber"),
        "monitor": optional_string(payload, "monitor"),
        "monitorSerialNumber": optional_string(payload, "monitorSerialNumber"),
    }


def normalize_system(payload: dict[str, Any]) -> dict[str, object]:
    return {
        "chassisName": optional_string(payload, "chassisName"),
        "motherboardSn": optional_string(payload, "motherboardSn"),
        "biosSerialNumber": optional_string(payload, "biosSerialNumber"),
        "osVersion": optional_string(payload, "osVersion"),
    }


def normalize_spec_object(
    payload: dict[str, Any],
    field: str,
    default: dict[str, object],
    normalizer: Callable[[dict[str, Any]], dict[str, object]],
) -> dict[str, object]:
    return normalizer(optional_object(payload, field, default))


def normalize_spec_list(
    payload: dict[str, Any],
    field: str,
    normalizer: Callable[[dict[str, Any]], dict[str, object]],
) -> list[dict[str, object]]:
    normalized = []
    for index, item in enumerate(optional_list(payload, field)):
        if not isinstance(item, dict):
            raise ApiError(400, f"{field}[{index}] must be an object")
        normalized.append(normalizer(item))
    return normalized


def normalize_device_photo(payload: dict[str, Any]) -> dict[str, str]:
    return {
        "objectKey": optional_string(payload, "objectKey"),
        "url": optional_string(payload, "url"),
        "uploadData": optional_string(payload, "uploadData"),
    }


def normalize_asset_payload(payload: dict[str, Any]) -> dict[str, Any]:
    asset_id = require_string(payload, "id")
    name = require_string(payload, "name")
    department = require_string(payload, "department")

    return {
        "id": asset_id,
        "name": name,
        "initials": optional_string(payload, "initials"),
        "department": department,
        "email": optional_string(payload, "email"),
        "username": optional_string(payload, "username"),
        "omadaUsername": optional_string(payload, "omadaUsername"),
        "idTag": optional_string(payload, "idTag"),
        "profilePictureKey": optional_string(payload, "profilePictureKey"),
        "profilePictureUrl": optional_string(payload, "profilePictureUrl"),
        "profilePictureUploadData": optional_string(payload, "profilePictureUploadData"),
        "avatarColor": optional_string(payload, "avatarColor", "#64748b"),
        "dateAsOf": optional_string(payload, "dateAsOf"),
        "cpu": normalize_spec_object(payload, "cpu", default_cpu(), normalize_cpu),
        "ram": normalize_spec_list(payload, "ram", normalize_ram),
        "gpu": normalize_spec_list(payload, "gpu", normalize_gpu),
        "storage": normalize_spec_list(payload, "storage", normalize_storage),
        "devicePhotos": normalize_spec_list(payload, "devicePhotos", normalize_device_photo),
        "network": normalize_spec_object(
            payload,
            "network",
            default_network(),
            normalize_network,
        ),
        "peripherals": normalize_spec_object(
            payload,
            "peripherals",
            default_peripherals(),
            normalize_peripherals,
        ),
        "system": normalize_spec_object(payload, "system", default_system(), normalize_system),
    }


def asset_queryset() -> models.QuerySet[Asset]:
    return Asset.objects.select_related(
        "cpu_spec",
        "network_spec",
        "peripheral_spec",
        "system_spec",
    ).prefetch_related("ram_specs", "gpu_specs", "storage_specs", "device_photos")


def set_asset_scalars(asset: Asset, payload: dict[str, Any]) -> None:
    for field in ASSET_SCALAR_FIELDS:
        setattr(asset, field, payload[field])


def save_profile_picture(
    asset: Asset,
    profile_picture_value: str,
    profile_picture_key: str = "",
    profile_picture_upload_data: str = "",
) -> None:
    value = profile_picture_value.strip()
    provided_key = profile_picture_key.strip()
    upload_value = profile_picture_upload_data.strip()
    old_key = asset.profilePictureKey

    if upload_value:
        asset.profilePictureKey = upload_profile_picture(asset.id, upload_value)
        asset.profilePictureUrl = value
        asset.save(update_fields=["profilePictureKey", "profilePictureUrl"])
        delete_profile_picture(old_key)
        return

    if provided_key:
        asset.profilePictureKey = provided_key
        asset.profilePictureUrl = value
        asset.save(update_fields=["profilePictureKey", "profilePictureUrl"])
        if provided_key != old_key:
            delete_profile_picture(old_key)
        return

    if not value:
        asset.profilePictureKey = ""
        asset.profilePictureUrl = ""
        asset.save(update_fields=["profilePictureKey", "profilePictureUrl"])
        delete_profile_picture(old_key)
        return

    asset.profilePictureUrl = value
    asset.save(update_fields=["profilePictureUrl"])


def save_one_to_one_spec(
    model: type[models.Model],
    asset: Asset,
    payload: dict[str, object],
) -> None:
    model.objects.update_or_create(asset=asset, defaults=payload)


def replace_child_specs(
    model: type[models.Model],
    asset: Asset,
    payloads: list[dict[str, object]],
) -> None:
    model.objects.filter(asset=asset).delete()
    model.objects.bulk_create(
        [
            model(asset=asset, position=index, **payload)
            for index, payload in enumerate(payloads)
        ]
    )


def save_asset_specs(asset: Asset, payload: dict[str, Any]) -> None:
    for model, field in ONE_TO_ONE_SPECS:
        save_one_to_one_spec(model, asset, payload[field])

    for model, field in CHILD_SPECS:
        replace_child_specs(model, asset, payload[field])


def save_device_photos(asset: Asset, payloads: list[dict[str, str]]) -> None:
    old_keys = list(asset.device_photos.values_list("objectKey", flat=True))
    desired_keys = []

    for payload in payloads:
        upload_data = payload["uploadData"].strip()
        object_key = payload["objectKey"].strip()

        if upload_data:
            desired_keys.append(upload_device_photo(asset.id, upload_data))
            continue

        if object_key:
            desired_keys.append(object_key)

    AssetDevicePhoto.objects.filter(asset=asset).delete()
    AssetDevicePhoto.objects.bulk_create(
        [
            AssetDevicePhoto(asset=asset, objectKey=object_key, position=index)
            for index, object_key in enumerate(desired_keys)
        ]
    )

    desired_key_set = set(desired_keys)
    for old_key in old_keys:
        if old_key not in desired_key_set:
            delete_device_photo(old_key)


@csrf_exempt
def assets_collection(request: HttpRequest) -> HttpResponse:
    if request.method == "GET":
        assets = asset_queryset().filter(is_deleted=False).order_by("name")
        return JsonResponse([asset.to_dict() for asset in assets], safe=False)

    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed"}, status=405)

    try:
        payload = normalize_asset_payload(read_json(request))
    except ApiError as error:
        return error_response(error)

    with transaction.atomic():
        try:
            existing_asset = Asset.objects.select_for_update().filter(id=payload["id"]).first()
            if existing_asset and not existing_asset.is_deleted:
                return JsonResponse(
                    {"detail": "Asset with this ID already exists"},
                    status=409,
                )

            if existing_asset:
                set_asset_scalars(existing_asset, payload)
                existing_asset.is_deleted = False
                existing_asset.version += 1
                existing_asset.save()
                save_profile_picture(
                    existing_asset,
                    payload["profilePictureUrl"],
                    payload["profilePictureKey"],
                    payload["profilePictureUploadData"],
                )
                save_asset_specs(existing_asset, payload)
                save_device_photos(existing_asset, payload["devicePhotos"])
                saved_asset = asset_queryset().get(id=existing_asset.id)
                return JsonResponse(saved_asset.to_dict(), status=201)

            asset = Asset()
            set_asset_scalars(asset, payload)
            asset.save()
            save_profile_picture(
                asset,
                payload["profilePictureUrl"],
                payload["profilePictureKey"],
                payload["profilePictureUploadData"],
            )
            save_asset_specs(asset, payload)
            save_device_photos(asset, payload["devicePhotos"])
            saved_asset = asset_queryset().get(id=asset.id)
            return JsonResponse(saved_asset.to_dict(), status=201)
        except R2StorageError as error:
            transaction.set_rollback(True)
            return JsonResponse({"detail": str(error)}, status=502)


@csrf_exempt
def asset_profile_picture(request: HttpRequest, asset_id: str) -> HttpResponse:
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed"}, status=405)

    try:
        payload = read_json(request)
        profile_picture_data = require_string(payload, "profilePictureData")
        profile_picture_key = upload_profile_picture(asset_id, profile_picture_data)
    except ApiError as error:
        return error_response(error)
    except R2StorageError as error:
        return JsonResponse({"detail": str(error)}, status=502)

    asset = Asset.objects.filter(id=asset_id, is_deleted=False).first()
    if asset:
        old_key = asset.profilePictureKey
        asset.profilePictureKey = profile_picture_key
        asset.profilePictureUrl = ""
        asset.version += 1
        asset.save(update_fields=["profilePictureKey", "profilePictureUrl", "version"])
        delete_profile_picture(old_key)

    return JsonResponse(
        {
            "profilePictureKey": profile_picture_key,
            "profilePictureUrl": get_profile_picture_url(profile_picture_key),
        },
        status=201,
    )


@csrf_exempt
def asset_detail(request: HttpRequest, asset_id: str) -> HttpResponse:
    asset = asset_queryset().filter(id=asset_id, is_deleted=False).first()

    if request.method == "GET":
        if asset is None:
            return JsonResponse({"detail": "Asset not found"}, status=404)
        return JsonResponse(asset.to_dict())

    if request.method == "PUT":
        if asset is None:
            return JsonResponse({"detail": "Asset not found"}, status=404)

        try:
            payload = normalize_asset_payload(read_json(request))
        except ApiError as error:
            return error_response(error)

        if payload["id"] != asset_id:
            return JsonResponse(
                {"detail": "Path asset ID must match request body asset ID"},
                status=400,
            )

        with transaction.atomic():
            try:
                set_asset_scalars(asset, payload)
                asset.version += 1
                asset.save()
                save_profile_picture(
                    asset,
                    payload["profilePictureUrl"],
                    payload["profilePictureKey"],
                    payload["profilePictureUploadData"],
                )
                save_asset_specs(asset, payload)
                save_device_photos(asset, payload["devicePhotos"])
            except R2StorageError as error:
                transaction.set_rollback(True)
                return JsonResponse({"detail": str(error)}, status=502)

        saved_asset = asset_queryset().get(id=asset.id)
        return JsonResponse(saved_asset.to_dict())

    if request.method == "DELETE":
        if asset is None:
            return JsonResponse({"detail": "Asset not found"}, status=404)
        asset.is_deleted = True
        asset.version += 1
        asset.save(update_fields=["is_deleted", "version"])
        return HttpResponse(status=204)

    return JsonResponse({"detail": "Method not allowed"}, status=405)
