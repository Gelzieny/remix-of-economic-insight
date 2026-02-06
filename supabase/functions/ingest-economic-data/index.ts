import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// System user ID for automated data ingestion (null means data is available to all users with proper queries)
const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000'

interface EconomicDataPoint {
  indicator: string
  value: number
  reference_date: string
}

// Convert BR date format (dd/MM/yyyy) to ISO (yyyy-MM-dd)
function brDateToISO(brDate: string): string {
  const [day, month, year] = brDate.split('/')
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

// Format date for BCB API queries
function formatDateForBCB(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// Fetch SELIC rate from BCB
async function fetchSelic(): Promise<EconomicDataPoint[]> {
  console.log('Fetching SELIC data...')
  try {
    // SELIC Meta (código 432) - taxa definida pelo COPOM
    const endDate = new Date()
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - 2)
    
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json&dataInicial=${formatDateForBCB(startDate)}&dataFinal=${formatDateForBCB(endDate)}`
    
    const response = await fetch(url)
    if (!response.ok) {
      console.error('SELIC API error:', response.status)
      return []
    }
    
    const data = await response.json()
    console.log(`SELIC: received ${data.length} records`)
    
    return data.map((item: { data: string; valor: string }) => ({
      indicator: 'selic',
      value: parseFloat(item.valor),
      reference_date: brDateToISO(item.data),
    })).filter((item: EconomicDataPoint) => !isNaN(item.value))
  } catch (error) {
    console.error('Error fetching SELIC:', error)
    return []
  }
}

// Fetch IPCA from Ipeadata
async function fetchIPCA(): Promise<EconomicDataPoint[]> {
  console.log('Fetching IPCA data...')
  try {
    // IPCA mensal acumulado 12 meses
    const url = `http://www.ipeadata.gov.br/api/odata4/ValoresSerie(SERCODIGO='PRECOS12_IPCAG12')`
    
    const response = await fetch(url)
    if (!response.ok) {
      console.error('IPCA API error:', response.status)
      return []
    }
    
    const data = await response.json()
    const values = data.value || []
    console.log(`IPCA: received ${values.length} records`)
    
    // Get last 24 months of data
    const recentData = values.slice(-24)
    
    return recentData.map((item: { VALDATA: string; VALVALOR: number }) => {
      const date = new Date(item.VALDATA)
      const isoDate = date.toISOString().split('T')[0]
      return {
        indicator: 'ipca',
        value: item.VALVALOR,
        reference_date: isoDate,
      }
    }).filter((item: EconomicDataPoint) => !isNaN(item.value))
  } catch (error) {
    console.error('Error fetching IPCA:', error)
    return []
  }
}

// Fetch IGP-M from Ipeadata
async function fetchIGPM(): Promise<EconomicDataPoint[]> {
  console.log('Fetching IGP-M data...')
  try {
    const url = `http://www.ipeadata.gov.br/api/odata4/ValoresSerie(SERCODIGO='IGP12_IGPMG12')`
    
    const response = await fetch(url)
    if (!response.ok) {
      console.error('IGP-M API error:', response.status)
      return []
    }
    
    const data = await response.json()
    const values = data.value || []
    console.log(`IGP-M: received ${values.length} records`)
    
    const recentData = values.slice(-24)
    
    return recentData.map((item: { VALDATA: string; VALVALOR: number }) => {
      const date = new Date(item.VALDATA)
      const isoDate = date.toISOString().split('T')[0]
      return {
        indicator: 'igpm',
        value: item.VALVALOR,
        reference_date: isoDate,
      }
    }).filter((item: EconomicDataPoint) => !isNaN(item.value))
  } catch (error) {
    console.error('Error fetching IGP-M:', error)
    return []
  }
}

// Fetch Dollar rate from BCB PTAX
async function fetchDolar(): Promise<EconomicDataPoint[]> {
  console.log('Fetching DOLAR data...')
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 6)
    
    const startStr = startDate.toISOString().split('T')[0].replace(/-/g, '-')
    const endStr = endDate.toISOString().split('T')[0].replace(/-/g, '-')
    
    // PTAX Venda
    const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@dataInicial='${startStr.replace(/-/g, '-')}'&@dataFinalCotacao='${endStr.replace(/-/g, '-')}'&$format=json&$orderby=dataHoraCotacao%20desc`
    
    const response = await fetch(url)
    if (!response.ok) {
      console.error('DOLAR API error:', response.status)
      return []
    }
    
    const data = await response.json()
    const values = data.value || []
    console.log(`DOLAR: received ${values.length} records`)
    
    // Group by date and get last quote of each day
    const byDate = new Map<string, number>()
    values.forEach((item: { dataHoraCotacao: string; cotacaoVenda: number }) => {
      const date = item.dataHoraCotacao.split(' ')[0]
      if (!byDate.has(date) || item.cotacaoVenda) {
        byDate.set(date, item.cotacaoVenda)
      }
    })
    
    return Array.from(byDate.entries()).map(([date, value]) => ({
      indicator: 'dolar',
      value,
      reference_date: date,
    })).filter((item: EconomicDataPoint) => !isNaN(item.value))
  } catch (error) {
    console.error('Error fetching DOLAR:', error)
    return []
  }
}

// Fetch unemployment rate from IBGE
async function fetchDesemprego(): Promise<EconomicDataPoint[]> {
  console.log('Fetching DESEMPREGO data...')
  try {
    // PNAD Contínua - Taxa de desocupação
    const url = `https://servicodados.ibge.gov.br/api/v3/agregados/6381/periodos/-24/variaveis/4099?localidades=N1[all]`
    
    const response = await fetch(url)
    if (!response.ok) {
      console.error('DESEMPREGO API error:', response.status)
      return []
    }
    
    const data = await response.json()
    console.log(`DESEMPREGO: received response`)
    
    const results: EconomicDataPoint[] = []
    
    if (data && data[0] && data[0].resultados && data[0].resultados[0]) {
      const series = data[0].resultados[0].series[0].serie
      
      for (const [period, value] of Object.entries(series)) {
        if (value && value !== '...') {
          // Period format: YYYYMM or YYYYQQ
          let year = period.substring(0, 4)
          let month = period.substring(4, 6)
          
          // Convert quarter to month if needed
          if (parseInt(month) <= 4) {
            month = (parseInt(month) * 3).toString().padStart(2, '0')
          }
          
          results.push({
            indicator: 'desemprego',
            value: parseFloat(value as string),
            reference_date: `${year}-${month}-01`,
          })
        }
      }
    }
    
    console.log(`DESEMPREGO: parsed ${results.length} records`)
    return results.filter((item: EconomicDataPoint) => !isNaN(item.value))
  } catch (error) {
    console.error('Error fetching DESEMPREGO:', error)
    return []
  }
}

