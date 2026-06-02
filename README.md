# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
# Invent-wireframe

## Backend API readiness

The frontend is ready to talk to a FastAPI backend when `VITE_API_BASE_URL` is configured.

1. Copy `.env.example` to `.env`.
2. Set `VITE_API_BASE_URL` to your backend URL, for example `http://localhost:8000`.
3. Restart the Vite dev server after changing environment variables.

Expected backend endpoints:

- `GET /assets` returns an array of inventory assets.
- `POST /assets` creates an asset and returns the saved asset.
- `PUT /assets/{id}` updates an asset and returns the saved asset.
- `DELETE /assets/{id}` deletes an asset.

Primary/fallback behavior:

- When `VITE_API_BASE_URL` is set and the backend is reachable, FastAPI/PostgreSQL is the primary data source.
- The frontend keeps a local browser cache of the latest displayed inventory.
- If the backend is unavailable, the app continues showing the local cache.
- If a save/delete request fails, the change is applied locally and marked as local-only in the UI message.
- If `VITE_API_BASE_URL` is not set, the app uses browser `localStorage` for local development.

Local-only fallback changes are temporary and are not automatically synced back to PostgreSQL yet.

## FastAPI backend

A FastAPI backend scaffold is available in `backend/`.

Backend setup:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

The backend expects PostgreSQL by default:

```text
postgresql+psycopg://postgres:postgres@localhost:5432/invent
```

Update `backend/.env` if your PostgreSQL credentials or database name are different.
