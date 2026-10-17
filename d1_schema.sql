-- Cloudflare D1 SQLite Schema for Hajnalka Állásfigyelő

CREATE TABLE IF NOT EXISTS candidate_profile (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT NOT NULL,
  max_distance_km INTEGER NOT NULL DEFAULT 100,
  target_salary_gross INTEGER NOT NULL DEFAULT 700000,
  skills TEXT, -- JSON array
  languages TEXT, -- JSON array
  experience_summary TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  external_id TEXT,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  distance_km REAL,
  salary_raw TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  work_model TEXT, -- 'remote', 'hybrid', 'onsite'
  url TEXT NOT NULL,
  description TEXT,
  match_score INTEGER DEFAULT 50,
  match_reasons TEXT, -- JSON array of strings
  match_badges TEXT, -- JSON array of badges
  status TEXT DEFAULT 'new', -- 'new', 'interested', 'rejected', 'applied'
  rejection_reason TEXT,
  rejection_category TEXT,
  notes TEXT,
  posted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_match_score ON jobs(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);

CREATE TABLE IF NOT EXISTS learned_rules (
  id TEXT PRIMARY KEY,
  rule_type TEXT NOT NULL, -- 'keyword_penalty', 'keyword_boost', 'location_penalty', 'company_block', 'salary_threshold', 'custom'
  pattern TEXT NOT NULL,
  adjustment_points INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  origin_feedback TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS search_logs (
  id TEXT PRIMARY KEY,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  sources_queried TEXT,
  total_found INTEGER DEFAULT 0,
  relevant_count INTEGER DEFAULT 0,
  email_sent INTEGER DEFAULT 0,
  status TEXT
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