// Fetch PIB from IBGE
async function fetchPIB(): Promise<EconomicDataPoint[]> {
  console.log('Fetching PIB data...')
  try {
    // PIB trimestral - variação percentual
    const url = `https://servicodados.ibge.gov.br/api/v3/agregados/5932/periodos/-12/variaveis/6564?localidades=N1[all]`
    
    const response = await fetch(url)
    if (!response.ok) {
      console.error('PIB API error:', response.status)
      return []
    }
    
    const data = await response.json()
    console.log(`PIB: received response`)
    
    const results: EconomicDataPoint[] = []
    
    if (data && data[0] && data[0].resultados && data[0].resultados[0]) {
      const series = data[0].resultados[0].series[0].serie
      
      for (const [period, value] of Object.entries(series)) {
        if (value && value !== '...') {
          // Period format: YYYYQQ (e.g., 202301 for Q1 2023)
          const year = period.substring(0, 4)
          const quarter = parseInt(period.substring(4, 6))
          const month = (quarter * 3).toString().padStart(2, '0')
          
          results.push({
            indicator: 'pib',
            value: parseFloat(value as string),
            reference_date: `${year}-${month}-01`,
          })
        }
      }
    }
    
    console.log(`PIB: parsed ${results.length} records`)
    return results.filter((item: EconomicDataPoint) => !isNaN(item.value))
  } catch (error) {
    console.error('Error fetching PIB:', error)
    return []
  }
}

