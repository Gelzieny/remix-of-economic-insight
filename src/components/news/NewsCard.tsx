import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NewsItem, getCategoryLabel } from '@/data/newsData';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, ArrowRight } from 'lucide-react';

interface NewsCardProps {
  news: NewsItem;
  onClick: () => void;
}

const categoryColors: Record<NewsItem['category'], string> = {
  politica_monetaria: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  inflacao: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  mercado: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  fiscal: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  internacional: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
};

export function NewsCard({ news, onClick }: NewsCardProps) {
  const timeAgo = formatDistanceToNow(new Date(news.publishedAt), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 mb-2">
          <Badge variant="outline" className={categoryColors[news.category]}>
            {getCategoryLabel(news.category)}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </div>
        </div>
        <h3 className="font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {news.title}
        </h3>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {news.summary}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{news.source}</span>
          <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Ler mais
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
