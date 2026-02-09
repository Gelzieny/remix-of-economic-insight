import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { NewsDetailDialog } from '@/components/news/NewsDetailDialog';
import { useEconomicNews, EconomicNewsItem } from '@/hooks/useEconomicNews';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, ExternalLink, AlertCircle, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function News() {
  const [selectedNews, setSelectedNews] = useState<EconomicNewsItem | null>(null);
  const { data: news, isLoading, isError, refetch } = useEconomicNews();

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notícias Econômicas</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe as principais notícias do mercado e da economia brasileira
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Card className="border-destructive/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <p className="text-foreground font-medium">Erro ao carregar notícias</p>
              <p className="text-sm text-muted-foreground">
                Não foi possível buscar as notícias. Verifique sua conexão e tente novamente.
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2 min-h-[44px]">
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* News Grid */}
        {!isLoading && !isError && news && news.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <Card
                key={item.id}
                className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30"
                onClick={() => setSelectedNews(item)}
              >
                <CardHeader className="pb-2">
                  {item.source_name && (
                    <Badge variant="outline" className="w-fit text-xs">
                      {item.source_name}
                    </Badge>
                  )}
                  <h3 className="font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                </CardHeader>
                <CardContent>
                  {item.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {item.summary}
                    </p>
                  )}
                  <div className="flex items-center justify-end">
                    <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Ler mais
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && news && news.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
            <Newspaper className="h-10 w-10" />
            <p>Nenhuma notícia disponível no momento.</p>
          </div>
        )}

        {/* Detail Dialog */}
        <NewsDetailDialog
          news={selectedNews}
          open={!!selectedNews}
          onOpenChange={(open) => !open && setSelectedNews(null)}
        />
      </div>
    </MainLayout>
  );
}
