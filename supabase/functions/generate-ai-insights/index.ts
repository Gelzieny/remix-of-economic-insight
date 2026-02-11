import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

Restrições:
- Gere exatamente 3 insights
- Cada insight deve ser curto, direto e interpretável por um usuário não técnico
- Não inventar dados
- Não usar previsões
- Não repetir insights redundantes
- Quando relevante, indique o período aproximado do fenômeno`;

const VALID_INDICATORS = ['ipca', 'selic', 'igpm', 'pib', 'dolar', 'balanca_comercial', 'desemprego'] as const;

function normalizeIndicatorId(indicatorId: string): string {
  const normalized = indicatorId.toLowerCase().trim();
  const mappings: Record<string, string> = {
    'selic': 'selic', 'ipca': 'ipca', 'igpm': 'igpm', 'igp-m': 'igpm',
    'pib': 'pib', 'gdp': 'pib', 'dolar': 'dolar', 'dólar': 'dolar',
    'usd': 'dolar', 'balanca_comercial': 'balanca_comercial',
    'balança comercial': 'balanca_comercial', 'balanca': 'balanca_comercial',
    'desemprego': 'desemprego', 'unemployment': 'desemprego',
  };
  if (mappings[normalized]) return mappings[normalized];
  if (VALID_INDICATORS.includes(normalized as any)) return normalized;
  return 'selic';
}

function prepareDataSummary(activeIndicators: IndicatorData[], period: string): string {
  return activeIndicators.map(ind => {
    const recentData = ind.historicalData.slice(-12);
    const firstValue = recentData[0]?.value ?? ind.value;
    const lastValue = recentData[recentData.length - 1]?.value ?? ind.value;
    const periodChange = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
    const mean = recentData.reduce((sum, d) => sum + d.value, 0) / recentData.length;
    const variance = recentData.reduce((sum, d) => sum + Math.pow(d.value - mean, 2), 0) / recentData.length;
    const volatility = Math.sqrt(variance);
    const last3 = recentData.slice(-3);
    const prev3 = recentData.slice(-6, -3);
    const recentAvg = last3.reduce((sum, d) => sum + d.value, 0) / (last3.length || 1);
    const prevAvg = prev3.reduce((sum, d) => sum + d.value, 0) / (prev3.length || 1);
    const shortTermTrend = prevAvg !== 0 ? ((recentAvg - prevAvg) / prevAvg) * 100 : 0;

    return `
**${ind.shortName} (${ind.name})** [id: ${ind.id}]
- Valor atual: ${ind.value.toFixed(2)} ${ind.unit}
- Variação mensal: ${ind.monthlyChange.toFixed(2)}%
- Variação no período (${period}): ${periodChange.toFixed(2)}%
- Tendência curto prazo: ${shortTermTrend > 1 ? 'acelerando' : shortTermTrend < -1 ? 'desacelerando' : 'estável'}
- Volatilidade: ${volatility.toFixed(2)}
- Últimos dados: ${recentData.slice(-6).map(d => `${d.date}: ${d.value.toFixed(2)}`).join(', ')}
`;
  }).join('\n');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header', insights: [] }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const token = authHeader.replace('Bearer ', '');

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: authError } = await authClient.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Invalid token', insights: [] }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const userId = claimsData.claims.sub as string;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body: RequestBody = await req.json();
    const { indicators, visibleIndicators, period } = body;

    if (!indicators || indicators.length === 0) {
      return new Response(
        JSON.stringify({ insights: [], message: "No indicators provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const activeIndicators = visibleIndicators
      ? indicators.filter(ind => visibleIndicators.includes(ind.id))
      : indicators;

    if (activeIndicators.length === 0) {
      return new Response(
        JSON.stringify({ insights: [], message: "No visible indicators" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dataSummary = prepareDataSummary(activeIndicators, period);
    const userMessage = `Analise os seguintes indicadores econômicos brasileiros no período de ${period} e gere insights:

${dataSummary}

Indicadores ativos para análise: ${activeIndicators.map(i => i.shortName).join(', ')}

Gere exatamente 3 insights relevantes baseados nesses dados. Responda APENAS com JSON no formato:
{
  "insights": [
    {
      "title": "Título curto (max 50 chars)",
      "message": "Descrição do insight",
      "type": "trend" | "alert" | "correlation",
      "severity": "info" | "warning" | "success",
      "indicators": ["indicador1"]
    }
  ]
}`;

    // Use Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos.", insights: [] }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao seu workspace Lovable.", insights: [] }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("Lovable AI Gateway error:", response.status, errText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON - handle markdown code blocks
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, '').replace(/```\s*$/, '');
    }

    let parsedInsights;
    try {
      parsedInsights = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid JSON from AI");
    }

    const today = new Date().toISOString().split('T')[0];

    // Prepare insights for database
    const insightsToSave = (parsedInsights.insights || []).slice(0, 3).map((insight: any) => {
      const rawIndicator = insight.indicators?.[0] || activeIndicators[0]?.id || 'selic';
      const normalizedIndicator = normalizeIndicatorId(rawIndicator);
      return {
        user_id: userId,
        indicator: normalizedIndicator,
        title: (insight.title || insight.message.substring(0, 50)).substring(0, 100),
        description: insight.message,
        severity: ['info', 'warning', 'success'].includes(insight.severity) ? insight.severity : 'info',
        insight_type: ['trend', 'alert', 'correlation'].includes(insight.type) ? insight.type : 'trend',
        reference_date: today,
      };
    });

    // Persist to database
    if (insightsToSave.length > 0) {
      const { error: insertError } = await supabase
        .from('generated_insights')
        .insert(insightsToSave);

      if (insertError) {
        console.error('Error saving insights:', insertError);
      } else {
        console.log(`Saved ${insightsToSave.length} insights to database`);
      }
    }

    // Return insights for frontend
    const insights = (parsedInsights.insights || []).slice(0, 3).map((insight: any, index: number) => ({
      id: `ai-insight-${Date.now()}-${index}`,
      message: insight.message,
      type: insight.type || 'trend',
      severity: insight.severity || 'info',
      indicatorId: normalizeIndicatorId(insight.indicators?.[0] || activeIndicators[0]?.id || 'selic'),
      date: today,
    }));

    console.log("Generated and saved insights:", insights.length);

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating insights:", error);
    return new Response(
      JSON.stringify({ error: error.message, insights: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
