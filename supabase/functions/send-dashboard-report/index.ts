import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000000";

const indicatorMeta: Record<string, { name: string; unit: string }> = {
  ipca: { name: "Inflação (IPCA)", unit: "% a.a." },
  selic: { name: "Taxa Selic", unit: "% a.a." },
  igpm: { name: "IGP-M", unit: "% a.a." },
  pib: { name: "PIB", unit: "% a.a." },
  dolar: { name: "Dólar (USD/BRL)", unit: "R$" },
  balanca_comercial: { name: "Balança Comercial", unit: "US$ bi" },
  desemprego: { name: "Taxa de Desemprego", unit: "%" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse body for mode
    let mode = "test";
    try {
      const body = await req.json();
      if (body.mode && ["test", "scheduled"].includes(body.mode)) {
        mode = body.mode;
      }
    } catch {
      // No body or invalid JSON, default to test
    }

    console.log(`[send-dashboard-report] Mode: ${mode}, Timestamp: ${new Date().toISOString()}`);

    // Fetch all system indicators from the last 24 months
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 24);
    const cutoffStr = cutoffDate.toISOString().split("T")[0];

    const { data: rawIndicators, error: dbError } = await supabase
      .from("economic_indicators")
      .select("indicator, value, reference_date")
      .eq("user_id", SYSTEM_USER_ID)
      .gte("reference_date", cutoffStr)
      .order("reference_date", { ascending: true });

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    if (!rawIndicators || rawIndicators.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          mode,
          message: "No indicator data found",
          report_date: new Date().toISOString(),
          indicators: [],
          summary: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Group by indicator
    const grouped: Record<string, { value: number; reference_date: string }[]> = {};
    for (const row of rawIndicators) {
      if (!grouped[row.indicator]) {
        grouped[row.indicator] = [];
      }
      grouped[row.indicator].push({
        value: Number(row.value),
        reference_date: row.reference_date,
      });
    }

    // Build n8n-friendly summary table
    const summary = Object.entries(grouped).map(([key, data]) => {
      const sorted = data.sort(
        (a, b) => new Date(a.reference_date).getTime() - new Date(b.reference_date).getTime()
      );

      const latest = sorted[sorted.length - 1];
      const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;
      const first = sorted[0];

      const monthlyChange =
        previous && previous.value !== 0
          ? ((latest.value - previous.value) / Math.abs(previous.value)) * 100
          : 0;

      const periodChange =
        first && first.value !== 0
          ? ((latest.value - first.value) / Math.abs(first.value)) * 100
          : 0;

      let trend: "alta" | "queda" | "estável" = "estável";
      if (monthlyChange > 1) trend = "alta";
      else if (monthlyChange < -1) trend = "queda";

      const meta = indicatorMeta[key] || { name: key, unit: "" };

      return {
        indicador: meta.name,
        valor_atual: Number(latest.value.toFixed(4)),
        unidade: meta.unit,
        data_referencia: latest.reference_date,
        variacao_mensal_pct: Number(monthlyChange.toFixed(2)),
        variacao_periodo_pct: Number(periodChange.toFixed(2)),
        tendencia: trend,
        valor_anterior: previous ? Number(previous.value.toFixed(4)) : null,
        total_registros: sorted.length,
      };
    });

    // Sort summary by indicator name for consistent output
    summary.sort((a, b) => a.indicador.localeCompare(b.indicador));

    const reportDate = new Date().toISOString();

    const response = {
      success: true,
      mode,
      report_date: reportDate,
      report_title: `Relatório Macroeconômico - ${new Date().toLocaleDateString("pt-BR")}`,
      total_indicators: summary.length,
      summary,
      // Raw data grouped by indicator for detailed analysis if needed
      detailed_data: Object.fromEntries(
        Object.entries(grouped).map(([key, data]) => [
          key,
          {
            name: indicatorMeta[key]?.name || key,
            unit: indicatorMeta[key]?.unit || "",
            records: data.slice(-6), // Last 6 records for each
          },
        ])
      ),
    };

    console.log(
      `[send-dashboard-report] Report generated: ${summary.length} indicators, mode=${mode}`
    );

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[send-dashboard-report] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        mode: "error",
        report_date: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