// Fetch trade balance from BCB
async function fetchBalancaComercial(): Promise<EconomicDataPoint[]> {
  console.log('Fetching BALANCA COMERCIAL data...')
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - 2)
    
    // Saldo da balança comercial - código 22707
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.22707/dados?formato=json&dataInicial=${formatDateForBCB(startDate)}&dataFinal=${formatDateForBCB(endDate)}`
    
    const response = await fetch(url)
    if (!response.ok) {
      console.error('BALANCA API error:', response.status)
      return []
    }
    
    const data = await response.json()
    console.log(`BALANCA: received ${data.length} records`)
    
    return data.map((item: { data: string; valor: string }) => ({
      indicator: 'balanca_comercial',
      value: parseFloat(item.valor),
      reference_date: brDateToISO(item.data),
    })).filter((item: EconomicDataPoint) => !isNaN(item.value))
  } catch (error) {
    console.error('Error fetching BALANCA:', error)
    return []
  }
}

// Upsert data to Supabase
async function upsertData(supabase: ReturnType<typeof createClient>, data: EconomicDataPoint[], userId: string): Promise<number> {
  if (data.length === 0) return 0
  
  const records = data.map(item => ({
    user_id: userId,
    indicator: item.indicator,
    value: item.value,
    reference_date: item.reference_date,
  }))
  
  // Use upsert with conflict on user_id, indicator, reference_date
  const { error, count } = await supabase
    .from('economic_indicators')
    .upsert(records, { 
      onConflict: 'user_id,indicator,reference_date',
      ignoreDuplicates: false 
    })
    .select()
  
  if (error) {
    console.error('Upsert error:', error)
    return 0
  }
  
  return records.length
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Parse request to determine which indicators to fetch
    let indicators: string[] = ['all']
    try {
      const body = await req.json()
      if (body.indicators && Array.isArray(body.indicators)) {
        indicators = body.indicators
      }
      if (body.user_id) {
        // Allow specifying a user ID for the data
      }
    } catch {
      // No body or invalid JSON, fetch all
    }
    
    const fetchAll = indicators.includes('all')
    const results: Record<string, number> = {}
    
    // Fetch and upsert each indicator
    if (fetchAll || indicators.includes('selic')) {
      const data = await fetchSelic()
      results.selic = await upsertData(supabase, data, SYSTEM_USER_ID)
    }
    
    if (fetchAll || indicators.includes('ipca')) {
      const data = await fetchIPCA()
      results.ipca = await upsertData(supabase, data, SYSTEM_USER_ID)
    }
    
    if (fetchAll || indicators.includes('igpm')) {
      const data = await fetchIGPM()
      results.igpm = await upsertData(supabase, data, SYSTEM_USER_ID)
    }
    
    if (fetchAll || indicators.includes('dolar')) {
      const data = await fetchDolar()
      results.dolar = await upsertData(supabase, data, SYSTEM_USER_ID)
    }
    
    if (fetchAll || indicators.includes('desemprego')) {
      const data = await fetchDesemprego()
      results.desemprego = await upsertData(supabase, data, SYSTEM_USER_ID)
    }
    
    if (fetchAll || indicators.includes('pib')) {
      const data = await fetchPIB()
      results.pib = await upsertData(supabase, data, SYSTEM_USER_ID)
    }
    
    if (fetchAll || indicators.includes('balanca_comercial')) {
      const data = await fetchBalancaComercial()
      results.balanca_comercial = await upsertData(supabase, data, SYSTEM_USER_ID)
    }
    
    console.log('Ingestion complete:', results)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Data ingestion complete',
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Ingestion error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
