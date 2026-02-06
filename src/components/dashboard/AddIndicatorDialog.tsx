import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateIndicator, IndicatorType } from '@/hooks/useIndicators';

const indicatorOptions: { value: IndicatorType; label: string }[] = [
  { value: 'ipca', label: 'IPCA (Inflação)' },
  { value: 'selic', label: 'Taxa Selic' },
  { value: 'igpm', label: 'IGP-M' },
  { value: 'pib', label: 'PIB' },
  { value: 'dolar', label: 'Dólar (USD/BRL)' },
  { value: 'balanca_comercial', label: 'Balança Comercial' },
  { value: 'desemprego', label: 'Desemprego' },
];

export function AddIndicatorDialog() {
  const [open, setOpen] = useState(false);
  const [indicator, setIndicator] = useState<IndicatorType | ''>('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  
  const createIndicator = useCreateIndicator();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!indicator || !value || !date) return;

    await createIndicator.mutateAsync({
      indicator,
      value: parseFloat(value),
      reference_date: date,
    });

    setOpen(false);
    setIndicator('');
    setValue('');
    setDate('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Indicador
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Indicador</DialogTitle>
          <DialogDescription>
            Insira um novo registro de indicador econômico.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="indicator">Indicador</Label>
            <Select value={indicator} onValueChange={(v) => setIndicator(v as IndicatorType)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o indicador" />
              </SelectTrigger>
              <SelectContent>
                {indicatorOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="value">Valor</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              placeholder="Ex: 4.62"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Data de Referência</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createIndicator.isPending || !indicator || !value || !date}>
              {createIndicator.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Adicionar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
