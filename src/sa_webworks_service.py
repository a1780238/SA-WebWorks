#!/usr/bin/env python3
"""SA WebWorks Finite Linear Negentropy Algorithm (FLNA) service.

Implements a deterministic lead-to-cash pipeline to reduce client-local entropy:
- Ingestion: Capture structured leads
- Filtration: Reject out-of-area and low-signal noise
- State transition: Move leads through a finite pipeline
- Output generation: Trigger deterministic automation artifacts
"""

from __future__ import annotations

import json
import sqlite3
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
DB_PATH = DATA_DIR / "service.db"
SITE_CONFIG_PATH = ROOT_DIR / "config" / "site_config.json"

PIPELINE_STATES = [
    "new_lead",
    "audit_contact",
    "call_booked",
    "proposal_sent",
    "deposit_paid",
    "in_build_scheduled",
    "live_complete",
    "retainer_review",
]


@dataclass
class LeadScore:
    value: int
    band: str


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_site_config() -> dict[str, Any]:
    if SITE_CONFIG_PATH.exists():
        with SITE_CONFIG_PATH.open("r", encoding="utf-8") as file:
            return json.load(file)

    return {
        "brand": "SA WebWorks",
        "domain": "sawebworks.com.au",
        "service_area": "South Australia",
        "service_suburbs": ["adelaide"],
        "role_inbox": "hello@sawebworks.com.au",
        "slo_notification_seconds": 60,
    }


SITE_CONFIG = load_site_config()


def normalize(value: str | None) -> str:
    return (value or "").strip().lower()


