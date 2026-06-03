from pathlib import Path
import os
from urllib.parse import parse_qs, unquote, urlparse


BASE_DIR = Path(__file__).resolve().parent.parent


def load_env_file(path: Path) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def split_env_list(name: str, default: str = "") -> list[str]:
    return [
        item.strip()
        for item in os.environ.get(name, default).split(",")
        if item.strip()
    ]


def env_bool(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def env_int(name: str, default: int) -> int:
    value = os.environ.get(name)
    if value is None:
        return default

    try:
        return int(value)
    except ValueError:
        return default


def database_from_url(raw_url: str) -> dict[str, object]:
    database_url = raw_url.replace("postgresql+psycopg://", "postgresql://", 1)
    parsed = urlparse(database_url)

    if parsed.scheme in {"postgres", "postgresql"}:
        query = parse_qs(parsed.query)
        options = {
            key: values[-1]
            for key, values in query.items()
            if values and key not in {"schema"}
        }

        return {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": unquote(parsed.path.lstrip("/")),
            "USER": unquote(parsed.username or ""),
            "PASSWORD": unquote(parsed.password or ""),
            "HOST": parsed.hostname or "",
            "PORT": parsed.port or "",
            "OPTIONS": options,
        }

    if parsed.scheme == "sqlite":
        sqlite_path = unquote(parsed.path)
        return {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": sqlite_path or BASE_DIR / "db.sqlite3",
        }

    raise ValueError(f"Unsupported DATABASE_URL scheme: {parsed.scheme}")


load_env_file(BASE_DIR / ".env")

SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "django-insecure-dev-only-change-this-secret-key",
)
DEBUG = env_bool("DJANGO_DEBUG", True)
ALLOWED_HOSTS = split_env_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1,[::1]")

BACKEND_CORS_ORIGINS = split_env_list(
    "BACKEND_CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:5175,http://127.0.0.1:5175,http://localhost:4173,http://127.0.0.1:4173",
)

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "assets.apps.AssetsConfig",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "assets.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "invent_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "invent_backend.wsgi.application"

DATABASES = {
    "default": database_from_url(
        os.environ.get(
            "DATABASE_URL",
            "postgresql://postgres:postgres@localhost:5432/invent",
        )
    )
}

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

R2_BUCKET_NAME = os.environ.get("R2_BUCKET_NAME", "")
R2_ACCESS_KEY_ID = os.environ.get("R2_ACCESS_KEY_ID", "")
R2_SECRET_ACCESS_KEY = os.environ.get("R2_SECRET_ACCESS_KEY", "")
R2_ENDPOINT_URL = os.environ.get("R2_ENDPOINT_URL", "")
R2_PUBLIC_BASE_URL = os.environ.get("R2_PUBLIC_BASE_URL", "")
R2_PROFILE_PICTURE_PREFIX = os.environ.get(
    "R2_PROFILE_PICTURE_PREFIX",
    "profile-pictures",
)
R2_PRESIGNED_URL_EXPIRES = env_int("R2_PRESIGNED_URL_EXPIRES", 3600)
R2_MAX_PROFILE_IMAGE_BYTES = env_int("R2_MAX_PROFILE_IMAGE_BYTES", 20_000_000)
DATA_UPLOAD_MAX_MEMORY_SIZE = env_int(
    "DATA_UPLOAD_MAX_MEMORY_SIZE",
    R2_MAX_PROFILE_IMAGE_BYTES * 2,
)
