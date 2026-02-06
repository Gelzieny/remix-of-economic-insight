import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle, GitCompare, Lightbulb } from 'lucide-react';
import { Insight, indicators } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface InsightsPanelProps {
  insights: Insight[];
}

const iconMap = {
  trend: TrendingUp,
  alert: AlertCircle,
  correlation: GitCompare,
};

const severityStyles = {
  info: 'border-l-primary bg-primary/5',
  warning: 'border-l-warning bg-warning/5',
  success: 'border-l-success bg-success/5',
};

export function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Lightbulb className="h-5 w-5 text-primary" />
          Insights Automáticos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = iconMap[insight.type];
          const indicator = indicators.find(i => i.id === insight.indicatorId);

          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={cn(
                'rounded-lg border-l-4 p-3 transition-colors hover:bg-muted/50',
                severityStyles[insight.severity]
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className={cn(
                  'mt-0.5 h-4 w-4 flex-shrink-0',
                  insight.severity === 'info' && 'text-primary',
                  insight.severity === 'warning' && 'text-warning',
                  insight.severity === 'success' && 'text-success',
                )} />
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-foreground">{insight.message}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded bg-muted px-1.5 py-0.5">
                      {indicator?.shortName}
                    </span>
                    <span>•</span>
                    <span>{new Date(insight.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
