import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { IndicatorCard } from '@/components/dashboard/IndicatorCard';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { HistoricalChart } from '@/components/dashboard/HistoricalChart';
import { CorrelationMatrix } from '@/components/dashboard/CorrelationMatrix';
import { useIndicators, IndicatorType } from '@/hooks/useIndicators';
import { supabase } from '@/integrations/supabase/client';
import { useAIInsights } from '@/hooks/useAIInsights';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { CalendarDays, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

import { Skeleton } from '@/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';



const indicatorMeta: Record<IndicatorType, { name: string; shortName: string; unit: string; description: string; glossary: string }> = {
  ipca: {
    name: 'IPCA - Índice de Preços ao Consumidor Amplo',
    shortName: 'Inflação (IPCA)',
    unit: '% a.a.',
    description: 'Principal indicador de inflação do Brasil, medido pelo IBGE',
    glossary: 'O IPCA mede a variação de preços de um conjunto de produtos e serviços consumidos pelas famílias brasileiras.',
  },
  selic: {
    name: 'Taxa Selic',
    shortName: 'Selic',
    unit: '% a.a.',
    description: 'Taxa básica de juros da economia brasileira',
    glossary: 'A Selic é a taxa básica de juros da economia, definida pelo Copom do Banco Central.',
  },
  igpm: {
    name: 'IGP-M - Índice Geral de Preços do Mercado',
    shortName: 'IGP-M',
    unit: '% a.a.',
    description: 'Índice usado para reajuste de contratos de aluguel',
    glossary: 'O IGP-M é calculado pela FGV e mede a variação de preços em diferentes etapas do processo produtivo.',
  },
  pib: {
    name: 'PIB - Produto Interno Bruto',
    shortName: 'PIB',
    unit: '% a.a.',
    description: 'Soma de todos os bens e serviços produzidos no país',
    glossary: 'O Produto Interno Bruto representa a soma de todos os bens e serviços finais produzidos no país.',
  },
  dolar: {
    name: 'Taxa de Câmbio (USD/BRL)',
    shortName: 'Dólar',
    unit: 'R$',
    description: 'Cotação do dólar americano em reais',
    glossary: 'A taxa de câmbio representa o preço de uma moeda estrangeira em moeda nacional.',
  },
  balanca_comercial: {
    name: 'Balança Comercial',
    shortName: 'Balança Comercial',
    unit: 'US$ bi',
    description: 'Diferença entre exportações e importações',
    glossary: 'A balança comercial é a diferença entre o valor das exportações e importações de um país.',
  },
  desemprego: {
    name: 'Taxa de Desemprego',
    shortName: 'Desemprego',
    unit: '%',
    description: 'Percentual da população economicamente ativa desocupada',
    glossary: 'A taxa de desemprego mede o percentual de pessoas que estão procurando trabalho mas não conseguem encontrar.',
  },
};

export default function Dashboard() {
  const [visibleIndicators, setVisibleIndicators] = useState<string[]>([]);
  const { data: rawIndicators, isLoading, refetch, isFetching } = useIndicators('24M');
  const queryClient = useQueryClient();
  const { selectedIndicators } = useUserPreferences();

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Process raw data into indicator cards format
  const processedIndicators = useMemo(() => {
    if (!rawIndicators || rawIndicators.length === 0) return [];

    const grouped: Record<IndicatorType, typeof rawIndicators> = {} as any;
    
    rawIndicators.forEach((ind) => {
      if (!grouped[ind.indicator]) {
        grouped[ind.indicator] = [];
      }
      grouped[ind.indicator].push(ind);
    });

    return (Object.keys(grouped) as IndicatorType[]).map((key) => {
      const data = grouped[key].sort((a, b) => 
        new Date(a.reference_date).getTime() - new Date(b.reference_date).getTime()
      );
      
      const latestValue = data[data.length - 1]?.value ?? 0;
      const previousValue = data[data.length - 2]?.value ?? latestValue;
      const firstValue = data[0]?.value ?? latestValue;
      
      const monthlyChange = previousValue !== 0 
        ? ((latestValue - previousValue) / previousValue) * 100 
        : 0;
      const annualChange = firstValue !== 0 
        ? ((latestValue - firstValue) / firstValue) * 100 
        : 0;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (monthlyChange > 1) trend = 'up';
      else if (monthlyChange < -1) trend = 'down';

      const meta = indicatorMeta[key];

      return {
        id: key,
        name: meta.name,
        shortName: meta.shortName,
        value: latestValue,
        unit: meta.unit,
        monthlyChange,
        annualChange,
        previousValue,
        trend,
        description: meta.description,
        glossary: meta.glossary,
        historicalData: data.map(d => ({
          date: d.reference_date.slice(0, 7),
          value: Number(d.value),
        })),
      };
    });
  }, [rawIndicators]);

  // AI-powered insights based on visible indicators
  const { 
    data: aiInsights, 
    isLoading: isLoadingInsights,
    isFetching: isFetchingInsights,
    error: insightsError,
    generateInsights,
  } = useAIInsights({
    indicators: processedIndicators,
    visibleIndicators: visibleIndicators.length > 0 ? visibleIndicators : undefined,
    period: '24M',
    enabled: processedIndicators.length > 0,
  });

  // Show toast for AI insight errors (402, 429, etc.)
  useEffect(() => {
    if (insightsError?.message) {
      toast.error(insightsError.message, { id: 'ai-insights-error' });
    }
  }, [insightsError?.message]);

  const handleVisibleIndicatorsChange = useCallback((ids: string[]) => {
    setVisibleIndicators(ids);
  }, []);

  const [isIngesting, setIsIngesting] = useState(false);

  const handleRefresh = async () => {
    setIsIngesting(true);
    try {
      const { error } = await supabase.functions.invoke('ingest-economic-data', {
        body: { indicators: ['all'] },
      });
      if (error) {
        console.error('Ingestion error:', error);
        toast.error('Erro ao consultar APIs de indicadores');
      } else {
        toast.success('Dados atualizados com sucesso!');
      }
    } catch (err) {
      console.error('Ingestion error:', err);
      toast.error('Erro ao atualizar dados');
    } finally {
      await refetch();
      setIsIngesting(false);
    }
  };

  const handleRefreshInsights = async () => {
    try {
      await generateInsights();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao gerar insights');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Indicadores Macroeconômicos
            </h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4 flex-shrink-0" />
              <span className="capitalize">{today}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isIngesting}
              className="gap-2 min-h-[40px]"
            >
              {isIngesting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Atualizando dados...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Recarregar dados
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Indicator Cards Grid */}
        {isLoading ? (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-[180px] rounded-lg" />
            ))}
          </div>
        ) : processedIndicators.length > 0 ? (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {processedIndicators
              .filter((ind) => selectedIndicators.includes(ind.id as IndicatorType))
              .map((indicator, index) => (
                <IndicatorCard key={indicator.id} indicator={indicator} index={index} />
              ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">
              Nenhum indicador disponível no momento.
            </p>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 min-w-0">
            <HistoricalChart 
              indicators={processedIndicators}
              onVisibleIndicatorsChange={handleVisibleIndicatorsChange}
            />
          </div>
          <div className="min-w-0">
            <InsightsPanel 
              insights={aiInsights || []} 
              isLoading={isLoadingInsights}
              onRefresh={handleRefreshInsights}
              isRefreshing={isFetchingInsights}
            />
          </div>
        </div>

        {/* Correlation Matrix */}
        {processedIndicators.length > 1 && (
          <CorrelationMatrix indicators={processedIndicators} />
        )}
      </div>
    </MainLayout>
  );
}
