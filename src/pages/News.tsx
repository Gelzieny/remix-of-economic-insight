import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { NewsCard } from '@/components/news/NewsCard';
import { NewsDetailDialog } from '@/components/news/NewsDetailDialog';
import { NewsFilters } from '@/components/news/NewsFilters';
import { newsItems, NewsItem } from '@/data/newsData';

export default function News() {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredNews = selectedCategory === 'all'
    ? newsItems
    : newsItems.filter(news => news.category === selectedCategory);

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

        {/* Filters */}
        <NewsFilters
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* News Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNews.map((news) => (
            <NewsCard
              key={news.id}
              news={news}
              onClick={() => setSelectedNews(news)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredNews.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhuma notícia encontrada para esta categoria.
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
