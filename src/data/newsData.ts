// Mock data for Economic News

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'politica_monetaria' | 'inflacao' | 'mercado' | 'fiscal' | 'internacional';
  source: string;
  publishedAt: string;
  imageUrl?: string;
  tags: string[];
}

const categoryLabels: Record<NewsItem['category'], string> = {
  politica_monetaria: 'Política Monetária',
  inflacao: 'Inflação',
  mercado: 'Mercado',
  fiscal: 'Fiscal',
  internacional: 'Internacional',
};

export const getCategoryLabel = (category: NewsItem['category']) => categoryLabels[category];

export const newsItems: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Copom mantém Selic em 13,25% e sinaliza cautela com inflação',
    summary: 'Comitê de Política Monetária decide manter taxa básica de juros estável, citando preocupações com a trajetória da inflação e cenário externo.',
    content: `O Comitê de Política Monetária (Copom) do Banco Central decidiu, por unanimidade, manter a taxa Selic em 13,25% ao ano na reunião encerrada nesta quarta-feira.

Em comunicado, o comitê destacou que "a conjuntura atual, caracterizada por um estágio do processo desinflacionário que tende a ser mais lento e por expectativas de inflação com reancoragem parcial, demanda serenidade e moderação na condução da política monetária".

O Copom também mencionou a importância de acompanhar os impactos do cenário externo, especialmente as incertezas relacionadas à política monetária nos Estados Unidos e seus efeitos sobre as economias emergentes.

Para a próxima reunião, o comitê indicou que seguirá monitorando a evolução dos indicadores econômicos, sem sinalizar de forma clara os próximos passos para a taxa de juros.

**Principais pontos do comunicado:**
- Inflação corrente acima da meta
- Expectativas parcialmente desancoradas
- Cenário externo demanda atenção
- Mercado de trabalho aquecido
- Atividade econômica resiliente`,
    category: 'politica_monetaria',
    source: 'Banco Central do Brasil',
    publishedAt: '2026-02-07T18:00:00Z',
    tags: ['Selic', 'Copom', 'Juros', 'Banco Central'],
  },
  {
    id: 'news-2',
    title: 'IPCA de janeiro fica em 0,42%, abaixo das expectativas',
    summary: 'Índice oficial de inflação registra desaceleração em relação a dezembro, puxado por queda nos preços de alimentos.',
    content: `O Índice Nacional de Preços ao Consumidor Amplo (IPCA), a medida oficial de inflação do Brasil, registrou alta de 0,42% em janeiro de 2026, de acordo com dados divulgados pelo IBGE nesta sexta-feira.

O resultado ficou abaixo da mediana das expectativas do mercado, que projetava alta de 0,52% para o mês. Em dezembro, o índice havia registrado alta de 0,62%.

O principal fator de desaceleração foi o grupo de Alimentação e bebidas, que passou de alta de 1,18% em dezembro para recuo de 0,15% em janeiro. A queda nos preços de frutas e legumes foi determinante para esse movimento.

**Destaques por grupo:**
- Alimentação e bebidas: -0,15%
- Transportes: +0,85%
- Habitação: +0,38%
- Saúde e cuidados pessoais: +0,62%
- Educação: +5,25%

No acumulado de 12 meses, o IPCA registra alta de 4,62%, ainda acima do centro da meta de inflação, que é de 3,0%.`,
    category: 'inflacao',
    source: 'IBGE',
    publishedAt: '2026-02-07T09:00:00Z',
    tags: ['IPCA', 'Inflação', 'IBGE', 'Preços'],
  },
  {
    id: 'news-3',
    title: 'Dólar recua 1,2% com fluxo positivo de investimentos estrangeiros',
    summary: 'Moeda americana fecha cotada a R$ 5,71, menor patamar em duas semanas, impulsionada por entrada de capital externo.',
    content: `O dólar comercial encerrou o pregão desta quinta-feira em queda de 1,2%, cotado a R$ 5,71, o menor valor de fechamento das últimas duas semanas.

O movimento de valorização do real foi impulsionado pela entrada de investimentos estrangeiros no país, especialmente em renda fixa, atraídos pelo diferencial de juros entre Brasil e Estados Unidos.

Dados do Banco Central mostram que o fluxo cambial está positivo em US$ 3,2 bilhões no acumulado do mês, sinalizando apetite dos investidores internacionais por ativos brasileiros.

**Fatores que influenciaram o câmbio:**
- Diferencial de juros favorável ao Brasil
- Entrada de recursos para renda fixa
- Queda do dólar no cenário global
- Dados econômicos positivos no país

Analistas destacam que a manutenção da Selic em patamar elevado deve continuar atraindo capital estrangeiro no curto prazo, mas alertam para riscos fiscais que podem reverter esse cenário.`,
    category: 'mercado',
    source: 'B3',
    publishedAt: '2026-02-06T18:30:00Z',
    tags: ['Dólar', 'Câmbio', 'Mercado', 'Investimentos'],
  },
  {
    id: 'news-4',
    title: 'Governo anuncia medidas de contenção de gastos para cumprir meta fiscal',
    summary: 'Ministério da Fazenda detalha cortes de R$ 25 bilhões em despesas para equilibrar as contas públicas em 2026.',
    content: `O Ministério da Fazenda anunciou nesta quarta-feira um pacote de contenção de gastos no valor de R$ 25 bilhões, com o objetivo de cumprir a meta de resultado primário estabelecida para 2026.

As medidas incluem contingenciamento de despesas discricionárias, revisão de contratos e renegociação de dívidas de entes subnacionais com a União.

O ministro da Fazenda destacou que as medidas são necessárias para manter a credibilidade fiscal do país e garantir a sustentabilidade da dívida pública no médio prazo.

**Principais medidas anunciadas:**
- Contingenciamento de R$ 15 bilhões em despesas discricionárias
- Revisão de contratos de serviços: R$ 5 bilhões
- Renegociação de dívidas estaduais: R$ 3 bilhões
- Otimização de programas sociais: R$ 2 bilhões

O mercado reagiu positivamente ao anúncio, com queda nos juros futuros e valorização do real. Analistas, no entanto, aguardam detalhamento das medidas para avaliar sua efetividade.`,
    category: 'fiscal',
    source: 'Ministério da Fazenda',
    publishedAt: '2026-02-05T16:00:00Z',
    tags: ['Fiscal', 'Gastos', 'Orçamento', 'Fazenda'],
  },
  {
    id: 'news-5',
    title: 'Fed sinaliza possibilidade de corte de juros no segundo semestre',
    summary: 'Banco central americano indica que condições podem permitir início do ciclo de afrouxamento monetário nos EUA.',
    content: `O Federal Reserve (Fed), banco central dos Estados Unidos, sinalizou em ata divulgada nesta quarta-feira que as condições econômicas podem permitir o início de um ciclo de corte de juros no segundo semestre de 2026.

A ata da última reunião do Fomc (Comitê Federal de Mercado Aberto) mostrou que a maioria dos membros considera que a inflação americana está em trajetória consistente de convergência para a meta de 2%.

A sinalização impactou positivamente os mercados globais, com valorização de ativos de risco e queda do dólar frente a moedas emergentes.

**Impactos para o Brasil:**
- Alívio na pressão sobre o câmbio
- Maior atratividade para investimentos em emergentes
- Possível antecipação do ciclo de queda da Selic
- Melhora nas condições financeiras globais

Economistas brasileiros avaliam que a perspectiva de juros menores nos EUA pode abrir espaço para o Banco Central do Brasil iniciar um ciclo de afrouxamento monetário mais cedo do que o previsto anteriormente.`,
    category: 'internacional',
    source: 'Federal Reserve',
    publishedAt: '2026-02-04T21:00:00Z',
    tags: ['Fed', 'EUA', 'Juros', 'Internacional'],
  },
  {
    id: 'news-6',
    title: 'PIB do Brasil cresce 0,8% no 4º trimestre e fecha 2025 com alta de 2,9%',
    summary: 'Economia brasileira supera expectativas e registra crescimento acima do projetado pelo mercado no ano passado.',
    content: `O Produto Interno Bruto (PIB) do Brasil cresceu 0,8% no quarto trimestre de 2025 em relação ao trimestre anterior, segundo dados divulgados pelo IBGE nesta terça-feira.

Com o resultado, a economia brasileira fechou o ano de 2025 com crescimento de 2,9%, superando a mediana das projeções do mercado, que apontava para alta de 2,5%.

O desempenho foi puxado principalmente pelo setor de serviços, que representa cerca de 70% do PIB, e pelo consumo das famílias, beneficiado pelo mercado de trabalho aquecido e programas de transferência de renda.

**Composição do crescimento em 2025:**
- Serviços: +3,2%
- Indústria: +2,1%
- Agropecuária: +1,8%

**Pela ótica da demanda:**
- Consumo das famílias: +3,5%
- Investimentos (FBCF): +1,2%
- Exportações: +4,8%

Para 2026, as projeções do mercado indicam crescimento entre 2,0% e 2,5%, a depender do cenário de juros e da evolução do quadro fiscal.`,
    category: 'mercado',
    source: 'IBGE',
    publishedAt: '2026-02-03T09:00:00Z',
    tags: ['PIB', 'Crescimento', 'Economia', 'IBGE'],
  },
];
