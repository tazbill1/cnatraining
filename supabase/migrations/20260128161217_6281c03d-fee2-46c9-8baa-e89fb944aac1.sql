-- Revoke public/anonymous SELECT access from sensitive tables
-- RLS policies already handle proper access control for authenticated users

REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.training_sessions FROM anon;
REVOKE SELECT ON public.user_roles FROM anon;