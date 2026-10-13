# Guia de Publicação no Vercel com Banco de Dados

Este projeto foi preparado e configurado com arquitetura híbrida de alto desempenho:
1. **Frontend**: React 19 + Three.js + Tailwind CSS + Vite (Single Page Application).
2. **Serverless Backend**: Rotas `/api/*` compatíveis com o runtime do Vercel Serverless Functions (`api/index.ts` e `src/server/app.ts`).
3. **Banco de Dados**: Suporte nativo a **PostgreSQL** (Vercel Postgres, Neon, Supabase, Railway) com fallback resiliente em memória caso a string de conexão ainda não tenha sido inserida.

---

## 🚀 Passo a Passo para Publicar no Vercel

### 1. Criar o Projeto no Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login.
2. Clique em **"Add New..."** > **"Project"**.
3. Importe o repositório Git deste projeto.
4. O Vercel detectará automaticamente as configurações através do arquivo `vercel.json`:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

---

### 2. Configurar o Banco de Dados (Opção A: Vercel Postgres / Neon - Recomendado)
1. No painel do seu projeto no Vercel, clique na aba **Storage**.
2. Clique em **Create Database** e selecione **Postgres** (fornecido pela Neon).
3. Aceite os termos e crie a instância (plano gratuito disponível).
4. O Vercel criará automaticamente e injetará as seguintes variáveis de ambiente:
   - `POSTGRES_URL`
   - `DATABASE_URL`
5. Na primeira inicialização, o backend executa automaticamente as migrações e tabelas:
   - `orders` (Ordens de compra/venda de criptomoedas)
   - `portfolio` (Saldos em USDT, BTC, ETH, SOL, AVAX, AETH)
   - `pioneer_state` (Estado de sobrevivência da família de colonos em Aetheria)
   - `pioneer_logs` (Histórico de diálogos com Kaelen e Maya)
   - `ai_agent_signals` (Sinais técnicos e decisões dos agentes autônomos de IA)

---

### 3. Configurar com Supabase / Railway / PostgreSQL Próprio (Opção B)
Se preferir usar o Supabase, Neon direto ou outro serviço:
1. Obtenha a string de conexão do PostgreSQL (Pooler URL com `sslmode=require`).
2. No painel do Vercel, vá em **Settings** > **Environment Variables**.
3. Adicione a chave:
   ```
   DATABASE_URL = postgresql://seu_usuario:sua_senha@seu_host.neon.tech/neondb?sslmode=require
   ```

---

### 4. Configurar a Chave da IA (Gemini)
No painel de **Environment Variables** do Vercel, adicione:
```
GEMINI_API_KEY = sua_chave_da_google_ai_studio
```

---

### 5. Deploy e Teste
1. Clique em **Deploy**.
2. Após o deploy finalizar, acesse a URL do seu projeto.
3. No topo da barra de navegação, clique no botão **"DB: Postgres"** ou **"DB: Vercel Ready"** para verificar a conectividade e inicializar as tabelas com 1 clique se desejar.

---

## 📁 Estrutura dos Arquivos Criados para o Vercel

- `vercel.json`: Configura roteamento de API (`/api/*`) e SPA (`dist/index.html`).
- `api/index.ts`: Ponto de entrada das Serverless Functions no Vercel.
- `src/server/db.ts`: Gerenciador do pool PostgreSQL, fallback em memória e queries tipadas.
- `src/server/app.ts`: Aplicação Express modular com rotas REST e oráculo de preços.
- `server.ts`: Servidor para desenvolvimento local e ambiente Node tradicional.
- `db/schema.sql`: Script SQL idempotente com criação de tabelas, índices e dados iniciais.
- `.env.example`: Exemplo com as variáveis de ambiente necessárias.
