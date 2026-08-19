# MegaLMS

This workspace contains two frontend apps that now share one Django/MySQL course store:

- `lms`: landing page, login, and public course browsing
- `lms-clone`: course creation and course management

Created courses are stored in MySQL through the Django backend and shown in the LMS course catalog and course detail pages.

## Prerequisites

- Node.js
- `pnpm`
- Python 3.10+ for the Django backend

## Run Everything

From the repo root:

```bash
npm run dev
```

This starts:

- the Django API server on `http://localhost:8000`
- the LMS app
- the course builder app

If the Python environment is not ready yet, install the backend dependencies first:

```bash
pip install -r lms-clone/backend/requirements.txt
```

## Run Individual Parts

API only:

```bash
npm run api
```

LMS only:

```bash
pnpm --dir lms/apps/web dev
```

Course builder only:

```bash
pnpm --dir lms-clone dev
```

## Ports

- LMS: Vite default port
- `lms-clone`: `5174`
- API server: `8000`

## Data Storage

Course data is saved in MySQL through Django.

Use MySQL Workbench to inspect the `lmsdata` database on `127.0.0.1:3306`.

To create or update the tables, run:

```bash
python lms-clone/backend/manage.py migrate
```

## Notes

- The LMS course catalog reads from `/api/courses/`.
- The course builder writes to the same source of truth.
- File uploads in `lms-clone` are saved by the Django backend into `media/uploads/`.
