# SA WebWorks — Finite Linear Negentropy Algorithm (FLNA)

This repository now ships a **real operational architecture** for SA WebWorks to reduce client-local entropy and automate revenue generation for South Australian tradies.

## Mission Fit

- End the 7 PM–10 PM "Second Shift".
- Seal the leaky lead bucket with rapid capture and deterministic workflows.
- Filter tyre-kickers and out-of-area noise before humans waste time.
- Tie all operations to `sawebworks.com.au` trust signals and role-based governance.

## Service Features

The Python service (`src/sa_webworks_service.py`) provides:

1. **Ingestion**: structured lead capture (`POST /api/leads`).
2. **Filtration**: auto-reject out-of-service suburbs based on config.
3. **State Transition**: finite pipeline states (`new_lead` → `retainer_review`).
4. **Output Generation**: deterministic next-actions + event logging.
5. **Entropy Tracking**: computed `entropy_score` per lead.
6. **Revenue Tracking**: projected revenue summary endpoint.

## API

- `GET /api/health` — health, domain, role inbox, notification SLO.
- `GET /api/pipeline/states` — finite state machine states.
- `POST /api/leads` — create/qualify/filter a lead.
- `GET /api/leads` — list recent leads.
- `GET /api/revenue-summary` — projected revenue + average entropy.

## Local Run

```bash
./scripts/run_service.sh
```

Then visit `http://localhost:8080/api/health`.

## Validation

```bash
python3 -m unittest discover -s tests -p 'test_*.py'
python3 -m py_compile src/sa_webworks_service.py tests/test_service_logic.py
```

## Architecture Assets Added

- `.github/workflows/` — deploy, schema validation, and weekly backups.
- `ops/checklists/` — dry-run and handover controls.
- `ops/templates/` — canned replies and invoice templates.
- `ops/db/` — migration SQL.
- `config/site_config.json` — SA market and trust configuration.

This gives SA WebWorks a practical "Agency-in-a-Box" baseline that can be cloned and tailored for each tradie vertical while preserving deterministic quality.