def ensure_database() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS leads (
                id TEXT PRIMARY KEY,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                name TEXT NOT NULL,
                business_name TEXT,
                email TEXT NOT NULL,
                phone TEXT,
                suburb TEXT,
                service_type TEXT NOT NULL,
                urgency TEXT,
                budget_aud INTEGER,
                notes TEXT,
                score INTEGER NOT NULL,
                score_band TEXT NOT NULL,
                status TEXT NOT NULL,
                pipeline_state TEXT NOT NULL,
                recommended_action TEXT NOT NULL,
                estimated_revenue_aud INTEGER NOT NULL,
                entropy_score REAL NOT NULL,
                rejected_reason TEXT,
                trust_followup_due TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS events (
                id TEXT PRIMARY KEY,
                occurred_at TEXT NOT NULL,
                lead_id TEXT,
                type TEXT NOT NULL,
                payload TEXT NOT NULL
            )
            """
        )


def score_lead(payload: dict[str, Any]) -> LeadScore:
    score = 0
    budget = int(payload.get("budget_aud") or 0)
    urgency = normalize(payload.get("urgency"))
    service_type = normalize(payload.get("service_type"))
    suburb = normalize(payload.get("suburb"))

    if budget >= 12000:
        score += 40
    elif budget >= 7000:
        score += 30
    elif budget >= 3000:
        score += 18
    elif budget > 0:
        score += 10

    if urgency in {"emergency", "asap", "this_week"}:
        score += 30
    elif urgency in {"this_month", "1_3_months"}:
        score += 18
    elif urgency:
        score += 8

    if service_type in {"blocked_drain", "hot_water", "website_rebuild", "lead_automation", "seo_growth"}:
        score += 22
    elif service_type:
        score += 12

    if suburb in {normalize(s) for s in SITE_CONFIG.get("service_suburbs", [])}:
        score += 8

    score = max(0, min(100, score))
    if score >= 75:
        band = "hot"
    elif score >= 45:
        band = "warm"
    else:
        band = "cold"

    return LeadScore(score, band)


def entropy_score(payload: dict[str, Any], rejected: bool) -> float:
    o_miss = 1 if rejected else 0
    l_admin = 1
    for field in ["name", "email", "phone", "suburb", "service_type", "urgency"]:
        if payload.get(field):
            l_admin -= 0.12
    l_admin = max(0, l_admin)
    v_op = 1.0 if normalize(payload.get("urgency")) in {"emergency", "asap"} else 0.4
    value = max(-1.0, min(2.5, o_miss + l_admin + v_op - 1.0))
    return round(value, 3)


def recommend_action(score_band: str, urgency: str | None) -> str:
    urgency_n = normalize(urgency)
    if urgency_n in {"emergency", "asap"}:
        return "Trigger owner SMS + immediate callback workflow (<60s acknowledgment)."
    if score_band == "hot":
        return "Auto-book strategy call within 24h and send proposal template A."
    if score_band == "warm":
        return "Send tailored case study sequence and schedule discovery within 3 days."
    return "Send nurture sequence and re-qualify after 14 days."


def estimate_revenue(payload: dict[str, Any], score: LeadScore, rejected: bool) -> int:
    if rejected:
        return 0
    budget = int(payload.get("budget_aud") or 0)
    multiplier = {"hot": 1.1, "warm": 0.7, "cold": 0.35}[score.band]
    base = budget if budget > 0 else 2500
    return int(base * multiplier)


def classify_lead(payload: dict[str, Any]) -> tuple[bool, str | None]:
    suburb = normalize(payload.get("suburb"))
    service_suburbs = {normalize(s) for s in SITE_CONFIG.get("service_suburbs", [])}
    if suburb and service_suburbs and suburb not in service_suburbs:
        return True, "out_of_service_area"
    return False, None


def insert_event(event_type: str, payload: dict[str, Any], lead_id: str | None = None) -> None:
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT INTO events (id, occurred_at, lead_id, type, payload) VALUES (?, ?, ?, ?, ?)",
            (str(uuid.uuid4()), utc_now_iso(), lead_id, event_type, json.dumps(payload, ensure_ascii=False)),
        )


def write_lead(payload: dict[str, Any]) -> dict[str, Any]:
    lead_score = score_lead(payload)
    rejected, rejected_reason = classify_lead(payload)
    entropy = entropy_score(payload, rejected)

    lead_id = str(uuid.uuid4())
    now = utc_now_iso()
    pipeline_state = "new_lead"
    status = "rejected" if rejected else ("qualified" if lead_score.band in {"hot", "warm"} else "nurture")
    action = recommend_action(lead_score.band, payload.get("urgency"))
    revenue = estimate_revenue(payload, lead_score, rejected)
    trust_due = (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat() if lead_score.band == "hot" and not rejected else None

    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            INSERT INTO leads (
                id, created_at, updated_at, name, business_name, email, phone,
                suburb, service_type, urgency, budget_aud, notes,
                score, score_band, status, pipeline_state, recommended_action,
                estimated_revenue_aud, entropy_score, rejected_reason, trust_followup_due
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                lead_id,
                now,
                now,
                payload["name"],
                payload.get("business_name"),
                payload["email"],
                payload.get("phone"),
                payload.get("suburb"),
                payload["service_type"],
                payload.get("urgency"),
                payload.get("budget_aud"),
                payload.get("notes"),
                lead_score.value,
                lead_score.band,
                status,
                pipeline_state,
                action,
                revenue,
                entropy,
                rejected_reason,
                trust_due,
            ),
        )

    insert_event("lead_created", payload, lead_id)
    insert_event(
        "automation_triggered",
        {
            "lead_id": lead_id,
            "role_inbox": SITE_CONFIG.get("role_inbox"),
            "notification_slo_seconds": SITE_CONFIG.get("slo_notification_seconds", 60),
            "next_action": action,
            "rejected": rejected,
        },
        lead_id,
    )

    return {
        "lead_id": lead_id,
        "score": lead_score.value,
        "score_band": lead_score.band,
        "status": status,
        "pipeline_state": pipeline_state,
        "recommended_action": action,
        "estimated_revenue_aud": revenue,
        "entropy_score": entropy,
        "rejected_reason": rejected_reason,
        "domain": SITE_CONFIG.get("domain"),
    }


class ServiceHandler(BaseHTTPRequestHandler):
    server_version = "SAWebWorksFLNA/2.0"

    def _read_json(self) -> dict[str, Any]:
        content_length = int(self.headers.get("Content-Length", "0"))
        if content_length <= 0:
            return {}
        return json.loads(self.rfile.read(content_length).decode("utf-8"))

    def _write_json(self, code: int, payload: dict[str, Any]) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/api/health":
            self._write_json(
                HTTPStatus.OK,
                {
                    "status": "ok",
                    "brand": SITE_CONFIG.get("brand"),
                    "domain": SITE_CONFIG.get("domain"),
                    "role_inbox": SITE_CONFIG.get("role_inbox"),
                    "notification_slo_seconds": SITE_CONFIG.get("slo_notification_seconds", 60),
                    "timestamp": utc_now_iso(),
                },
            )
            return

        if self.path == "/api/pipeline/states":
            self._write_json(HTTPStatus.OK, {"states": PIPELINE_STATES})
            return

        if self.path == "/api/leads":
            with sqlite3.connect(DB_PATH) as conn:
                conn.row_factory = sqlite3.Row
                rows = conn.execute(
                    """
                    SELECT id, created_at, name, email, suburb, service_type,
                           score, score_band, status, pipeline_state,
                           estimated_revenue_aud, entropy_score, rejected_reason
                    FROM leads ORDER BY created_at DESC LIMIT 100
                    """
                ).fetchall()
            self._write_json(HTTPStatus.OK, {"leads": [dict(r) for r in rows]})
            return

        if self.path == "/api/revenue-summary":
            with sqlite3.connect(DB_PATH) as conn:
                conn.row_factory = sqlite3.Row
                totals = conn.execute(
                    """
                    SELECT COUNT(*) AS total_leads,
                           COALESCE(SUM(estimated_revenue_aud), 0) AS projected_revenue_aud,
                           COALESCE(SUM(CASE WHEN score_band = 'hot' THEN 1 ELSE 0 END), 0) AS hot_leads,
                           ROUND(COALESCE(AVG(entropy_score), 0), 3) AS avg_entropy_score
                    FROM leads
                    """
                ).fetchone()
            self._write_json(HTTPStatus.OK, dict(totals))
            return

        self._write_json(HTTPStatus.NOT_FOUND, {"error": "Not found"})

    def do_POST(self) -> None:  # noqa: N802
        if self.path != "/api/leads":
            self._write_json(HTTPStatus.NOT_FOUND, {"error": "Not found"})
            return
        try:
            payload = self._read_json()
        except json.JSONDecodeError:
            self._write_json(HTTPStatus.BAD_REQUEST, {"error": "Invalid JSON payload"})
            return

        missing = [k for k in ["name", "email", "service_type"] if not payload.get(k)]
        if missing:
            self._write_json(HTTPStatus.BAD_REQUEST, {"error": "Missing required fields", "required": missing})
            return

        result = write_lead(payload)
        self._write_json(HTTPStatus.CREATED, result)


def run(host: str = "0.0.0.0", port: int = 8080) -> None:
    ensure_database()
    server = ThreadingHTTPServer((host, port), ServiceHandler)
    print(f"SA WebWorks FLNA service running on http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    run()
