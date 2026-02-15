
-- Update handle_new_user to mark invitation as accepted
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'salesperson');
  
  -- Mark invitation as accepted
  UPDATE public.invitations
  SET status = 'accepted', used_at = now()
  WHERE email = lower(NEW.email);
  
  RETURN NEW;
END;
$function$;
