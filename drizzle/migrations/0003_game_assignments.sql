-- Games (drills) can be assigned to people, mirroring course assignments.
CREATE TABLE public.game_team_assignments (
  id uuid primary key default gen_random_uuid(),
  dealership_id uuid not null references public.dealerships(id) on delete cascade,
  drill_key text not null,
  due_days integer,
  due_date date,
  assigned_by uuid,
  created_at timestamptz not null default now(),
  unique (dealership_id, drill_key)
);

CREATE TABLE public.game_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  dealership_id uuid not null,
  drill_key text not null,
  team_assignment_id uuid references public.game_team_assignments(id) on delete set null,
  due_date date,
  assigned_by uuid,
  notified_at timestamptz,
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, drill_key)
);

CREATE INDEX game_assignments_dealership_idx ON public.game_assignments (dealership_id);
CREATE INDEX game_assignments_drill_key_idx ON public.game_assignments (drill_key);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_team_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_assignments TO authenticated;
GRANT ALL ON public.game_team_assignments TO service_role;
GRANT ALL ON public.game_assignments TO service_role;

ALTER TABLE public.game_team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own game assignments"
  ON public.game_assignments FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Managers view dealership game assignments"
  ON public.game_assignments FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR (has_role(auth.uid(), 'manager'::app_role) AND dealership_id = get_user_dealership_id(auth.uid()))
  );

CREATE POLICY "Managers view team game assignments"
  ON public.game_team_assignments FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR (has_role(auth.uid(), 'manager'::app_role) AND dealership_id = get_user_dealership_id(auth.uid()))
  );

-- New team members automatically inherit whole-team game assignments.
CREATE OR REPLACE FUNCTION public.apply_team_game_assignments()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.dealership_id IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.dealership_id IS DISTINCT FROM NEW.dealership_id) THEN
    INSERT INTO public.game_assignments (user_id, dealership_id, drill_key, team_assignment_id, due_date, assigned_by)
    SELECT NEW.user_id, t.dealership_id, t.drill_key, t.id,
           CASE WHEN t.due_days IS NOT NULL THEN (now() + make_interval(days => t.due_days))::date ELSE t.due_date END,
           t.assigned_by
    FROM public.game_team_assignments t
    WHERE t.dealership_id = NEW.dealership_id
    ON CONFLICT (user_id, drill_key) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_apply_team_game_assignments
AFTER INSERT OR UPDATE OF dealership_id ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.apply_team_game_assignments();
