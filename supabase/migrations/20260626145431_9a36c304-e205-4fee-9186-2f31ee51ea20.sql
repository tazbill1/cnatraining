
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS role public.app_role NOT NULL DEFAULT 'salesperson';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _dealership_id uuid;
  _role public.app_role;
BEGIN
  SELECT dealership_id, role INTO _dealership_id, _role
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
  VALUES (NEW.id, COALESCE(_role, 'salesperson'));

  UPDATE public.invitations
  SET status = 'accepted', used_at = now()
  WHERE email = lower(NEW.email);

  RETURN NEW;
END;
$function$;
