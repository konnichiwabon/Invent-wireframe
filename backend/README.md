# Invent FastAPI Backend

This backend exposes the API contract used by the React frontend.

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Edit `.env` if your PostgreSQL username, password, host, port, or database name is different.

Default connection:

```text
postgresql+psycopg://postgres:postgres@localhost:5432/invent
```

## Run

```bash
uvicorn app.main:app --reload
```

The API will run at:

```text
http://localhost:8000
```

Interactive documentation:

```text
http://localhost:8000/docs
```

## Endpoints

- `GET /health`
- `GET /assets`
- `POST /assets`
- `PUT /assets/{id}`
- `DELETE /assets/{id}`

The `/assets` endpoints accept and return the same object shape used by the React frontend inventory type.

## Frontend connection

In the project root, copy `.env.example` to `.env` and set:

```text
VITE_API_BASE_URL=http://localhost:8000
```

Restart the Vite dev server after changing `.env`.
