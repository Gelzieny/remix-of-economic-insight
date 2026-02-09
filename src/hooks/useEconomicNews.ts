import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EconomicNewsItem {
  id: number;
  title: string;
  summary: string | null;
  source_name: string | null;
  source_url: string | null;
  investor_impact: string | null;
  education_analysis: string | null;
  relevance_justification: string | null;
}

export function useEconomicNews() {
  return useQuery({
    queryKey: ['economic-news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('economic_news')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      return data as EconomicNewsItem[];
    },
  });
}
