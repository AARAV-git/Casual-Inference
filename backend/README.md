# Backend — Causal Personalization Under Behavioral Drift

> 📌 **Master Project & Technical Documentation**: See the root [`README.md`](../README.md) for the complete research overview, capabilities matrix, architecture diagrams, and system features.

FastAPI + PostgreSQL backend implementing the architecture described in
the project overview (Sections 5-8).

## Quick start (Docker)

```bash
cp .env.example .env      # edit POSTGRES_PASSWORD at minimum
docker compose up --build
```

This starts two containers:
- `db` — Postgres 16, with a healthcheck. `backend` will not boot until this passes.
- `backend` — runs `scripts/init_db.py` (creates tables) then starts `uvicorn` on `:8000`.

API docs: http://localhost:8000/docs

## Local dev (no Docker)

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env      # set POSTGRES_HOST=localhost
python scripts/init_db.py
uvicorn app.main:app --reload
```

## How a request flows

```
Frontend page
   -> lib/api/<domain>.ts        (frontend HTTP client)
   -> app/api/v1/<domain>.py     (route: validates input, no logic)
   -> app/services/<domain>_service.py   (business logic)
   -> app/causal_engine/...      (ML/causal math)  and/or
   -> app/database/repositories.py -> app/database/models.py -> Postgres
```

Bulk interaction data (users, interactions, interventions, outcomes)
lives in `data/processed/*.parquet`, read via `app/data/loaders/`.
Postgres only stores small result rows (experiments, causal_results,
drift_results, models, policies, policy_evaluations) that reference that
data by ID — never the interaction-level rows themselves.

## Database connection

- `app/config.py` builds `DATABASE_URL` from the `POSTGRES_*` env vars.
- `app/database/session.py` opens the pooled connection (`engine`) and
  exposes `get_db()`, the FastAPI dependency every route uses.
- Inside Docker, `POSTGRES_HOST=db` (the compose service name) — not `localhost`.

## Folder structure

See the project overview document, Section 5, and the accompanying
folder-structure breakdown for the full annotated tree (`app/`, `data/`,
`models/`, `experiments/`, `research/`, `frontend/`).

## Frontend ↔ backend ↔ database connections

See [`CONNECTIONS.md`](./CONNECTIONS.md) for the exact page → `lib/api`
file → endpoint → service → database/Parquet chain for every frontend
page, plus an honest table of what's fully wired vs. still a stub.
