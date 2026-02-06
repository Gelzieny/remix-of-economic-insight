import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type IndicatorType = 'ipca' | 'selic' | 'igpm' | 'pib' | 'dolar' | 'balanca_comercial' | 'desemprego';

export interface EconomicIndicator {
  id: string;
  created_at: string;
  user_id: string;
  indicator: IndicatorType;
  value: number;
  reference_date: string;
}

export interface IndicatorInput {
  indicator: IndicatorType;
  value: number;
  reference_date: string;
}

type PeriodFilter = '6M' | '12M' | '24M';

function getDateFromPeriod(period: PeriodFilter): Date {
  const date = new Date();
  switch (period) {
    case '6M':
      date.setMonth(date.getMonth() - 6);
      break;
    case '12M':
      date.setMonth(date.getMonth() - 12);
      break;
    case '24M':
      date.setMonth(date.getMonth() - 24);
      break;
  }
  return date;
}

// System user ID for automated data ingestion
const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

export function useIndicators(period: PeriodFilter = '24M') {
  const { user } = useAuth();
  const startDate = getDateFromPeriod(period).toISOString().split('T')[0];

  return useQuery({
    queryKey: ['indicators', user?.id, period],
    queryFn: async () => {
      if (!user) return [];
      
      // Fetch both user's own data and system data (from automated ingestion)
      const { data, error } = await supabase
        .from('economic_indicators')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.eq.${SYSTEM_USER_ID}`)
        .gte('reference_date', startDate)
        .order('reference_date', { ascending: true });

      if (error) {
        console.error('Error fetching indicators:', error);
        throw error;
      }

      return data as EconomicIndicator[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useIndicatorsByType(indicatorType: IndicatorType, period: PeriodFilter = '24M') {
  const { user } = useAuth();
  const startDate = getDateFromPeriod(period).toISOString().split('T')[0];

  return useQuery({
    queryKey: ['indicators', user?.id, indicatorType, period],
    queryFn: async () => {
      if (!user) return [];
      
      // Fetch both user's own data and system data
      const { data, error } = await supabase
        .from('economic_indicators')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.eq.${SYSTEM_USER_ID}`)
        .eq('indicator', indicatorType)
        .gte('reference_date', startDate)
        .order('reference_date', { ascending: true });

      if (error) {
        console.error('Error fetching indicators by type:', error);
        throw error;
      }

      return data as EconomicIndicator[];
    },
    enabled: !!user,
  });
}

export function useCreateIndicator() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: IndicatorInput) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('economic_indicators')
        .insert({
          user_id: user.id,
          indicator: input.indicator,
          value: input.value,
          reference_date: input.reference_date,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Já existe um registro para este indicador nesta data.');
        }
        throw error;
      }

      // Generate insights after creating indicator
      await supabase.rpc('generate_indicator_insights', {
        p_user_id: user.id,
        p_indicator: input.indicator,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indicators'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      toast({
        title: 'Indicador criado',
        description: 'O indicador foi adicionado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar indicador',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateIndicator() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<IndicatorInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('economic_indicators')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indicators'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      toast({
        title: 'Indicador atualizado',
        description: 'O indicador foi atualizado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar indicador',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteIndicator() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('economic_indicators')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indicators'] });
      toast({
        title: 'Indicador excluído',
        description: 'O indicador foi removido com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir indicador',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useBulkCreateIndicators() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (inputs: IndicatorInput[]) => {
      if (!user) throw new Error('User not authenticated');

      const records = inputs.map(input => ({
        user_id: user.id,
        indicator: input.indicator,
        value: input.value,
        reference_date: input.reference_date,
      }));

      const { data, error } = await supabase
        .from('economic_indicators')
        .upsert(records, { onConflict: 'user_id,indicator,reference_date' })
        .select();

      if (error) throw error;

      // Generate insights for each indicator type
      const uniqueIndicators = [...new Set(inputs.map(i => i.indicator))];
      for (const indicator of uniqueIndicators) {
        await supabase.rpc('generate_indicator_insights', {
          p_user_id: user.id,
          p_indicator: indicator,
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indicators'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      toast({
        title: 'Dados atualizados',
        description: 'Os indicadores foram atualizados com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar dados',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
