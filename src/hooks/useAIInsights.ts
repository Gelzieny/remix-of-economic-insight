import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AIInsight {
  id: string;
  message: string;
  type: 'trend' | 'alert' | 'correlation';
  severity: 'info' | 'warning' | 'success';
  indicatorId: string;
  date: string;
}

interface IndicatorData {
  id: string;
  name: string;
  shortName: string;
  value: number;
  unit: string;
  monthlyChange: number;
  annualChange: number;
  trend: 'up' | 'down' | 'stable';
  historicalData: { date: string; value: number }[];
}

interface UseAIInsightsParams {
  indicators: IndicatorData[];
  visibleIndicators?: string[];
  period: string;
  enabled?: boolean;
}

export function useAIInsights({ 
  indicators, 
  visibleIndicators, 
  period, 
  enabled = true 
}: UseAIInsightsParams) {
  const { user } = useAuth();

  // Create a stable key based on visible indicators
  const visibleKey = visibleIndicators?.sort().join(',') || 'all';

  return useQuery({
    queryKey: ['ai-insights', period, visibleKey, indicators.length],
    queryFn: async (): Promise<AIInsight[]> => {
      if (!user || indicators.length === 0) return [];

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        console.error('No access token available');
        return [];
      }

      const response = await supabase.functions.invoke('generate-ai-insights', {
        body: {
          indicators,
          visibleIndicators,
          period,
        },
      });

      if (response.error) {
        console.error('Error generating AI insights:', response.error);
        throw new Error(response.error.message || 'Failed to generate insights');
      }

      return response.data?.insights || [];
    },
    enabled: enabled && !!user && indicators.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes - insights are relatively stable
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
