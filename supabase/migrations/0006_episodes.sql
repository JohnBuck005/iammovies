-- Episode catalog used by admin upload and reader APIs
CREATE TABLE IF NOT EXISTS episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id text NOT NULL,
  number integer NOT NULL,
  title text NOT NULL,
  duration text NOT NULL,
  video_url text,
  is_free boolean NOT NULL DEFAULT false,
  thumbnail text,
  cover text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(series_id, number)
);

ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read episodes"
  ON episodes FOR SELECT
  USING (true);

-- Writes are intentionally NOT opened here.
-- Use service_role from server-side admin routes instead.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER episodes_set_updated_at
  BEFORE UPDATE ON episodes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
