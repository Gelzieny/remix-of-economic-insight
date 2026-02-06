-- Create economic_indicators table
CREATE TABLE public.economic_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  indicator TEXT NOT NULL CHECK (indicator IN ('ipca', 'selic', 'igpm', 'pib', 'dolar', 'balanca_comercial', 'desemprego')),
  value NUMERIC NOT NULL,
  reference_date DATE NOT NULL,
  UNIQUE(user_id, indicator, reference_date)
);

-- Create generated_insights table
CREATE TABLE public.generated_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  indicator TEXT NOT NULL CHECK (indicator IN ('ipca', 'selic', 'igpm', 'pib', 'dolar', 'balanca_comercial', 'desemprego')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'success')),
  insight_type TEXT NOT NULL DEFAULT 'trend' CHECK (insight_type IN ('trend', 'alert', 'correlation')),
  reference_date DATE NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.economic_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for economic_indicators
CREATE POLICY "Users can view their own indicators"
  ON public.economic_indicators
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own indicators"
  ON public.economic_indicators
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own indicators"
  ON public.economic_indicators
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own indicators"
  ON public.economic_indicators
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for generated_insights
CREATE POLICY "Users can view their own insights"
  ON public.generated_insights
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insights"
  ON public.generated_insights
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
  ON public.generated_insights
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insights"
  ON public.generated_insights
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_economic_indicators_user_id ON public.economic_indicators(user_id);
CREATE INDEX idx_economic_indicators_indicator ON public.economic_indicators(indicator);
CREATE INDEX idx_economic_indicators_reference_date ON public.economic_indicators(reference_date);
CREATE INDEX idx_generated_insights_user_id ON public.generated_insights(user_id);
CREATE INDEX idx_generated_insights_indicator ON public.generated_insights(indicator);

-- Function to generate insights based on indicator trends
CREATE OR REPLACE FUNCTION public.generate_indicator_insights(p_user_id UUID, p_indicator TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  latest_value NUMERIC;
  previous_value NUMERIC;
  change_percent NUMERIC;
  trend_title TEXT;
  trend_description TEXT;
  trend_severity TEXT;
BEGIN
  -- Get latest two values for the indicator
  SELECT value INTO latest_value
  FROM economic_indicators
  WHERE user_id = p_user_id AND indicator = p_indicator
  ORDER BY reference_date DESC
  LIMIT 1;

  SELECT value INTO previous_value
  FROM economic_indicators
  WHERE user_id = p_user_id AND indicator = p_indicator
  ORDER BY reference_date DESC
  LIMIT 1 OFFSET 1;

  -- If we have both values, calculate trend
  IF latest_value IS NOT NULL AND previous_value IS NOT NULL AND previous_value != 0 THEN
    change_percent := ((latest_value - previous_value) / previous_value) * 100;

    -- Determine trend message based on indicator type
    IF change_percent > 5 THEN
      trend_title := 'Alta significativa detectada';
      trend_severity := CASE 
        WHEN p_indicator IN ('desemprego', 'ipca', 'igpm', 'dolar') THEN 'warning'
        ELSE 'success'
      END;
    ELSIF change_percent < -5 THEN
      trend_title := 'Queda significativa detectada';
      trend_severity := CASE 
        WHEN p_indicator IN ('desemprego', 'ipca', 'igpm', 'dolar') THEN 'success'
        ELSE 'warning'
      END;
    ELSE
      trend_title := 'Estabilidade observada';
      trend_severity := 'info';
    END IF;

    trend_description := 'Variação de ' || ROUND(change_percent, 2) || '% no indicador';

    -- Insert insight (avoid duplicates for same date)
    INSERT INTO generated_insights (user_id, indicator, title, description, severity, insight_type, reference_date)
    VALUES (p_user_id, p_indicator, trend_title, trend_description, trend_severity, 'trend', CURRENT_DATE)
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;