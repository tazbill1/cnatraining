
-- Table 1: sales_leads
CREATE TABLE public.sales_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dealership_id UUID REFERENCES public.dealerships(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('internet', 'phone', 'walk-in')),
  status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'appt-set', 'showed', 'sold', 'lost')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sales_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sales_leads" ON public.sales_leads
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Managers view dealership sales_leads" ON public.sales_leads
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'manager'::app_role) AND dealership_id = get_user_dealership_id(auth.uid()));

CREATE POLICY "Super admins manage all sales_leads" ON public.sales_leads
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Deny anon sales_leads" ON public.sales_leads
  FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE TRIGGER update_sales_leads_updated_at
  BEFORE UPDATE ON public.sales_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Table 2: sales_goals
CREATE TABLE public.sales_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dealership_id UUID REFERENCES public.dealerships(id) ON DELETE SET NULL,
  month DATE NOT NULL,
  sales_goal INTEGER NOT NULL DEFAULT 15,
  show_rate_goal INTEGER NOT NULL DEFAULT 75,
  close_rate_goal INTEGER NOT NULL DEFAULT 35,
  internet_leads_goal INTEGER NOT NULL DEFAULT 50,
  phone_leads_goal INTEGER NOT NULL DEFAULT 30,
  walk_ins_goal INTEGER NOT NULL DEFAULT 25,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, month)
);

ALTER TABLE public.sales_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own sales_goals" ON public.sales_goals
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own sales_goals" ON public.sales_goals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own sales_goals" ON public.sales_goals
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Managers view dealership sales_goals" ON public.sales_goals
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'manager'::app_role) AND dealership_id = get_user_dealership_id(auth.uid()));

CREATE POLICY "Super admins manage all sales_goals" ON public.sales_goals
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Deny anon sales_goals" ON public.sales_goals
  FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE TRIGGER update_sales_goals_updated_at
  BEFORE UPDATE ON public.sales_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Table 3: walk_in_logs
CREATE TABLE public.walk_in_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dealership_id UUID REFERENCES public.dealerships(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('visit', 'sale')),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.walk_in_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own walk_in_logs" ON public.walk_in_logs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Managers view dealership walk_in_logs" ON public.walk_in_logs
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'manager'::app_role) AND dealership_id = get_user_dealership_id(auth.uid()));

CREATE POLICY "Super admins manage all walk_in_logs" ON public.walk_in_logs
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Deny anon walk_in_logs" ON public.walk_in_logs
  FOR ALL TO anon USING (false) WITH CHECK (false);
