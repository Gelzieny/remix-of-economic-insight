import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { IndicatorType } from './useIndicators';

export interface GeneratedInsight {
  id: string;
  created_at: string;
  user_id: string;
  indicator: IndicatorType;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'success';
  insight_type: 'trend' | 'alert' | 'correlation';
  reference_date: string;
}

export function useInsights() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['insights', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('generated_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('reference_date', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching insights:', error);
        throw error;
      }

      return data as GeneratedInsight[];
    },
    enabled: !!user,
  });
}

export function useGenerateInsights() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (indicatorType?: IndicatorType) => {
      if (!user) throw new Error('User not authenticated');

      const indicators: IndicatorType[] = indicatorType 
        ? [indicatorType]
        : ['ipca', 'selic', 'igpm', 'pib', 'dolar', 'balanca_comercial', 'desemprego'];

      for (const indicator of indicators) {
        await supabase.rpc('generate_indicator_insights', {
          p_user_id: user.id,
          p_indicator: indicator,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      toast({
        title: 'Insights gerados',
        description: 'Os insights foram atualizados com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao gerar insights',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteInsight() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('generated_insights')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      toast({
        title: 'Insight excluído',
        description: 'O insight foi removido com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir insight',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
