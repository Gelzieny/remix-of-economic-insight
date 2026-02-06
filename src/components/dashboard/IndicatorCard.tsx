import { TrendingUp, TrendingDown, Minus, HelpCircle, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { SparklineChart } from './SparklineChart';
import { cn } from '@/lib/utils';

interface Indicator {
  id: string;
  name: string;
  shortName: string;
  value: number;
  unit: string;
  monthlyChange: number;
  annualChange: number;
  previousValue: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
  glossary: string;
  historicalData: { date: string; value: number }[];
}

interface IndicatorCardProps {
  indicator: Indicator;
  index: number;
}

export function IndicatorCard({ indicator, index }: IndicatorCardProps) {
  const TrendIcon = indicator.trend === 'up' 
    ? TrendingUp 
    : indicator.trend === 'down' 
    ? TrendingDown 
    : Minus;

  const invertedIndicators = ['desemprego', 'ipca', 'igpm', 'dolar'];
  const isInverted = invertedIndicators.includes(indicator.id);

  const trendColor = indicator.trend === 'up'
    ? isInverted ? 'text-destructive' : 'text-success'
    : indicator.trend === 'down'
    ? isInverted ? 'text-success' : 'text-destructive'
    : 'text-muted-foreground';

  const changeColor = (value: number, inverted: boolean = false) => {
    if (value === 0) return 'text-muted-foreground';
    const isPositive = inverted ? value < 0 : value > 0;
    return isPositive ? 'text-success' : 'text-destructive';
  };

  const formatChange = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card className="card-hover group relative overflow-hidden border-border/50 bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        <CardHeader className="relative flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              {indicator.shortName}
            </h3>
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-muted-foreground/50 transition-colors hover:text-primary">
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="top" className="w-80 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">
                      {indicator.name}
                    </h4>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {indicator.glossary}
                    </p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <TrendIcon className={cn('h-4 w-4', trendColor)} />
        </CardHeader>

        <CardContent className="relative space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {indicator.id === 'dolar' ? 'R$ ' : ''}{indicator.value.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">{indicator.unit}</span>
          </div>

          <div className="flex gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Mensal: </span>
              <span className={changeColor(indicator.monthlyChange, isInverted)}>
                {formatChange(indicator.monthlyChange)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Anual: </span>
              <span className={changeColor(indicator.annualChange, isInverted)}>
                {formatChange(indicator.annualChange)}
              </span>
            </div>
          </div>

          <div className="sparkline-container">
            <SparklineChart 
              data={indicator.historicalData.slice(-12)} 
              trend={indicator.trend}
              inverted={isInverted}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
