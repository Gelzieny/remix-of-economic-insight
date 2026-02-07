import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { NewsItem, getCategoryLabel } from '@/data/newsData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Building2, Tag } from 'lucide-react';

interface NewsDetailDialogProps {
  news: NewsItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryColors: Record<NewsItem['category'], string> = {
  politica_monetaria: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  inflacao: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  mercado: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  fiscal: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  internacional: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
};

export function NewsDetailDialog({ news, open, onOpenChange }: NewsDetailDialogProps) {
  if (!news) return null;

  const formattedDate = format(new Date(news.publishedAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
    locale: ptBR,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={categoryColors[news.category]}>
              {getCategoryLabel(news.category)}
            </Badge>
          </div>
          <DialogTitle className="text-xl leading-tight">{news.title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formattedDate}
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="h-4 w-4" />
            {news.source}
          </div>
        </div>

        <Separator />

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4">
            <p className="text-muted-foreground font-medium">{news.summary}</p>
            
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {news.content.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                  return (
                    <h4 key={index} className="font-semibold text-foreground mt-4 mb-2">
                      {paragraph.replace(/\*\*/g, '')}
                    </h4>
                  );
                }
                if (paragraph.startsWith('- ')) {
                  const items = paragraph.split('\n').filter(item => item.startsWith('- '));
                  return (
                    <ul key={index} className="list-disc list-inside space-y-1 text-muted-foreground">
                      {items.map((item, i) => (
                        <li key={i}>{item.replace('- ', '')}</li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={index} className="text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        <Separator />

        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {news.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
