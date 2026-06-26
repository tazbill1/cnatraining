
-- Add category to dealership_modules
ALTER TABLE public.dealership_modules
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'phone'
  CHECK (category IN ('phone','internet','showroom','followup'));

CREATE INDEX IF NOT EXISTS idx_dealership_modules_category
  ON public.dealership_modules(category);

-- Add category to dealership_practice_scenarios
ALTER TABLE public.dealership_practice_scenarios
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'phone'
  CHECK (category IN ('phone','internet','showroom','followup'));

CREATE INDEX IF NOT EXISTS idx_dealership_practice_scenarios_category
  ON public.dealership_practice_scenarios(category);

-- Add category to custom_scenarios
ALTER TABLE public.custom_scenarios
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'phone'
  CHECK (category IN ('phone','internet','showroom','followup'));

CREATE INDEX IF NOT EXISTS idx_custom_scenarios_category
  ON public.custom_scenarios(category);
