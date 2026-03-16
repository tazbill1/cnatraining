
-- Create practice scenarios table for custom dealership modules
CREATE TABLE public.dealership_practice_scenarios (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id uuid NOT NULL REFERENCES public.dealership_modules(id) ON DELETE CASCADE,
  difficulty text NOT NULL DEFAULT 'intermediate',
  title text NOT NULL,
  customer_setup text NOT NULL,
  customer_quote text NOT NULL,
  decision_points jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(module_id, difficulty)
);

-- Enable RLS
ALTER TABLE public.dealership_practice_scenarios ENABLE ROW LEVEL SECURITY;

-- Deny anonymous access
CREATE POLICY "Deny anon dealership_practice_scenarios"
ON public.dealership_practice_scenarios
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Super admins full access
CREATE POLICY "Super admins manage dealership_practice_scenarios"
ON public.dealership_practice_scenarios
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Managers view own dealership practice scenarios
CREATE POLICY "Managers view dealership practice scenarios"
ON public.dealership_practice_scenarios
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'manager'::app_role)
  AND module_id IN (
    SELECT id FROM dealership_modules
    WHERE dealership_id = get_user_dealership_id(auth.uid())
  )
);

-- Users view own dealership practice scenarios
CREATE POLICY "Users view own dealership practice scenarios"
ON public.dealership_practice_scenarios
FOR SELECT
TO authenticated
USING (
  module_id IN (
    SELECT id FROM dealership_modules
    WHERE dealership_id = get_user_dealership_id(auth.uid())
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_dealership_practice_scenarios_updated_at
BEFORE UPDATE ON public.dealership_practice_scenarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
