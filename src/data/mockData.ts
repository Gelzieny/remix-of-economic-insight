// Mock data for Economic Insights Dashboard

export interface Indicator {
  id: string;
  name: string;
  shortName: string;
  value: number;
  unit: string;
  monthlyChange: number;
  annualChange: number;
  previousValue: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
  glossary: string;
  historicalData: { date: string; value: number }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinedAt: string;
  plan: string;
}

export interface Insight {
  id: string;
  indicatorId: string;
  type: 'trend' | 'alert' | 'correlation';
  message: string;
  severity: 'info' | 'warning' | 'success';
  date: string;
}

// Generate historical data for the last 24 months
const generateHistoricalData = (baseValue: number, volatility: number, trend: number = 0) => {
  const data: { date: string; value: number }[] = [];
  let value = baseValue * (1 - trend * 24 * 0.01);
  
  for (let i = 24; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const dateStr = date.toISOString().slice(0, 7);
    
    const change = (Math.random() - 0.5) * volatility + trend;
    value = Math.max(0.1, value * (1 + change));
    
    data.push({
      date: dateStr,
      value: parseFloat(value.toFixed(2)),
    });
  }
  
  return data;
};

export const indicators: Indicator[] = [
  {
    id: 'ipca',
    name: 'IPCA - Índice de Preços ao Consumidor Amplo',
    shortName: 'Inflação (IPCA)',
    value: 4.62,
    unit: '% a.a.',
    monthlyChange: 0.46,
    annualChange: 4.62,
    previousValue: 4.51,
    trend: 'up',
    description: 'Principal indicador de inflação do Brasil, medido pelo IBGE',
    glossary: 'O IPCA mede a variação de preços de um conjunto de produtos e serviços consumidos pelas famílias brasileiras com renda de 1 a 40 salários mínimos. É o índice oficial usado pelo Banco Central para metas de inflação.',
    historicalData: generateHistoricalData(4.5, 0.08, 0.005),
  },
  {
    id: 'selic',
    name: 'Taxa Selic',
    shortName: 'Selic',
    value: 13.25,
    unit: '% a.a.',
    monthlyChange: 0,
    annualChange: -0.5,
    previousValue: 13.25,
    trend: 'stable',
    description: 'Taxa básica de juros da economia brasileira',
    glossary: 'A Selic é a taxa básica de juros da economia, definida pelo Copom (Comitê de Política Monetária) do Banco Central. Ela influencia todas as outras taxas de juros do país.',
    historicalData: generateHistoricalData(13.25, 0.02, -0.003),
  },
  {
    id: 'igpm',
    name: 'IGP-M - Índice Geral de Preços do Mercado',
    shortName: 'IGP-M',
    value: 3.89,
    unit: '% a.a.',
    monthlyChange: 0.52,
    annualChange: 3.89,
    previousValue: 3.52,
    trend: 'up',
    description: 'Índice usado para reajuste de contratos de aluguel',
    glossary: 'O IGP-M é calculado pela FGV e mede a variação de preços em diferentes etapas do processo produtivo. É muito usado para reajuste de aluguéis e contratos de serviços.',
    historicalData: generateHistoricalData(4.0, 0.12, 0.002),
  },
  {
    id: 'pib',
    name: 'PIB - Produto Interno Bruto',
    shortName: 'PIB',
    value: 2.9,
    unit: '% a.a.',
    monthlyChange: 0.8,
    annualChange: 2.9,
    previousValue: 2.5,
    trend: 'up',
    description: 'Soma de todos os bens e serviços produzidos no país',
    glossary: 'O Produto Interno Bruto representa a soma de todos os bens e serviços finais produzidos no país em um determinado período. É o principal indicador de crescimento econômico.',
    historicalData: generateHistoricalData(2.8, 0.15, 0.008),
  },
  {
    id: 'cambio',
    name: 'Taxa de Câmbio (USD/BRL)',
    shortName: 'Dólar',
    value: 5.78,
    unit: 'R$',
    monthlyChange: 1.23,
    annualChange: 12.45,
    previousValue: 5.65,
    trend: 'up',
    description: 'Cotação do dólar americano em reais',
    glossary: 'A taxa de câmbio representa o preço de uma moeda estrangeira em moeda nacional. O dólar é a principal referência para o comércio internacional brasileiro.',
    historicalData: generateHistoricalData(5.5, 0.03, 0.004),
  },
  {
    id: 'balanca',
    name: 'Balança Comercial',
    shortName: 'Balança Comercial',
    value: 8.7,
    unit: 'US$ bi',
    monthlyChange: 15.2,
    annualChange: 23.5,
    previousValue: 7.2,
    trend: 'up',
    description: 'Diferença entre exportações e importações',
    glossary: 'A balança comercial é a diferença entre o valor das exportações e importações de um país. Quando positiva (superávit), indica que o país exportou mais do que importou.',
    historicalData: generateHistoricalData(7.5, 0.2, 0.01),
  },
  {
    id: 'desemprego',
    name: 'Taxa de Desemprego',
    shortName: 'Desemprego',
    value: 6.8,
    unit: '%',
    monthlyChange: -0.3,
    annualChange: -1.2,
    previousValue: 7.1,
    trend: 'down',
    description: 'Percentual da população economicamente ativa desocupada',
    glossary: 'A taxa de desemprego mede o percentual de pessoas que estão procurando trabalho mas não conseguem encontrar, em relação à população economicamente ativa.',
    historicalData: generateHistoricalData(7.5, 0.05, -0.008),
  },
];

