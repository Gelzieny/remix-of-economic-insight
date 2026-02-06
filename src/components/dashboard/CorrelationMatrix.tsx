import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { indicators, correlationMatrix } from '@/data/mockData';
import { cn } from '@/lib/utils';

export function CorrelationMatrix() {
  const getCorrelationColor = (value: number) => {
    if (value >= 0.7) return 'bg-success/80 text-success-foreground';
    if (value >= 0.4) return 'bg-success/40 text-foreground';
    if (value >= 0.1) return 'bg-success/20 text-foreground';
    if (value >= -0.1) return 'bg-muted text-muted-foreground';
    if (value >= -0.4) return 'bg-destructive/20 text-foreground';
    if (value >= -0.7) return 'bg-destructive/40 text-foreground';
    return 'bg-destructive/80 text-destructive-foreground';
  };

  const getCorrelationDescription = (value: number) => {
    const absValue = Math.abs(value);
    const direction = value >= 0 ? 'positiva' : 'negativa';
    if (absValue >= 0.7) return `Correlação ${direction} forte`;
    if (absValue >= 0.4) return `Correlação ${direction} moderada`;
    if (absValue >= 0.1) return `Correlação ${direction} fraca`;
    return 'Sem correlação significativa';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">
            Matriz de Correlação
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Relação estatística entre os indicadores (-1 a 1)
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="grid gap-1" style={{ gridTemplateColumns: `auto repeat(${indicators.length - 1}, minmax(60px, 1fr))` }}>
                {/* Header row */}
                <div className="p-2" />
                {indicators.slice(1).map(indicator => (
                  <div
                    key={indicator.id}
                    className="p-2 text-center text-xs font-medium text-muted-foreground"
                  >
                    {indicator.shortName.split(' ')[0]}
                  </div>
                ))}

                {/* Data rows */}
                {indicators.slice(0, -1).map((rowIndicator, rowIndex) => (
                  <div key={rowIndicator.id} className="contents">
                    <div className="flex items-center p-2 text-xs font-medium text-muted-foreground">
                      {rowIndicator.shortName.split(' ')[0]}
                    </div>
                    {indicators.slice(1).map((colIndicator, colIndex) => {
                      if (colIndex < rowIndex) {
                        const correlation = (correlationMatrix as Record<string, Record<string, number>>)[rowIndicator.id]?.[colIndicator.id] ?? 0;
                        return (
                          <Tooltip key={colIndicator.id}>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  'flex items-center justify-center rounded-md p-2 text-xs font-medium transition-transform hover:scale-105 cursor-default',
                                  getCorrelationColor(correlation)
                                )}
                              >
                                {correlation.toFixed(2)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <div className="space-y-1 text-xs">
                                <p className="font-medium">
                                  {rowIndicator.shortName} × {colIndicator.shortName}
                                </p>
                                <p className="text-muted-foreground">
                                  {getCorrelationDescription(correlation)}
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      }
                      return (
                        <div
                          key={colIndicator.id}
                          className="flex items-center justify-center rounded-md bg-muted/30 p-2 text-xs text-muted-foreground/30"
                        >
                          —
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-destructive/60" />
              <span>Negativa</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-muted" />
              <span>Neutra</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-success/60" />
              <span>Positiva</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
