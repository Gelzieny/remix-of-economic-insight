import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { IndicatorType } from '@/hooks/useIndicators';

const indicatorLabels: Record<IndicatorType, string> = {
  ipca: 'Inflação (IPCA)',
  selic: 'Taxa Selic',
  igpm: 'IGP-M',
  pib: 'PIB',
  dolar: 'Dólar (USD/BRL)',
  balanca_comercial: 'Balança Comercial',
  desemprego: 'Taxa de Desemprego',
};

export function DashboardSettingsDialog() {
  const { selectedIndicators, toggleIndicator, selectAll, allIndicators } =
    useUserPreferences();

  const allSelected = selectedIndicators.length === allIndicators.length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-sidebar-foreground/70 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground min-h-[44px]"
          title="Personalizar dashboard"
          aria-label="Personalizar dashboard"
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          Configurações
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Personalizar Dashboard</DialogTitle>
          <DialogDescription>
            Selecione os indicadores que deseja visualizar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {allIndicators.map((indicator) => (
            <label
              key={indicator}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-accent/50 transition-colors min-h-[44px]"
            >
              <Checkbox
                checked={selectedIndicators.includes(indicator)}
                onCheckedChange={() => toggleIndicator(indicator)}
              />
              <span className="text-sm font-medium">
                {indicatorLabels[indicator]}
              </span>
            </label>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={selectAll}
            disabled={allSelected}
          >
            Selecionar todos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
