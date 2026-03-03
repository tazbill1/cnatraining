
-- 1. Create dealerships table
CREATE TABLE public.dealerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dealerships ENABLE ROW LEVEL SECURITY;

-- 2. Add dealership_id to existing tables
ALTER TABLE public.profiles ADD COLUMN dealership_id uuid REFERENCES public.dealerships(id);
ALTER TABLE public.training_sessions ADD COLUMN dealership_id uuid REFERENCES public.dealerships(id);
ALTER TABLE public.module_completions ADD COLUMN dealership_id uuid REFERENCES public.dealerships(id);
ALTER TABLE public.invitations ADD COLUMN dealership_id uuid REFERENCES public.dealerships(id);

-- 3. Helper function
CREATE OR REPLACE FUNCTION public.get_user_dealership_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT dealership_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- 4. Dealerships RLS
CREATE POLICY "Super admins can manage dealerships"
  ON public.dealerships FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view own dealership"
  ON public.dealerships FOR SELECT TO authenticated
  USING (id = public.get_user_dealership_id(auth.uid()));

CREATE POLICY "Deny anonymous access to dealerships"
  ON public.dealerships FOR ALL TO anon
  USING (false) WITH CHECK (false);

-- 5. Super admin policies on existing tables
CREATE POLICY "Super admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can view all sessions"
  ON public.training_sessions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can view all completions"
  ON public.module_completions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage invitations"
  ON public.invitations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- 6. Scope manager policies by dealership
DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;
CREATE POLICY "Managers can view dealership profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'manager') AND dealership_id = public.get_user_dealership_id(auth.uid()));

DROP POLICY IF EXISTS "Managers can view all sessions" ON public.training_sessions;
CREATE POLICY "Managers can view dealership sessions"
  ON public.training_sessions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'manager') AND dealership_id = public.get_user_dealership_id(auth.uid()));

DROP POLICY IF EXISTS "Managers can view all completions" ON public.module_completions;
CREATE POLICY "Managers can view dealership completions"
  ON public.module_completions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'manager') AND dealership_id = public.get_user_dealership_id(auth.uid()));

DROP POLICY IF EXISTS "Managers can view all invitations" ON public.invitations;
CREATE POLICY "Managers can view dealership invitations"
  ON public.invitations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'manager') AND dealership_id = public.get_user_dealership_id(auth.uid()));

DROP POLICY IF EXISTS "Managers can insert invitations" ON public.invitations;
CREATE POLICY "Managers can insert dealership invitations"
  ON public.invitations FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'manager') AND dealership_id = public.get_user_dealership_id(auth.uid()));

DROP POLICY IF EXISTS "Managers can update invitations" ON public.invitations;
CREATE POLICY "Managers can update dealership invitations"
  ON public.invitations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'manager') AND dealership_id = public.get_user_dealership_id(auth.uid()));

DROP POLICY IF EXISTS "Managers can delete invitations" ON public.invitations;
CREATE POLICY "Managers can delete dealership invitations"
  ON public.invitations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'manager') AND dealership_id = public.get_user_dealership_id(auth.uid()));

-- 7. Update handle_new_user to copy dealership from invitation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _dealership_id uuid;
BEGIN
  SELECT dealership_id INTO _dealership_id
  FROM public.invitations
  WHERE email = lower(NEW.email)
  LIMIT 1;

  INSERT INTO public.profiles (user_id, email, full_name, dealership_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    _dealership_id
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'salesperson');
  
  UPDATE public.invitations
  SET status = 'accepted', used_at = now()
  WHERE email = lower(NEW.email);
  
  RETURN NEW;
END;
$$;

-- 8. Trigger for dealerships updated_at
CREATE TRIGGER update_dealerships_updated_at
  BEFORE UPDATE ON public.dealerships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
