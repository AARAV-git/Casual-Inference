# Frontend ↔ Backend ↔ Database — Connection Reference

This maps every frontend page to the exact backend file that handles it,
end to end. File names below match what's actually in `backend/app/` —
not a plan, the real thing.

## How to read each block

```
Frontend Page
   ↓ calls
lib/api file (which function)
   ↓ hits
Backend Endpoint (method + path)
   ↓ handled by
Service (the actual logic)
   ↓ reads/writes
Database or Storage (where the data lives)
```

---

### Dashboard

```
/dashboard
   ↓ dashboard.ts
   ↓ GET /dashboard/summary
   ↓ app/api/v1/dashboard.py  (route only — no service yet, returns fixed shape)
   ↓ Postgres → causal_results, experiment_runs (summarized)
```
> Current state: `dashboard.py` returns a hardcoded summary dict. To make
> this live, add the aggregation query to `data_service.py` and call it
> from the route, same pattern as every other GET below.

---

### Dataset Explorer

```
/datasets
   ↓ datasets.ts
   ↓ GET /datasets
   ↓ app/api/v1/datasets.py → app/services/data_service.py (list_datasets)
   ↓ Postgres → datasets table (metadata only, not a full Parquet scan)

/datasets/:id
   ↓ datasets.ts
   ↓ GET /datasets/:id
   ↓ GET /datasets/:id/statistics
   ↓ app/api/v1/datasets.py → app/services/data_service.py (get_dataset)
   ↓ Postgres → datasets table  +  Parquet → data/processed/<id>.parquet
```

---

### Users

