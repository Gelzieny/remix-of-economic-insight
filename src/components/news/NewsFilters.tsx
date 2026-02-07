import { Button } from '@/components/ui/button';
import { getCategoryLabel, NewsItem } from '@/data/newsData';

interface NewsFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'politica_monetaria', label: getCategoryLabel('politica_monetaria') },
  { value: 'inflacao', label: getCategoryLabel('inflacao') },
  { value: 'mercado', label: getCategoryLabel('mercado') },
  { value: 'fiscal', label: getCategoryLabel('fiscal') },
  { value: 'internacional', label: getCategoryLabel('internacional') },
];

export function NewsFilters({ selectedCategory, onCategoryChange }: NewsFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category.value}
          variant={selectedCategory === category.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(category.value)}
          className="transition-all"
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
}
