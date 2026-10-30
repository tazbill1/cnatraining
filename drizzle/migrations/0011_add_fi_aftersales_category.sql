DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT conrelid::regclass AS tbl, conname FROM pg_constraint
    WHERE contype='c' AND conrelid IN ('public.dealership_modules'::regclass,'public.dealership_practice_scenarios'::regclass)
      AND pg_get_constraintdef(oid) ILIKE '%followup%'
  LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.tbl, r.conname);
  END LOOP;
END $$;
ALTER TABLE public.dealership_modules ADD CONSTRAINT dealership_modules_category_check CHECK (category IN ('phone','internet','showroom','followup','fi'));
ALTER TABLE public.dealership_practice_scenarios ADD CONSTRAINT dealership_practice_scenarios_category_check CHECK (category IN ('phone','internet','showroom','followup','fi'));