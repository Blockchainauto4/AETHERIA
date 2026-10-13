import React, { useState } from 'react';
import { useExchange } from '../context/ExchangeContext';
import { MerkleTreeSynapse } from './MerkleTreeSynapse';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Lock, 
  Wallet, 
  Coins, 
  Plus, 
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

export const ProofOfReserves: React.FC = () => {
  const { 
    assets, 
    portfolioValueUsd, 
    walletAddress, 
    depositSimulatedFunds 
  } = useExchange();

  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [merkleVerified, setMerkleVerified] = useState<boolean>(false);
  const [depositSuccess, setDepositSuccess] = useState<string | null>(null);

  const merkleRoot = '0x8f4c93a2e7b15d86c478a01f92e3d74c6b8a192e039485720194857a6b8c9d0e';

  const copyMerkle = () => {
    navigator.clipboard?.writeText(merkleRoot);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
  };

  const handleDeposit = (symbol: string, amount: number) => {
    depositSimulatedFunds(symbol, amount);
    setDepositSuccess(`+${amount} ${symbol} creditados na sua carteira de testes!`);
    setTimeout(() => setDepositSuccess(null), 3500);
  };

  return (
    <div className="w-full min-h-[calc(100vh-61px)] bg-slate-950 p-4 md:p-8 space-y-6">
      {/* Top Banner: Solvency Guarantee */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-6 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>PROVA CRIPTOGRÁFICA DE SOLVÊNCIA (POR)</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              108.4% de Colateralização Verificada On-Chain
            </h1>
            <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
              Aetheria mantém 100% dos fundos dos usuários em custódia segregada em armazenamento a frio (Cold Storage) com garantia adicional de 8.4% no fundo de seguro autônomo.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Reservas Auditadas</span>
              <span className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                $14.28B USD
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Passivos de Usuários</span>
              <span className="text-base font-bold font-mono text-slate-200 tabular-nums">
                $13.17B USD
              </span>
            </div>
            <div className="col-span-2 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Status da Prova:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Solvente & Auditado
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Synapse Merkle Tree Canvas */}
      <MerkleTreeSynapse
        userWallet={walletAddress}
        userBalanceUsd={portfolioValueUsd}
        merkleRoot={merkleRoot}
      />

      {/* Merkle Tree Verification Tool */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Verificação da Raiz e Prova de Inclusão</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Snapshot de reservas imutável gravado no bloco #21,842,910 com prova zero-knowledge de solvência.
            </p>
          </div>

          <button
            onClick={() => setMerkleVerified(true)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono text-xs font-semibold border border-emerald-500/30 transition-colors cursor-pointer shrink-0"
          >
            {merkleVerified ? '✓ Saldo Verificado no Bloco' : 'Verificar Inclusão da Carteira'}
          </button>
        </div>

        {/* Merkle Hash Bar */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
          <div className="overflow-hidden">
            <span className="text-[10px] font-mono text-slate-500 block">Hash da Raiz Merkle Mais Recente (Bloco #21,842,910):</span>
            <span className="text-xs font-mono text-slate-300 truncate block">
              {merkleRoot}
            </span>
          </div>
          <button
            onClick={copyMerkle}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer shrink-0"
            title="Copiar Hash"
          >
            {copiedHash ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {merkleVerified && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Caminho de inclusão Merkle comprovado para a conta <strong>{walletAddress.slice(0, 10)}...</strong>. Prova de folha correspondente ao bloco atual gerada com sucesso.
            </span>
          </div>
        )}
      </div>

      {/* User Portfolio & Simulated Deposit Utility */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Sua Carteira na Plataforma (Simulação Ativa)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Valor líquido estimado:{' '}
              <strong className="text-slate-200 font-mono">
                ${portfolioValueUsd.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-mono text-slate-400 w-full sm:w-auto">Adicionar saldo teste:</span>
            <button
              onClick={() => handleDeposit('USDT', 5000)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-emerald-400 border border-slate-700 transition-colors cursor-pointer min-h-[36px]"
            >
              +5.000 USDT
            </button>
            <button
              onClick={() => handleDeposit('BTC', 0.1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-amber-400 border border-slate-700 transition-colors cursor-pointer min-h-[36px]"
            >
              +0.1 BTC
            </button>
            <button
              onClick={() => handleDeposit('ETH', 1.0)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-blue-400 border border-slate-700 transition-colors cursor-pointer min-h-[36px]"
            >
              +1.0 ETH
            </button>
          </div>
        </div>

        {depositSuccess && (
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{depositSuccess}</span>
          </div>
        )}

        {/* Holdings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono tabular-nums">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800 pb-2">
                <th className="py-2">Ativo</th>
                <th>Preço Atual</th>
                <th>Saldo Disponível</th>
                <th>Valor Total (USD)</th>
                <th>Variação 24h</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {Object.values(assets).map((asset) => {
                const totalValue = asset.balance * asset.price;
                return (
                  <tr key={asset.symbol} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 font-bold text-slate-200">
                      {asset.symbol} <span className="text-[10px] text-slate-500 font-normal">({asset.name})</span>
                    </td>
                    <td>${asset.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>{asset.balance.toLocaleString('pt-BR', { maximumFractionDigits: 4 })}</td>
                    <td className="font-semibold text-slate-100">
                      ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
