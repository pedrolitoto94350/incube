-- Ajouter les colonnes pour le nouveau formulaire dev
ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS dev_number INTEGER UNIQUE,
  ADD COLUMN IF NOT EXISTS project_types JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS project_type_other TEXT,
  ADD COLUMN IF NOT EXISTS daily_rate NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS screenshot_urls JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS screenshot_captions JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS demo_video_url TEXT,
  ADD COLUMN IF NOT EXISTS code_snippets JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS text_showcases JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS contact_email_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Storage bucket pour les screenshots/vidéos dev
INSERT INTO storage.buckets (id, name, public) 
VALUES ('dev-screenshots', 'dev-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: tout le monde peut lire
CREATE POLICY "Public read dev-screenshots"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'dev-screenshots');

-- Policy: les devs authentifiés peuvent uploader
CREATE POLICY "Auth upload dev-screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'dev-screenshots' AND auth.role() = 'authenticated');
