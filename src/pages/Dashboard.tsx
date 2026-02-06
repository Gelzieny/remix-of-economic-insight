import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { IndicatorCard } from '@/components/dashboard/IndicatorCard';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { HistoricalChart } from '@/components/dashboard/HistoricalChart';
import { CorrelationMatrix } from '@/components/dashboard/CorrelationMatrix';
import { indicators, insights } from '@/data/mockData';
import { CalendarDays } from 'lucide-react';

export default function Dashboard() {
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-1"
        >
          <h1 className="text-2xl font-bold text-foreground">
            Indicadores Macroeconômicos
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span className="capitalize">{today}</span>
          </div>
        </motion.div>

        {/* Indicator Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {indicators.map((indicator, index) => (
            <IndicatorCard key={indicator.id} indicator={indicator} index={index} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <HistoricalChart />
          </div>
          <div>
            <InsightsPanel insights={insights} />
          </div>
        </div>

        {/* Correlation Matrix */}
        <CorrelationMatrix />
      </div>
    </MainLayout>
  );
}
