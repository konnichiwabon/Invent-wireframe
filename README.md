# Invent

This project is split into two folders:

- `frontend/` - React, TypeScript, Vite app
- `backend/` - Django API connected to PostgreSQL/Neon

## Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

The frontend expects:

```text
VITE_API_BASE_URL=http://localhost:8000
```

If `VITE_API_BASE_URL` is not set, the app uses browser `localStorage` for local development.

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py runserver 8000
```

The backend exposes:

- `GET /health`
- `GET /assets`
- `POST /assets`
- `PUT /assets/{id}`
- `DELETE /assets/{id}`

Profile pictures are uploaded by the backend to Cloudflare R2. Neon stores the asset row and the R2 object key, not the raw photo.

## Database

The backend expects PostgreSQL by default and works with Neon connection strings:

```text
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

Keep `backend/.env` and `frontend/.env` private.

## Cloudflare R2

Set these in `backend/.env`:

```text
R2_BUCKET_NAME=your-r2-bucket
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_ENDPOINT_URL=https://your-account-id.r2.cloudflarestorage.com
R2_PUBLIC_BASE_URL=
R2_PROFILE_PICTURE_PREFIX=profile-pictures
```

If `R2_PUBLIC_BASE_URL` is blank, the API returns temporary signed image URLs. If you connect a public R2 custom domain or `r2.dev` domain, set it there.
