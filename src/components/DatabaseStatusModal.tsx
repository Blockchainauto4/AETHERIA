import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, RefreshCw, Server, Shield, ExternalLink, X, Copy, Check } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({ isOpen, onClose }) => {
  const { dbStatus, checkDbStatus, initDatabase } = useExchange();
  const [isInitializing, setIsInitializing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [initFeedback, setInitFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInit = async () => {
    setIsInitializing(true);
    setInitFeedback(null);
    try {
      const ok = await initDatabase();
      if (ok) {
        setInitFeedback('Tabelas verificadas e inicializadas com sucesso no banco!');
      } else {
        setInitFeedback('Modo em memória sincronizado ou erro na inicialização.');
      }
    } catch {
      setInitFeedback('Erro ao inicializar tabelas.');
    } finally {
      setIsInitializing(false);
    }
  };

  const sampleEnv = `DATABASE_URL="postgresql://user:password@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require"
GEMINI_API_KEY="seu_token_aqui"`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sampleEnv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPostgres = dbStatus?.provider === 'postgresql' && dbStatus?.connected;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isPostgres ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white flex items-center gap-2">
                Status do Banco de Dados & Vercel
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                  isPostgres 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {isPostgres ? 'PostgreSQL Ativo' : 'Vercel Ready / Fallback'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Configuração de persistência para a primeira versão em produção</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Status Box */}
          <div className={`p-4 rounded-xl border ${
            isPostgres 
              ? 'bg-emerald-950/20 border-emerald-500/30' 
              : 'bg-slate-800/40 border-slate-700'
          }`}>
            <div className="flex items-start gap-3">
              {isPostgres ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">
                  {isPostgres 
                    ? `Conectado ao PostgreSQL (${dbStatus?.databaseName || 'neondb'})` 
                    : 'Pronto para Vercel (Modo Em Memória com Fallback Ativo)'}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {dbStatus?.message || 'Configurado para responder tanto localmente quanto nos Serverless Functions do Vercel.'}
                </p>
              </div>
            </div>

            {/* Tables Info */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Tabelas</span>
                <span className="text-cyan-400 font-semibold">orders, portfolio</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Agentes e Pioneiro</span>
                <span className="text-cyan-400 font-semibold">pioneer_state, logs</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[10px]">Sinais de IA</span>
                <span className="text-emerald-400 font-semibold">ai_agent_signals</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={checkDbStatus}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Verificar Conexão
            </button>
            <button
              onClick={handleInit}
              disabled={isInitializing}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition disabled:opacity-50 shadow-lg shadow-cyan-600/20"
            >
              <Server className="w-3.5 h-3.5" />
              {isInitializing ? 'Inicializando...' : 'Recriar / Inicializar Tabelas'}
            </button>
          </div>

          {initFeedback && (
            <p className="text-xs text-cyan-300 bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-800/40">
              {initFeedback}
            </p>
          )}

          {/* Instructions for Vercel Deployment */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Como Publicar no Vercel com Banco de Dados
            </h4>

            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <li>
                <strong>Crie o projeto no Vercel</strong> apontando para este repositório Git. O arquivo <code className="text-cyan-300">vercel.json</code> já está pronto.
              </li>
              <li>
                No dashboard do Vercel, acesse a aba <strong>Storage</strong> e crie um <strong>Vercel Postgres (Neon)</strong> ou use uma URL do <strong>Supabase / Neon</strong>.
              </li>
              <li>
                Adicione a variável de ambiente <code className="text-cyan-300">DATABASE_URL</code> no painel de Environment Variables do Vercel.
              </li>
              <li>
                O backend do projeto inicializa automaticamente as tabelas e relacionamentos na primeira requisição!
              </li>
            </ol>

            {/* Code Snippet */}
            <div className="relative">
              <pre className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800">
                {sampleEnv}
              </pre>
              <button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition text-xs flex items-center gap-1"
                title="Copiar exemplo"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400">
          <span>Arquivo de regras SQL: <code className="text-slate-300">/db/schema.sql</code></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
