import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IndicatorData {
  id: string;
  name: string;
  shortName: string;
  value: number;
  unit: string;
  monthlyChange: number;
  annualChange: number;
  trend: 'up' | 'down' | 'stable';
  historicalData: { date: string; value: number }[];
}

interface RequestBody {
  indicators: IndicatorData[];
  visibleIndicators?: string[];
  period: string;
}

const SYSTEM_PROMPT = `Você é um analista econômico sênior especializado em macroeconomia brasileira.

Objetivo:
Gerar INSIGHTS AUTOMÁTICOS, claros e acionáveis, a partir dos dados econômicos fornecidos.

Contexto dos indicadores:
- Selic: Taxa básica de juros definida pelo Copom
- IPCA: Principal índice de inflação ao consumidor
- IGP-M: Índice de inflação usado em contratos (mais volátil)
- PIB: Crescimento econômico do país
- Desemprego: Taxa de desocupação da população
- Dólar: Cotação USD/BRL
- Balança Comercial: Diferença entre exportações e importações

Instruções:
1. Analise tendências recentes (curto e médio prazo)
2. Identifique aceleração, desaceleração ou reversões de tendência
3. Destaque divergências relevantes entre indicadores (ex: juros vs inflação)
4. Aponte possíveis relações macroeconômicas (correlação temporal)
5. Detecte eventos atípicos (picos, quedas abruptas)
6. Compare o comportamento relativo dos indicadores
7. Base TODOS os insights nos dados fornecidos, sem especulação

Formato de resposta (JSON):
{
  "insights": [
    {
      "message": "Texto do insight claro e objetivo",
      "type": "trend" | "alert" | "correlation",
      "severity": "info" | "warning" | "success",
      "indicators": ["indicador1", "indicador2"]
    }
  ]
}

Restrições:
- Gere entre 3 e 6 insights
- Cada insight deve ser curto, direto e interpretável por um usuário não técnico
- Não inventar dados
- Não usar previsões
- Não repetir insights redundantes
- Quando relevante, indique o período aproximado do fenômeno`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { indicators, visibleIndicators, period } = body;

    if (!indicators || indicators.length === 0) {
      return new Response(
        JSON.stringify({ insights: [], message: "No indicators provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter indicators based on visibility if provided
    const activeIndicators = visibleIndicators 
      ? indicators.filter(ind => visibleIndicators.includes(ind.id))
      : indicators;

    if (activeIndicators.length === 0) {
      return new Response(
        JSON.stringify({ insights: [], message: "No visible indicators" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare data summary for the AI
    const dataSummary = activeIndicators.map(ind => {
      const recentData = ind.historicalData.slice(-12); // Last 12 data points
      const firstValue = recentData[0]?.value ?? ind.value;
      const lastValue = recentData[recentData.length - 1]?.value ?? ind.value;
      const periodChange = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

      // Calculate volatility (standard deviation)
      const mean = recentData.reduce((sum, d) => sum + d.value, 0) / recentData.length;
      const variance = recentData.reduce((sum, d) => sum + Math.pow(d.value - mean, 2), 0) / recentData.length;
      const volatility = Math.sqrt(variance);

      // Detect trend direction from recent months
      const last3 = recentData.slice(-3);
      const prev3 = recentData.slice(-6, -3);
      const recentAvg = last3.reduce((sum, d) => sum + d.value, 0) / (last3.length || 1);
      const prevAvg = prev3.reduce((sum, d) => sum + d.value, 0) / (prev3.length || 1);
      const shortTermTrend = prevAvg !== 0 ? ((recentAvg - prevAvg) / prevAvg) * 100 : 0;

      return {
        nome: ind.name,
        sigla: ind.shortName,
        valorAtual: `${ind.value.toFixed(2)} ${ind.unit}`,
        variacaoMensal: `${ind.monthlyChange.toFixed(2)}%`,
        variacaoNoPeriodo: `${periodChange.toFixed(2)}%`,
        tendenciaCurtoPrazo: shortTermTrend > 1 ? 'acelerando' : shortTermTrend < -1 ? 'desacelerando' : 'estável',
        volatilidade: volatility.toFixed(2),
        ultimosDados: recentData.slice(-6).map(d => `${d.date}: ${d.value.toFixed(2)}`).join(', '),
      };
    }).map(d => `
**${d.sigla} (${d.nome})**
- Valor atual: ${d.valorAtual}
- Variação mensal: ${d.variacaoMensal}
- Variação no período (${period}): ${d.variacaoNoPeriodo}
- Tendência curto prazo: ${d.tendenciaCurtoPrazo}
- Volatilidade: ${d.volatilidade}
- Últimos dados: ${d.ultimosDados}
`).join('\n');

    const userMessage = `Analise os seguintes indicadores econômicos brasileiros no período de ${period} e gere insights:

${dataSummary}

Indicadores ativos para análise: ${activeIndicators.map(i => i.shortName).join(', ')}

Gere de 3 a 6 insights relevantes baseados nesses dados.`;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI Gateway error:", error);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    let parsedInsights;
    try {
      parsedInsights = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid JSON from AI");
    }

    // Add IDs and dates to insights
    const insights = (parsedInsights.insights || []).map((insight: any, index: number) => ({
      id: `ai-insight-${Date.now()}-${index}`,
      message: insight.message,
      type: insight.type || 'trend',
      severity: insight.severity || 'info',
      indicatorId: insight.indicators?.[0] || activeIndicators[0]?.id || 'general',
      date: new Date().toISOString().split('T')[0],
    }));

    console.log("Generated insights:", insights.length);

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating insights:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        insights: [] 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
