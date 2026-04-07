
-- Table for daily data per user per date
CREATE TABLE public.user_day_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.user_day_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own day data"
  ON public.user_day_data FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Table for app-level settings/data per user (goals, notes, accounts, settings, etc.)
CREATE TABLE public.user_app_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  data_key TEXT NOT NULL,
  data_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, data_key)
);

ALTER TABLE public.user_app_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own app data"
  ON public.user_app_data FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_day_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_app_data;
