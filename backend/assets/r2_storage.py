import base64
import binascii
import re
from uuid import uuid4
from urllib.parse import quote

from django.conf import settings


DATA_IMAGE_PATTERN = re.compile(r"^data:(image/(?:jpeg|jpg|png|webp));base64,(.+)$", re.DOTALL)
EXTENSIONS_BY_MIME_TYPE = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}


class R2StorageError(Exception):
    pass


def is_profile_picture_upload(value: str) -> bool:
    return bool(DATA_IMAGE_PATTERN.match(value.strip()))


def r2_is_configured() -> bool:
    return all(
        [
            settings.R2_BUCKET_NAME,
            settings.R2_ACCESS_KEY_ID,
            settings.R2_SECRET_ACCESS_KEY,
            settings.R2_ENDPOINT_URL,
        ]
    )


def get_r2_client():
    if not r2_is_configured():
        raise R2StorageError("Cloudflare R2 storage is not configured.")

    try:
        import boto3
    except ImportError as exc:
        raise R2StorageError("boto3 is required for Cloudflare R2 uploads.") from exc

    return boto3.client(
        "s3",
        endpoint_url=settings.R2_ENDPOINT_URL,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        region_name="auto",
    )


def decode_data_image(
    data_url: str,
    label: str = "Image",
    max_bytes: int | None = None,
) -> tuple[str, bytes]:
    match = DATA_IMAGE_PATTERN.match(data_url.strip())
    if not match:
        raise R2StorageError(f"{label} must be a JPEG, PNG, or WebP image.")

    mime_type, encoded_body = match.groups()

    try:
        body = base64.b64decode(encoded_body, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise R2StorageError(f"{label} data is invalid.") from exc

    if max_bytes is not None and len(body) > max_bytes:
        raise R2StorageError(f"{label} is too large.")

    return mime_type, body


def upload_r2_image(asset_id: str, data_url: str, prefix: str, label: str, max_bytes: int) -> str:
    mime_type, body = decode_data_image(data_url, label, max_bytes)
    extension = EXTENSIONS_BY_MIME_TYPE[mime_type]
    object_prefix = prefix.strip("/")
    object_key = f"{object_prefix}/{asset_id}/{uuid4().hex}.{extension}"

    try:
        get_r2_client().put_object(
            Bucket=settings.R2_BUCKET_NAME,
            Key=object_key,
            Body=body,
            ContentType=mime_type,
        )
    except Exception as exc:
        raise R2StorageError(f"Unable to upload {label.lower()} to Cloudflare R2.") from exc

    return object_key


def upload_profile_picture(asset_id: str, data_url: str) -> str:
    return upload_r2_image(
        asset_id,
        data_url,
        settings.R2_PROFILE_PICTURE_PREFIX,
        "Profile picture",
        settings.R2_MAX_PROFILE_IMAGE_BYTES,
    )


def upload_device_photo(asset_id: str, data_url: str) -> str:
    return upload_r2_image(
        asset_id,
        data_url,
        settings.R2_DEVICE_PHOTO_PREFIX,
        "Device photo",
        settings.R2_MAX_DEVICE_PHOTO_BYTES,
    )


def delete_r2_object(object_key: str) -> None:
    if not object_key or not r2_is_configured():
        return

    try:
        get_r2_client().delete_object(
            Bucket=settings.R2_BUCKET_NAME,
            Key=object_key,
        )
    except Exception:
        # Do not fail an asset save/delete because cleanup of an old image failed.
        return


def delete_profile_picture(object_key: str) -> None:
    delete_r2_object(object_key)


def delete_device_photo(object_key: str) -> None:
    delete_r2_object(object_key)


def get_r2_object_url(object_key: str) -> str:
    if not object_key:
        return ""

    if settings.R2_PUBLIC_BASE_URL:
        return f"{settings.R2_PUBLIC_BASE_URL.rstrip('/')}/{quote(object_key, safe='/')}"

    try:
        return get_r2_client().generate_presigned_url(
            "get_object",
            Params={
                "Bucket": settings.R2_BUCKET_NAME,
                "Key": object_key,
            },
            ExpiresIn=settings.R2_PRESIGNED_URL_EXPIRES,
        )
    except Exception:
        return ""


def get_profile_picture_url(object_key: str) -> str:
    return get_r2_object_url(object_key)


def get_device_photo_url(object_key: str) -> str:
    return get_r2_object_url(object_key)
