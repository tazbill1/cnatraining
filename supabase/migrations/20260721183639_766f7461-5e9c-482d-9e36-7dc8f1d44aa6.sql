
ALTER TABLE public.custom_scenarios ADD COLUMN IF NOT EXISTS module_id uuid REFERENCES public.dealership_modules(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_custom_scenarios_module_id ON public.custom_scenarios(module_id);

UPDATE public.custom_scenarios SET module_id='15729b87-1160-42f0-8f81-42bc95b1aab9' WHERE id='27ff0f36-f8ac-40d8-bab8-5da0779bbe23';
UPDATE public.custom_scenarios SET module_id='b6cc1b32-9cc7-4798-9297-c946b62cc47d' WHERE id='16e94229-3a1f-4c56-9c0a-7cc30979a417';
UPDATE public.custom_scenarios SET module_id='e2f523c8-424e-4c17-8486-6e14b9a38c6e' WHERE id='4d7b6437-0bfd-42ce-9ab3-7c9009c81d26';
UPDATE public.custom_scenarios SET module_id='3646c094-628a-4111-9e9f-bf4733cb2c6f' WHERE id='0f48cabc-38db-4f9c-ab77-0a153587700c';
UPDATE public.custom_scenarios SET module_id='01b5f734-eff1-41dd-8a97-5f10cf5c77c8' WHERE id IN ('ecd4ec98-89f8-4ef6-b192-823e1007f40a','2cb5c03a-a198-4bc8-a659-bf140feb0fe8','8d63fab0-1dd4-4564-9a2d-0708b122eb7e');
