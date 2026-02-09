const sourceColors: Record<string, string> = {
  'G1': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  'UOL Economia': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  'O Globo': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  'CNN Brasil': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  'Jornal Mercado': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  'Seu Dinheiro': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
};

export function getSourceColor(source: string): string {
  return sourceColors[source] ?? 'bg-muted text-muted-foreground border-border';
}
