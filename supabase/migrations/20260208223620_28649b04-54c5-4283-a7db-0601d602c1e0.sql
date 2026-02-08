-- Drop existing policy and create proper restrictive policies for subscribers table
DROP POLICY IF EXISTS "Service role full access" ON public.subscribers;

-- Create policy that denies all access except via service role (which bypasses RLS)
-- This ensures only edge functions with service role key can access subscriber data
CREATE POLICY "Deny public access to subscribers"
ON public.subscribers
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);