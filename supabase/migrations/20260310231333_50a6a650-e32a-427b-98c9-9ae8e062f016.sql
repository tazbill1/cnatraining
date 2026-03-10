
CREATE TABLE public.dealership_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id uuid REFERENCES public.dealerships(id) ON DELETE CASCADE UNIQUE NOT NULL,
  logo_url text,
  primary_color text DEFAULT '#2563eb',
  dealership_tagline text DEFAULT '',
  enabled_module_ids text[] DEFAULT ARRAY['buyer-types','base-statement-video','base-statement','vehicle-selection-fundamentals','trade-appraisal-process','objection-handling-framework','phone-sales-fundamentals','quick-reference-library'],
  enabled_scenario_categories text[] DEFAULT ARRAY['cna','trade-appraisal','inbound-call'],
  enabled_difficulty_levels text[] DEFAULT ARRAY['beginner','intermediate','advanced'],
  required_module_ids text[] DEFAULT '{}',
  completion_deadline_days integer,
  voice_training_enabled boolean DEFAULT true,
  certificates_enabled boolean DEFAULT true,
  leaderboard_enabled boolean DEFAULT false,
  custom_base_statement text,
  custom_welcome_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dealership_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage dealership_settings"
  ON public.dealership_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Managers view own dealership_settings"
  ON public.dealership_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'manager') AND dealership_id = public.get_user_dealership_id(auth.uid()));

CREATE POLICY "Users view own dealership_settings"
  ON public.dealership_settings FOR SELECT TO authenticated
  USING (dealership_id = public.get_user_dealership_id(auth.uid()));

CREATE TRIGGER update_dealership_settings_updated_at
  BEFORE UPDATE ON public.dealership_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
