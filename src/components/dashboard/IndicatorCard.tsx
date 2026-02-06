import { TrendingUp, TrendingDown, Minus, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Indicator } from '@/data/mockData';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SparklineChart } from './SparklineChart';
import { cn } from '@/lib/utils';

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

  const trendColor = indicator.trend === 'up'
    ? indicator.id === 'desemprego' ? 'text-destructive' : 'text-success'
    : indicator.trend === 'down'
    ? indicator.id === 'desemprego' ? 'text-success' : 'text-destructive'
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
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground/50 transition-colors hover:text-primary">
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">{indicator.glossary}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <TrendIcon className={cn('h-4 w-4', trendColor)} />
        </CardHeader>

        <CardContent className="relative space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {indicator.id === 'cambio' ? 'R$ ' : ''}{indicator.value.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">{indicator.unit}</span>
          </div>

          <div className="flex gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Mensal: </span>
              <span className={changeColor(indicator.monthlyChange, indicator.id === 'desemprego')}>
                {formatChange(indicator.monthlyChange)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Anual: </span>
              <span className={changeColor(indicator.annualChange, indicator.id === 'desemprego')}>
                {formatChange(indicator.annualChange)}
              </span>
            </div>
          </div>

          <div className="sparkline-container">
            <SparklineChart 
              data={indicator.historicalData.slice(-12)} 
              trend={indicator.trend}
              inverted={indicator.id === 'desemprego'}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