export const mockUser: User = {
  id: 'user-1',
  name: 'Ana Carolina Silva',
  email: 'ana.silva@email.com',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  joinedAt: '2024-06-15',
  plan: 'Profissional',
};

export const insights: Insight[] = [
  {
    id: 'insight-1',
    indicatorId: 'ipca',
    type: 'trend',
    message: 'Inflação em tendência de alta há 3 meses consecutivos',
    severity: 'warning',
    date: '2025-02-06',
  },
  {
    id: 'insight-2',
    indicatorId: 'desemprego',
    type: 'trend',
    message: 'Taxa de desemprego atingiu menor nível em 10 anos',
    severity: 'success',
    date: '2025-02-05',
  },
  {
    id: 'insight-3',
    indicatorId: 'pib',
    type: 'alert',
    message: 'PIB superou expectativas do mercado no último trimestre',
    severity: 'success',
    date: '2025-02-04',
  },
  {
    id: 'insight-4',
    indicatorId: 'cambio',
    type: 'correlation',
    message: 'Dólar apresenta correlação inversa com a Selic neste período',
    severity: 'info',
    date: '2025-02-03',
  },
  {
    id: 'insight-5',
    indicatorId: 'selic',
    type: 'trend',
    message: 'Selic estável há 2 reuniões do Copom',
    severity: 'info',
    date: '2025-02-02',
  },
];

// Correlation matrix between indicators
export const correlationMatrix = {
  ipca: { selic: 0.85, igpm: 0.92, pib: -0.3, cambio: 0.65, desemprego: -0.4, balanca: -0.2 },
  selic: { ipca: 0.85, igpm: 0.78, pib: -0.45, cambio: -0.55, desemprego: 0.3, balanca: 0.1 },
  igpm: { ipca: 0.92, selic: 0.78, pib: -0.25, cambio: 0.7, desemprego: -0.35, balanca: -0.15 },
  pib: { ipca: -0.3, selic: -0.45, igpm: -0.25, cambio: -0.4, desemprego: -0.8, balanca: 0.6 },
  cambio: { ipca: 0.65, selic: -0.55, igpm: 0.7, pib: -0.4, desemprego: 0.25, balanca: -0.5 },
  desemprego: { ipca: -0.4, selic: 0.3, igpm: -0.35, pib: -0.8, cambio: 0.25, balanca: -0.3 },
  balanca: { ipca: -0.2, selic: 0.1, igpm: -0.15, pib: 0.6, cambio: -0.5, desemprego: -0.3 },
};
