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
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  occurred_at TEXT NOT NULL,
  lead_id TEXT,
  type TEXT NOT NULL,
  payload TEXT NOT NULL
);
