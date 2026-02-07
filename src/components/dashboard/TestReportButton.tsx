import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function TestReportButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleTestReport = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-dashboard-report', {
        body: { mode: 'test' },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Relatório gerado com sucesso!', {
          description: `${data.total_indicators} indicadores coletados em ${new Date(data.report_date).toLocaleString('pt-BR')}`,
          icon: <CheckCircle2 className="h-4 w-4" />,
        });
      } else {
        throw new Error(data?.error || 'Erro desconhecido');
      }
    } catch (err: any) {
      toast.error('Erro ao gerar relatório', {
        description: err.message || 'Não foi possível conectar à Edge Function.',
        icon: <XCircle className="h-4 w-4" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleTestReport}
      disabled={isLoading}
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
      Testar Envio de Relatório
    </Button>
  );
}
