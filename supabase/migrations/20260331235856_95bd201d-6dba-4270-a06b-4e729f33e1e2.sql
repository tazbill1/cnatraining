
-- 1. Remove the overly permissive INSERT policy on profiles.
-- The handle_new_user trigger (SECURITY DEFINER) handles all profile creation.
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- 2. Replace the UPDATE policy so users can update their own profile
-- but CANNOT change their dealership_id.
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Add a trigger to block dealership_id changes by non-super-admins.
CREATE OR REPLACE FUNCTION public.protect_profile_dealership_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.dealership_id IS DISTINCT FROM NEW.dealership_id THEN
    IF NOT public.has_role(auth.uid(), 'super_admin') THEN
      RAISE EXCEPTION 'Only administrators can change dealership assignment';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_dealership_id ON public.profiles;
CREATE TRIGGER protect_dealership_id
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_dealership_id();

-- 4. Add explicit deny INSERT policy for authenticated users on user_roles
-- to close any potential insertion gap (super_admin INSERT policy remains).
CREATE POLICY "Deny self-insert into user_roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin')
);