```
/users
   ↓ users.ts
   ↓ GET /users
   ↓ app/api/v1/users.py  (stub — not yet wired to a service)
   ↓ Parquet → data/processed/users.parquet

/users/:id
   ↓ users.ts
   ↓ GET /users/:id
   ↓ GET /users/:id/interactions
   ↓ app/api/v1/users.py  (stub)
   ↓ Parquet → data/processed/interactions.parquet

/users/:id  (value breakdown, Sec. 3)
   ↓ value.ts
   ↓ GET /value/:user_id
   ↓ app/api/v1/value.py → app/services/value_service.py
   ↓ Parquet → data/processed/outcomes.parquet
     (computed fresh on every call — nothing stored in Postgres)
```
> `users.py` currently raises `NotImplementedError` — it needs a
> `user_service.py` (doesn't exist yet) the same way `value.py` has
> `value_service.py`. Flag this if you want it built next.

---

### Interventions

```
/interventions
   ↓ interventions.ts
   ↓ GET /interventions
   ↓ GET /interventions/:id/statistics
   ↓ app/api/v1/interventions.py  (stub — returns a fixed list today)
   ↓ Parquet → data/processed/interventions.parquet
```

---

### Causal Analysis — the core screen

```
/causal-analysis  (loading the form's dropdowns)
   ↓ causal.ts
   ↓ GET /causal/treatments | /causal/outcomes | /causal/features
   ↓ app/api/v1/causal.py  (returns fixed option lists today)
   ↓ Parquet → data/processed/  (lists available columns)

/causal-analysis  (running an estimate)
   ↓ causal.ts
   ↓ POST /causal/estimate
   ↓ app/api/v1/causal.py → app/services/causal_service.py
   ↓   1. reads Parquet via app/data/loaders/synthetic_loader.py
         (swap in kuairec_loader.py / mind_loader.py per dataset_id)
   ↓   2. runs app/causal_engine/estimators/
         (ipw.py | doubly_robust.py | causal_forest.py)
   ↓   3. writes Postgres → experiments + causal_results
         (via app/database/repositories.py → ExperimentRepository)

/causal-analysis/cate
   ↓ causal.ts
   ↓ POST /causal/cate
   ↓ app/api/v1/causal.py → causal_service.py → causal_forest.py
   ↓ Postgres → causal_results   [not yet implemented — see NotImplementedError]

/causal-analysis/ite/:id
   ↓ causal.ts
   ↓ GET /causal/ite/:id
   ↓ app/api/v1/causal.py → causal_service.py
   ↓ Postgres → causal_results (simple lookup by id)   [not yet implemented]
```

---

### Counterfactual Simulator

```
/counterfactual
   ↓ counterfactual.ts
   ↓ POST /counterfactual/simulate
   ↓ app/api/v1/counterfactual.py → app/services/counterfactual_service.py
     → app/causal_engine/models/transformer_encoder.py
   ↓ nothing stored — computed and returned live

   ↓ POST /counterfactual/compare-policies
   ↓ app/api/v1/counterfactual.py  [not yet implemented in the service]
```

---

### Behavioral Drift

```
/behavioral-drift
   ↓ drift.ts
   ↓ GET /drift/population
   ↓ app/api/v1/drift.py → app/services/drift_service.py (population)
   ↓ Postgres → drift_results (read)

   ↓ POST /drift/causal
   ↓ app/api/v1/drift.py → drift_service.py (causal)
   ↓ Postgres → drift_results (written here)

   ↓ GET /drift/users/:id
   ↓ app/api/v1/drift.py  [not yet implemented]
```

---

### Experiment Lab — two-phase, worth reading carefully

```
Step 1 — start the run
/experiments
   ↓ experiments.ts
   ↓ POST /experiments
   ↓ app/api/v1/experiments.py → app/services/experiment_service.py (create)
   ↓ Postgres → creates a row in experiments (status: queued)

Step 2 — watch it run live
/experiments/:id
   ↓ experiments.ts
   ↓ WS /ws/experiments/:id
   ↓ app/api/v1/experiments.py (websocket route) → app/core/websocket_manager.py
   ↓ pushes progress events only — nothing written to the DB per event

Step 3 — when it finishes
   ↓ experiment_service.py
   ↓ Postgres → writes final rows to causal_results + experiment_runs
     [the actual background training dispatch is not yet implemented —
      experiment_service.py has a comment marking where it goes]

Step 4 — reloading later (e.g. after refresh)
/experiments/:id
   ↓ experiments.ts
   ↓ GET /experiments/:id
   ↓ GET /experiments/:id/results
   ↓ app/api/v1/experiments.py → experiment_service.py (status, results)
   ↓ Postgres → reads experiments + causal_results + experiment_runs
```
> The frontend never polls `GET /experiments/:id` for live progress —
> that endpoint is only for loading a finished experiment. Progress
> comes only from the WebSocket.

---

### Policy Lab (Section 8)

```
Train a policy
/policy-lab
   ↓ policy.ts
   ↓ POST /policy/train
   ↓ app/api/v1/policy.py → app/services/policy_service.py (train)
   ↓   1. reads data/synthetic/ or KuaiRec via app/data/loaders/
   ↓   2. runs app/causal_engine/policy/contextual_bandit.py
   ↓   3. writes Postgres → policies
   ↓   4. writes Parquet → data/synthetic/policy/ (round-by-round logs)
         [bandit.fit() itself is not yet implemented]

Get a recommendation
   ↓ policy.ts
   ↓ GET /policy/:id/recommend/:user_id
   ↓ app/api/v1/policy.py → policy_service.py (recommend)
   ↓ Postgres → reads policies, computes the answer live via contextual_bandit.py

Evaluate a policy
   ↓ policy.ts
   ↓ GET /policy/:id/evaluate
   ↓ app/api/v1/policy.py → policy_service.py (evaluate)
     → app/causal_engine/estimators/doubly_robust.py
     (same file /causal-analysis uses — see note below)
   ↓ Postgres → writes to policy_evaluations, keyed by policy_id
     (kept as its own table, not columns on policies, so a policy can be
      re-evaluated over time without losing history)
```
> This is the one spot where two different frontend pages — Causal
> Analysis and Policy Lab — call into the exact same estimator code.
> Policy Lab isn't a separate engine; it's `doubly_robust.py` pointed at
> a policy's logged actions instead of a fixed treatment column.

---

### Model Registry

```
/models
   ↓ models.ts
   ↓ GET /models | /models/:id | /models/:id/metrics
   ↓ app/api/v1/models.py → app/services/data_service.py
     (list_models, get_model, get_model_metrics)
   ↓ Postgres → models table   +   MLflow → mlruns/ (artifact_path points here)
```

---

### Research

```
/research
   ↓ research.ts
   ↓ GET /research/hypotheses | /methodology | /experiments | /findings
   ↓ app/api/v1/research.py → app/services/data_service.py (get_research_section)
   ↓ files → research/ (plain markdown, read from disk — not Postgres)
```
> `get_research_section()` is currently a `NotImplementedError` stub —
> it needs to read and concatenate the `.md` files under
> `research/<section>/`.

---

## Reading the chain end to end

- **Frontend page** never knows about Postgres, Parquet, or the causal
  engine — it only knows the shape of the JSON coming back from `lib/api/`.
- **`lib/api/*.ts`** is the only place that knows the URL and method. If
  a backend route path ever changes, this is the one file to update.
- **`app/api/v1/*.py`** validates the request shape and hands off
  immediately — a translator, not a worker.
- **`app/services/*.py`** is where decisions happen: which loader to
  call, which estimator to run, what to persist.
- **Database/Storage** is the resting place: most **GET** (read)
  endpoints pull from Parquet (fast bulk reads of interaction-level
  data); most **POST** estimate/train endpoints write their output to
  Postgres (small, structured, exactly what the next GET needs to redraw
  a chart).

## Two flows that don't fit the simple request → response pattern

1. **`/experiments` is two-phase.** `POST /experiments` just creates the
   row and (once implemented) kicks off the run — the actual multi-model
   comparison happens asynchronously, with `WS /ws/experiments/:id`
   pushing progress the whole time, and only the final state gets
   written to `causal_results`. The frontend never polls
   `GET /experiments/:id` for progress.
2. **`/policy/:id/evaluate` reuses `doubly_robust.py`** from
   `/causal-analysis`. Two different frontend pages end up calling the
   exact same backend code — Policy Lab isn't a separate causal engine.

## What's wired vs. what's still a stub, honestly

| Wired end-to-end | Route → service exists, math is a stub |
|---|---|
| `/dashboard/summary` (fixed data) | `/causal/estimate`, `/causal/cate`, `/causal/ite` |
| `/datasets`, `/datasets/:id` | `/counterfactual/simulate` (deterministic placeholder) |
| `/value/:user_id` (route→service, math stub) | `/drift/causal` (placeholder numbers) |
| `/models`, `/models/:id`, `/models/:id/metrics` | `/experiments` (no background worker yet) |
| `/policy/train`, `/recommend`, `/evaluate` (route→service, math stub) | `/research/*` (file-reading not implemented) |

| Not yet wired to a service at all |
|---|
| `/users`, `/users/:id`, `/users/:id/interactions` |
| `/interventions`, `/interventions/:id/statistics` |
| `/drift/users/:id` |
| `/counterfactual/compare-policies` |

Everything in the last table returns `NotImplementedError` or a fixed
placeholder today — the routing skeleton is real, the data science
inside each estimator/loader is the next thing to build out.
