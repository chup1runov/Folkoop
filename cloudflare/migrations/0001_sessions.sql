-- Private D1 binding only. Never expose this database through the Data API.
CREATE TABLE IF NOT EXISTS sessions (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL, sealed TEXT NOT NULL,
 expires INTEGER NOT NULL, refresh_after INTEGER NOT NULL,
 lease_until INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
