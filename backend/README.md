# Invent Django Backend

This backend exposes the API contract used by the React frontend.

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Edit `.env` with your PostgreSQL or Neon connection details.

Default connection:

```text
postgresql://postgres:postgres@localhost:5432/invent
```

For Neon, use the connection string Neon provides, including its SSL query params, for example:

```text
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

Run migrations:

```bash
python manage.py migrate
```

## Run

```bash
python manage.py runserver 8000
```

The API will run at:

```text
http://localhost:8000
```

## Endpoints

- `GET /health`
- `GET /assets`
- `POST /assets`
- `PUT /assets/{id}`
- `DELETE /assets/{id}`

The `/assets` endpoints accept and return the same object shape used by the React frontend inventory type.

## Cloudflare R2 Profile Pictures

Profile pictures are uploaded from the frontend avatar picker to Django, then Django uploads them to Cloudflare R2. The asset row stores the R2 object key, so each image is tied to its asset ID.

Required environment variables:

```text
R2_BUCKET_NAME=your-r2-bucket
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_ENDPOINT_URL=https://your-account-id.r2.cloudflarestorage.com
R2_PROFILE_PICTURE_PREFIX=profile-pictures
```

Optional:

```text
R2_PUBLIC_BASE_URL=https://your-public-r2-domain.example.com
R2_PRESIGNED_URL_EXPIRES=3600
R2_MAX_PROFILE_IMAGE_BYTES=20000000
DATA_UPLOAD_MAX_MEMORY_SIZE=40000000
```

If `R2_PUBLIC_BASE_URL` is empty, the API returns temporary signed URLs for stored profile pictures.
`DATA_UPLOAD_MAX_MEMORY_SIZE` should be larger than `R2_MAX_PROFILE_IMAGE_BYTES` because browser uploads are sent as base64 JSON.

## Frontend connection

In `frontend/`, copy `.env.example` to `.env` and set:

```text
VITE_API_BASE_URL=http://localhost:8000
```

Restart the Vite dev server from `frontend/` after changing `.env`.
