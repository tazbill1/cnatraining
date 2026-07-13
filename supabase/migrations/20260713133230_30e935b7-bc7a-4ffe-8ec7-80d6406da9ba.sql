
-- Lock down queue helper SECURITY DEFINER functions: pin search_path and remove public/anon EXECUTE.
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;

REVOKE ALL ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;

-- Scope module_completions write policies to authenticated only (match schema-wide pattern).
DROP POLICY IF EXISTS "Users can insert their own completions" ON public.module_completions;
CREATE POLICY "Users can insert their own completions"
ON public.module_completions
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = user_id)
  AND (
    public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR ((dealership_id IS NOT NULL) AND (dealership_id = public.get_user_dealership_id(auth.uid())))
  )
);

DROP POLICY IF EXISTS "Users can update their own completions" ON public.module_completions;
CREATE POLICY "Users can update their own completions"
ON public.module_completions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  (auth.uid() = user_id)
  AND (
    public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR ((dealership_id IS NOT NULL) AND (dealership_id = public.get_user_dealership_id(auth.uid())))
  )
);
