-- Create a unique constraint for upsert operations
ALTER TABLE public.economic_indicators 
DROP CONSTRAINT IF EXISTS economic_indicators_unique_user_indicator_date;

ALTER TABLE public.economic_indicators 
ADD CONSTRAINT economic_indicators_unique_user_indicator_date 
UNIQUE (user_id, indicator, reference_date);

-- Create policy to allow users to view system data (from automated ingestion)
DROP POLICY IF EXISTS "Users can view system indicators" ON public.economic_indicators;
CREATE POLICY "Users can view system indicators" 
ON public.economic_indicators 
FOR SELECT 
USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

-- Grant service role full access for ingestion
-- Note: Service role bypasses RLS, so no additional policy needed for inserts