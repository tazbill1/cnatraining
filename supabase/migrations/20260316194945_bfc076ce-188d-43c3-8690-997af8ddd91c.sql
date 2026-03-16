
CREATE TABLE public.custom_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id uuid REFERENCES public.dealerships(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'cna',
  buyer_type text NOT NULL DEFAULT 'general',
  difficulty text NOT NULL DEFAULT 'intermediate',
  customer_name text NOT NULL DEFAULT 'Customer',
  personality text,
  system_prompt text NOT NULL,
  opening_line text NOT NULL,
  trade_vehicle text,
  trade_value text,
  estimated_time text DEFAULT '8-12 min',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.custom_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage custom scenarios"
  ON public.custom_scenarios FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Managers view own dealership scenarios"
  ON public.custom_scenarios FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'manager') AND dealership_id = public.get_user_dealership_id(auth.uid()));

CREATE POLICY "Users view own dealership scenarios"
  ON public.custom_scenarios FOR SELECT TO authenticated
  USING (dealership_id = public.get_user_dealership_id(auth.uid()));

CREATE TRIGGER update_custom_scenarios_updated_at
  BEFORE UPDATE ON public.custom_scenarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
