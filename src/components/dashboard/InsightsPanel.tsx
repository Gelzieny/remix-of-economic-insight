import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle, GitCompare, Lightbulb, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export interface AIInsight {
  id: string;
  indicatorId: string;
  type: 'trend' | 'alert' | 'correlation';
  message: string;
  severity: 'info' | 'warning' | 'success';
  date: string;
}

interface InsightsPanelProps {
  insights: AIInsight[];
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const indicatorLabels: Record<string, string> = {
  ipca: 'IPCA',
  selic: 'Selic',
  igpm: 'IGP-M',
  pib: 'PIB',
  dolar: 'Dólar',
  balanca_comercial: 'Balança',
  desemprego: 'Desemprego',
  general: 'Geral',
};

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

export function InsightsPanel({ insights, isLoading, onRefresh, isRefreshing }: InsightsPanelProps) {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Lightbulb className="h-5 w-5 text-primary" />
            Insights com IA
          </CardTitle>
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onRefresh}
              disabled={isLoading || isRefreshing}
              title="Atualizar insights"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Analisando dados com IA...</span>
            </div>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </>
        ) : insights.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            <p>Nenhum insight disponível.</p>
            <p className="mt-1">Ative indicadores para gerar insights.</p>
          </div>
        ) : (
          insights.map((insight, index) => {
            const Icon = iconMap[insight.type] || TrendingUp;

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={cn(
                  'rounded-lg border-l-4 p-3 transition-colors hover:bg-muted/50',
                  severityStyles[insight.severity] || severityStyles.info
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
                    <p className="text-sm text-foreground leading-relaxed">{insight.message}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded bg-muted px-1.5 py-0.5">
                        {indicatorLabels[insight.indicatorId] || insight.indicatorId}
                      </span>
                      <span>•</span>
                      <span>{new Date(insight.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
