CREATE TABLE public.dealership_drills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealership_id UUID NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  drill_key TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  title_override TEXT,
  description_override TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (dealership_id, drill_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dealership_drills TO authenticated;
GRANT ALL ON public.dealership_drills TO service_role;

ALTER TABLE public.dealership_drills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage dealership_drills"
  ON public.dealership_drills FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Managers manage own dealership_drills"
  ON public.dealership_drills FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'manager') AND dealership_id = public.get_user_dealership_id(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'manager') AND dealership_id = public.get_user_dealership_id(auth.uid()));

CREATE POLICY "Users view own dealership_drills"
  ON public.dealership_drills FOR SELECT TO authenticated
  USING (dealership_id = public.get_user_dealership_id(auth.uid()));

CREATE TRIGGER update_dealership_drills_updated_at
  BEFORE UPDATE ON public.dealership_drills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();