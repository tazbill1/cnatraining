CREATE OR REPLACE FUNCTION public.close_abandoned_training_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE n integer;
BEGIN
  UPDATE public.training_sessions
     SET status = 'abandoned'
   WHERE status = 'in_progress'
     AND started_at < now() - interval '3 days';
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.close_abandoned_training_sessions() FROM PUBLIC, anon, authenticated;

SELECT public.close_abandoned_training_sessions();

DO $$
BEGIN
  PERFORM cron.unschedule('close-abandoned-training-sessions');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule('close-abandoned-training-sessions', '17 3 * * *', $c$ SELECT public.close_abandoned_training_sessions(); $c$);