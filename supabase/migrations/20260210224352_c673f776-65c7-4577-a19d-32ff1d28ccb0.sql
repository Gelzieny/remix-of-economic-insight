
-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Deny public access to subscribers" ON public.subscribers;

-- Add user_id column to link subscribers to auth users
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON public.subscribers(user_id);

-- RLS policies for authenticated users
CREATE POLICY "Users can view their own subscription"
ON public.subscribers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON public.subscribers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.subscribers FOR UPDATE
USING (auth.uid() = user_id);
