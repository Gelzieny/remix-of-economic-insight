# 📚 Documentação da API - Economic Insight

Esta pasta contém a documentação completa das APIs e Supabase Edge Functions do projeto.

## 📁 Arquivos

- **`swagger.yaml`** - Especificação OpenAPI 3.0 completa de todos os endpoints
- **`index.html`** - Interface Swagger UI interativa para visualização
- **`APIs.md`** - Documentação detalhada das APIs externas utilizadas

---

## 🚀 Como Visualizar a Documentação

### Opção 1: Swagger UI (Recomendado)

#### Usando VS Code Live Server

1. Instale a extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) no VS Code
2. Clique com botão direito em `index.html`
3. Selecione **"Open with Live Server"**
4. A documentação abrirá em `http://localhost:5500/.github/docs/`

#### Usando Python HTTP Server

```bash
cd .github/docs
python -m http.server 8080
```

Depois acesse: http://127.0.0.1:8080

#### Usando Node.js HTTP Server

```bash
cd .github/docs
npx http-server -p 8080
```

Depois acesse: http://127.0.0.1:8080

### Opção 2: Editor Online

1. Acesse [Swagger Editor](https://editor.swagger.io/)
2. Copie o conteúdo de `swagger.yaml`
3. Cole no editor

### Opção 3: Swagger UI Docker

```bash
docker run -p 8080:8080 \
  -e SWAGGER_JSON=/docs/swagger.yaml \
  -v $(pwd):/docs \
  swaggerapi/swagger-ui
```

Acesse: http://localhost:8080

---

## 📡 Endpoints Disponíveis

### 1. **Generate AI Insights**
```
POST /generate-ai-insights
```
Gera 3 insights automáticos usando GPT-4o-mini analisando indicadores econômicos.

**Autenticação:** ✅ Requerida (Bearer Token)

### 2. **Ingest Economic Data**
```
POST /ingest-economic-data
```
Coleta dados econômicos de BCB, Ipeadata e IBGE.

**Autenticação:** ❌ Não requerida (função de sistema)

### 3. **Send Dashboard Report**
```
POST /send-dashboard-report
```
Gera relatório consolidado com análises estatísticas.

**Autenticação:** ❌ Não requerida

---

## 🧪 Testando os Endpoints

### Usando curl

#### Generate AI Insights
```bash
curl -X POST https://trzrictfwfsmlpkbazqi.supabase.co/functions/v1/generate-ai-insights \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "indicators": [
      {
        "id": "selic",
        "name": "Taxa Selic",
        "shortName": "Selic",
        "value": 11.75,
        "unit": "% a.a.",
        "monthlyChange": 0.0,
        "annualChange": 2.25,
        "trend": "stable",
        "historicalData": [
          {"date": "2024-01-01", "value": 11.75},
          {"date": "2024-02-01", "value": 11.75}
        ]
      }
    ],
    "period": "últimos 6 meses"
  }'
```

#### Ingest Economic Data
```bash
curl -X POST https://trzrictfwfsmlpkbazqi.supabase.co/functions/v1/ingest-economic-data \
  -H "Content-Type: application/json" \
  -d '{
    "indicators": ["selic", "ipca", "dolar"]
  }'
```

#### Dashboard Report
```bash
curl -X POST https://trzrictfwfsmlpkbazqi.supabase.co/functions/v1/send-dashboard-report \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "test"
  }'
```

### Usando Postman

1. Importe o arquivo `swagger.yaml` no Postman
2. Configure a collection com a base URL: `https://trzrictfwfsmlpkbazqi.supabase.co/functions/v1`
3. Para endpoints autenticados, adicione o token JWT no header:
   - Key: `Authorization`
   - Value: `Bearer YOUR_SUPABASE_JWT_TOKEN`

### Usando Insomnia

1. File → Import → From File
2. Selecione `swagger.yaml`
3. Configure o environment com a base URL

---

## 🔑 Autenticação

### Obtendo JWT Token do Supabase

#### Via Frontend (JavaScript)
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Token está em:
const token = data.session.access_token
```

#### Via CLI (Supabase)
```bash
# Login na CLI
supabase login

# Obter token de acesso
supabase functions serve --show-jwt
```

---

## 🌐 URLs dos Ambientes

### Produção
```
Base URL: https://trzrictfwfsmlpkbazqi.supabase.co/functions/v1
Project ID: trzrictfwfsmlpkbazqi
```

### Desenvolvimento Local
```
Base URL: http://localhost:54321/functions/v1
```

Para rodar localmente:
```bash
# Instalar Supabase CLI
npm install -g supabase

# Iniciar Supabase local
supabase start

# Deploy local das functions
supabase functions serve
```

---

## 📊 Schemas Principais

### IndicatorData
```json
{
  "id": "selic",
  "name": "Taxa Selic",
  "shortName": "Selic",
  "value": 11.75,
  "unit": "% a.a.",
  "monthlyChange": 0.0,
  "annualChange": 2.25,
  "trend": "stable",
  "historicalData": [
    {
      "date": "2024-01-01",
      "value": 11.75
    }
  ]
}
```

### Insight Response
```json
{
  "insights": [
    {
      "id": "ai-insight-1707696000000-0",
      "message": "A taxa Selic permanece estável...",
      "type": "trend",
      "severity": "info",
      "indicatorId": "selic",
      "date": "2024-02-11"
    }
  ]
}
```

---

## 🔧 Troubleshooting

### Erro 401 - Unauthorized
- Verifique se o token JWT está sendo enviado corretamente
- Confirme que o token não expirou (tokens JWT do Supabase expiram em 1 hora)
- Use `Authorization: Bearer <token>` (não esqueça do "Bearer ")

### Erro 429 - Rate Limited
- A API da OpenAI tem rate limits
- O sistema faz retry automático com backoff exponencial
- Aguarde 1-2 minutos antes de tentar novamente

### Erro 500 - Internal Server Error
- Verifique os logs das functions:
  ```bash
  supabase functions logs generate-ai-insights --tail
  ```
- Confirme que as variáveis de ambiente estão configuradas:
  - `OPENAI_API_KEY`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### CORS Issues
- Todos os endpoints têm CORS habilitado (`Access-Control-Allow-Origin: *`)
- Se estiver tendo problemas, verifique se está usando o método correto (POST)
- OPTIONS requests são automaticamente tratadas

---

## 📝 Atualizando a Documentação

### 1. Editar o swagger.yaml
```bash
# Abra o arquivo
code .github/docs/swagger.yaml

# Valide as mudanças
npx @apidevtools/swagger-cli validate .github/docs/swagger.yaml
```

### 2. Testar localmente
```bash
cd .github/docs
python -m http.server 8080
```

### 3. Commit e push
```bash
git add .github/docs/swagger.yaml
git commit -m "docs: atualizar documentação da API"
git push
```

---

## 🔗 Links Úteis

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Última atualização:** 11 de fevereiro de 2026
