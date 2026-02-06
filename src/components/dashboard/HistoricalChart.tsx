import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { indicators } from '@/data/mockData';
import { cn } from '@/lib/utils';

const chartColors = [
  'hsl(var(--chart-primary))',
  'hsl(var(--chart-secondary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
  'hsl(187, 60%, 70%)',
  'hsl(262, 60%, 70%)',
];

const timeRanges = [
  { label: '6M', months: 6 },
  { label: '12M', months: 12 },
  { label: '24M', months: 24 },
];

export function HistoricalChart() {
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['ipca', 'selic']);
  const [timeRange, setTimeRange] = useState(12);

  const toggleIndicator = (id: string) => {
    setSelectedIndicators(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  // Prepare merged data for selected indicators
  const mergedData = (() => {
    const dataMap = new Map<string, Record<string, number>>();
    
    selectedIndicators.forEach(id => {
      const indicator = indicators.find(i => i.id === id);
      if (!indicator) return;
      
      indicator.historicalData.slice(-timeRange).forEach(point => {
        const existing = dataMap.get(point.date) || {};
        dataMap.set(point.date, { ...existing, [id]: point.value });
      });
    });

    return Array.from(dataMap.entries())
      .map(([date, values]) => ({ date, ...values }))
      .sort((a, b) => a.date.localeCompare(b.date));
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold">
              Análise Histórica
            </CardTitle>
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              {timeRanges.map(range => (
                <Button
                  key={range.months}
                  variant="ghost"
                  size="sm"
                  onClick={() => setTimeRange(range.months)}
                  className={cn(
                    'h-7 px-3 text-xs',
                    timeRange === range.months && 'bg-background shadow-sm'
                  )}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Indicator toggles */}
          <div className="flex flex-wrap gap-2 pt-2">
            {indicators.map((indicator, index) => (
              <Button
                key={indicator.id}
                variant="outline"
                size="sm"
                onClick={() => toggleIndicator(indicator.id)}
                className={cn(
                  'h-7 gap-1.5 border-border/50 px-2.5 text-xs transition-all',
                  selectedIndicators.includes(indicator.id) && 'border-primary/50 bg-primary/10'
                )}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: selectedIndicators.includes(indicator.id)
                      ? chartColors[index % chartColors.length]
                      : 'hsl(var(--muted-foreground))',
                  }}
                />
                {indicator.shortName}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mergedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  {selectedIndicators.map((id, index) => (
                    <linearGradient key={id} id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={chartColors[indicators.findIndex(i => i.id === id) % chartColors.length]}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={chartColors[indicators.findIndex(i => i.id === id) % chartColors.length]}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={value => {
                    const [year, month] = value.split('-');
                    return `${month}/${year.slice(2)}`;
                  }}
                />
                <YAxis
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  width={45}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  labelFormatter={value => {
                    const [year, month] = value.split('-');
                    const date = new Date(parseInt(year), parseInt(month) - 1);
                    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                  }}
                />
                <Legend
                  formatter={(value) => {
                    const indicator = indicators.find(i => i.id === value);
                    return indicator?.shortName || value;
                  }}
                  wrapperStyle={{ paddingTop: 16 }}
                />
                {selectedIndicators.map((id, index) => {
                  const colorIndex = indicators.findIndex(i => i.id === id);
                  return (
                    <Area
                      key={id}
                      type="monotone"
                      dataKey={id}
                      stroke={chartColors[colorIndex % chartColors.length]}
                      strokeWidth={2}
                      fill={`url(#gradient-${id})`}
                      name={id}
                      isAnimationActive={true}
                      animationDuration={800}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
