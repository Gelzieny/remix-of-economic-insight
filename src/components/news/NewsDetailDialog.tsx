import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { EconomicNewsItem } from '@/hooks/useEconomicNews';
import { Building2, ExternalLink, TrendingUp, GraduationCap, Info } from 'lucide-react';
import { getSourceColor } from '@/lib/sourceColors';

interface NewsDetailDialogProps {
  news: EconomicNewsItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewsDetailDialog({ news, open, onOpenChange }: NewsDetailDialogProps) {
  if (!news) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] w-[95vw] sm:w-full mx-auto">
        <DialogHeader>
          {news.source_name && (
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={getSourceColor(news.source_name)}>{news.source_name}</Badge>
            </div>
          )}
          <DialogTitle className="text-xl leading-tight">{news.title}</DialogTitle>
        </DialogHeader>

        {news.source_url && (
          <a
            href={news.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Ver matéria original
          </a>
        )}

        <Separator />

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-5">
            {news.summary && (
              <p className="text-muted-foreground font-medium">{news.summary}</p>
            )}

            {news.investor_impact && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Impacto para o Investidor
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{news.investor_impact}</p>
              </div>
            )}

            {news.education_analysis && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  Análise Educacional
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{news.education_analysis}</p>
              </div>
            )}

            {news.relevance_justification && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Info className="h-4 w-4 text-primary" />
                  Relevância
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{news.relevance_justification}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
