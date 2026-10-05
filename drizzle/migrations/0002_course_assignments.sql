CREATE TABLE public.course_team_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id uuid NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.dealership_modules(id) ON DELETE CASCADE,
  due_days integer,
  due_date date,
  assigned_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dealership_id, module_id)
);
GRANT SELECT ON public.course_team_assignments TO authenticated;
GRANT ALL ON public.course_team_assignments TO service_role;
ALTER TABLE public.course_team_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Managers view team assignments" ON public.course_team_assignments FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'super_admin') OR (public.has_role(auth.uid(),'manager') AND dealership_id = public.get_user_dealership_id(auth.uid())));

CREATE TABLE public.course_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  dealership_id uuid NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.dealership_modules(id) ON DELETE CASCADE,
  team_assignment_id uuid REFERENCES public.course_team_assignments(id) ON DELETE SET NULL,
  due_date date,
  assigned_by uuid,
  notified_at timestamptz,
  reminder_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id)
);
CREATE INDEX course_assignments_dealership_idx ON public.course_assignments(dealership_id);
GRANT SELECT ON public.course_assignments TO authenticated;
GRANT ALL ON public.course_assignments TO service_role;
ALTER TABLE public.course_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own assignments" ON public.course_assignments FOR SELECT TO authenticated
USING (user_id = auth.uid());
CREATE POLICY "Managers view dealership assignments" ON public.course_assignments FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'super_admin') OR (public.has_role(auth.uid(),'manager') AND dealership_id = public.get_user_dealership_id(auth.uid())));

-- New hires / people moved into a dealership inherit whole-team assignments
CREATE OR REPLACE FUNCTION public.apply_team_course_assignments()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.dealership_id IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.dealership_id IS DISTINCT FROM NEW.dealership_id) THEN
    INSERT INTO public.course_assignments (user_id, dealership_id, module_id, team_assignment_id, due_date, assigned_by)
    SELECT NEW.user_id, t.dealership_id, t.module_id, t.id,
           CASE WHEN t.due_days IS NOT NULL THEN (now() + make_interval(days => t.due_days))::date ELSE t.due_date END,
           t.assigned_by
    FROM public.course_team_assignments t
    WHERE t.dealership_id = NEW.dealership_id
    ON CONFLICT (user_id, module_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER apply_team_course_assignments_trg
AFTER INSERT OR UPDATE OF dealership_id ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.apply_team_course_assignments();