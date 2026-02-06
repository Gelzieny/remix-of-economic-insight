import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Eye, EyeOff } from 'lucide-react';

interface IndicatorData {
  id: string;
  shortName: string;
  unit: string;
  historicalData: { date: string; value: number }[];
}

interface HistoricalChartProps {
  indicators: IndicatorData[];
  period: '6M' | '12M' | '24M';
}

const chartColors = [
  'hsl(var(--chart-primary))', 
  'hsl(var(--chart-secondary))', 
  'hsl(var(--success))', 
  'hsl(var(--warning))', 
  'hsl(var(--destructive))', 
  'hsl(187, 60%, 60%)', 
  'hsl(262, 60%, 65%)'
];

// Normalize values to percentage change from first value
const normalizeData = (data: { date: string; value: number }[]) => {
  if (data.length === 0) return [];
  const firstValue = data[0].value;
  if (firstValue === 0) return data.map(p => ({ ...p, originalValue: p.value }));
  return data.map(point => ({
    date: point.date,
    value: ((point.value - firstValue) / firstValue) * 100,
    originalValue: point.value
  }));
};

export function HistoricalChart({ indicators, period }: HistoricalChartProps) {
  const [visibleIndicators, setVisibleIndicators] = useState<string[]>(
    indicators.map(i => i.id)
  );
  const [showNormalized, setShowNormalized] = useState(true);

  // Update visible indicators when indicators change
  useMemo(() => {
    const newIds = indicators.map(i => i.id);
    setVisibleIndicators(prev => {
      const validIds = prev.filter(id => newIds.includes(id));
      return validIds.length > 0 ? validIds : newIds;
    });
  }, [indicators]);

  const toggleIndicator = (id: string) => {
    setVisibleIndicators(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter(i => i !== id);
      }
      return [...prev, id];
    });
  };

  const toggleAll = () => {
    if (visibleIndicators.length === indicators.length) {
      setVisibleIndicators([indicators[0]?.id].filter(Boolean));
    } else {
      setVisibleIndicators(indicators.map(i => i.id));
    }
  };

  const { mergedData, trendSummary } = useMemo(() => {
    if (indicators.length === 0) {
      return { mergedData: [], trendSummary: [] };
    }

    const dataMap = new Map<string, Record<string, number>>();
    const originalMap = new Map<string, Record<string, number>>();

    indicators.forEach(indicator => {
      const data = indicator.historicalData;
      const normalized = showNormalized 
        ? normalizeData(data) 
        : data.map(p => ({ ...p, originalValue: p.value }));
      
      normalized.forEach(point => {
        const existing = dataMap.get(point.date) || {};
        const existingOriginal = originalMap.get(point.date) || {};
        dataMap.set(point.date, {
          ...existing,
          [indicator.id]: showNormalized ? point.value : point.originalValue
        });
        originalMap.set(point.date, {
          ...existingOriginal,
          [indicator.id]: point.originalValue
        });
      });
    });

    const merged = Array.from(dataMap.entries())
      .map(([date, values]) => ({
        date,
        ...values,
        _original: originalMap.get(date) || {}
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const summary = indicators.map(indicator => {
      const data = indicator.historicalData;
      if (data.length < 2) return { id: indicator.id, trend: 'stable' as const, change: 0 };
      
      const firstValue = data[0].value;
      const lastValue = data[data.length - 1].value;
      const change = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
      
      return {
        id: indicator.id,
        trend: change > 2 ? 'up' as const : change < -2 ? 'down' as const : 'stable' as const,
        change
      };
    });

    return { mergedData: merged, trendSummary: summary };
  }, [indicators, showNormalized]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3" />;
      case 'down': return <TrendingDown className="h-3 w-3" />;
      default: return <Minus className="h-3 w-3" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', indicatorId: string) => {
    const invertedIndicators = ['desemprego', 'ipca', 'igpm'];
    const isInverted = invertedIndicators.includes(indicatorId);
    
    if (trend === 'stable') return 'text-muted-foreground';
    if (trend === 'up') return isInverted ? 'text-destructive' : 'text-success';
    return isInverted ? 'text-success' : 'text-destructive';
  };

  if (indicators.length === 0) {
    return (
      <Card className="border-border/50 bg-card">
        <CardContent className="flex h-96 items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Adicione indicadores para visualizar o gráfico.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Análise Comparativa de Indicadores
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {showNormalized 
                    ? 'Variação percentual relativa ao início do período' 
                    : 'Valores absolutos dos indicadores'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="normalize"
                    checked={showNormalized}
                    onCheckedChange={setShowNormalized}
                  />
                  <Label htmlFor="normalize" className="text-xs">
                    Normalizado
                  </Label>
                </div>
              </div>
            </div>

            {/* Indicator toggles */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAll}
                className="h-7 gap-1.5 border-border/50 px-2.5 text-xs"
              >
                {visibleIndicators.length === indicators.length 
                  ? <><EyeOff className="h-3 w-3" /> Ocultar todos</> 
                  : <><Eye className="h-3 w-3" /> Mostrar todos</>}
              </Button>
              <div className="h-4 w-px bg-border" />
              {indicators.map((indicator, index) => {
                const trend = trendSummary.find(t => t.id === indicator.id);
                const isVisible = visibleIndicators.includes(indicator.id);
                
                return (
                  <Button
                    key={indicator.id}
                    variant="outline"
                    size="sm"
                    onClick={() => toggleIndicator(indicator.id)}
                    className={cn(
                      'h-7 gap-1.5 border-border/50 px-2.5 text-xs transition-all',
                      isVisible && 'border-primary/50 bg-primary/10'
                    )}
                  >
                    <span
                      className="h-2 w-2 rounded-full transition-colors"
                      style={{
                        backgroundColor: isVisible 
                          ? chartColors[index % chartColors.length] 
                          : 'hsl(var(--muted-foreground))'
                      }}
                    />
                    {indicator.shortName}
                    {trend && isVisible && (
                      <span className={cn('flex items-center gap-0.5', getTrendColor(trend.trend, indicator.id))}>
                        {getTrendIcon(trend.trend)}
                        <span className="text-[10px]">
                          {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                        </span>
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mergedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={value => {
                    const [year, month] = value.split('-');
                    return `${month}/${year?.slice(2) || ''}`;
                  }}
                />
                <YAxis
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  width={50}
                  tickFormatter={value => showNormalized ? `${value.toFixed(0)}%` : value.toFixed(1)}
                />
                {showNormalized && (
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" strokeWidth={1} />
                )}
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 8 }}
                  labelFormatter={value => {
                    const [year, month] = value.split('-');
                    const date = new Date(parseInt(year), parseInt(month) - 1);
                    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                  }}
                  formatter={(value: number, name: string, props: any) => {
                    const indicator = indicators.find(i => i.id === name);
                    const originalValue = props.payload._original?.[name];
                    if (showNormalized) {
                      return [
                        <span key={name}>
                          <span style={{ fontWeight: 600 }}>{value > 0 ? '+' : ''}{value.toFixed(2)}%</span>
                          <span style={{ color: 'hsl(var(--muted-foreground))', marginLeft: 8 }}>
                            (Atual: {originalValue?.toFixed(2)} {indicator?.unit})
                          </span>
                        </span>,
                        indicator?.shortName || name
                      ];
                    }
                    return [`${value.toFixed(2)} ${indicator?.unit}`, indicator?.shortName || name];
                  }}
                />
                <Legend
                  formatter={value => {
                    const indicator = indicators.find(i => i.id === value);
                    return indicator?.shortName || value;
                  }}
                  wrapperStyle={{ paddingTop: 16 }}
                />
                {indicators.map((indicator, index) => {
                  if (!visibleIndicators.includes(indicator.id)) return null;
                  return (
                    <Line
                      key={indicator.id}
                      type="monotone"
                      dataKey={indicator.id}
                      stroke={chartColors[index % chartColors.length]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2 }}
                      name={indicator.id}
                      isAnimationActive={true}
                      animationDuration={800}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
