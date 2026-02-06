-- Remove foreign key constraint to allow system user
ALTER TABLE public.economic_indicators 
DROP CONSTRAINT IF EXISTS economic_indicators_user_id_fkey;