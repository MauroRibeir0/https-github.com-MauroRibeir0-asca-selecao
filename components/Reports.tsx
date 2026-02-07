
import React, { useMemo } from 'react';
import { FileText, Download, TrendingUp, Target, ShieldCheck, Wallet, Coins, Briefcase, Info } from 'lucide-react';
import { Member, Saving, Loan, SystemSettings } from '../types.ts';

interface ReportsProps {
  members: Member[];
  savings: Saving[];
  loans: Loan[];
  stats: any;
  settings: SystemSettings;
  currentUser: Member | null;
  isAdmin: boolean;
}

const Reports: React.FC<ReportsProps> = ({ members, savings, loans, stats, settings, currentUser, isAdmin }) => {
  
  const financialProjections = useMemo(() => {
    // Rendimentos Totais (Multas + Juros de Empréstimos)
    const totalEarnings = (stats.totalLateFees || 0) + (stats.totalLoanInterests || 0);
    
    // Compromissos (Juros Fixos Prometidos de 7.500 para quem é elegível)
    const eligibleMembers = members.filter(m => m.eligibilityProgress >= 1);
    const totalFixedCommitment = eligibleMembers.length * settings.fixedInterestReturn;
    
    // Excedente para Partilha Equitativa (Regra 8)
    const surplus = Math.max(totalEarnings - totalFixedCommitment, 0);
    const surplusPerMember = members.length > 0 ? surplus / members.length : 0;

    // Fundo Operacional (Jóias)
    const operationalFund = members.filter(m => m.joiaPaid).length * settings.joiaAmount;

    return { totalEarnings, totalFixedCommitment, surplus, surplusPerMember, operationalFund };
  }, [members, stats, settings]);

  const myBonus = useMemo(() => {
    if (!currentUser) return 0;
    const isEligible = currentUser.eligibilityProgress >= 1;
    return (isEligible ? settings.fixedInterestReturn : 0) + financialProjections.surplusPerMember;
  }, [currentUser, financialProjections, settings]);

  return (
    <div className="space-y-6 pb-6 animate-slide-up">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Relatório Consolidado</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Análise de Fecho de Ciclo</p>
        </div>
        <button className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm text-[#aa0000] active:scale-95 transition-transform">
          <Download size={20} />
        </button>
      </div>

      {/* KPI GLOBAL DE RENDIMENTOS */}
      <div className="bg-[#aa0000] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Rendimento Bruto do Ciclo</p>
        <h3 className="text-4xl font-black mb-6 tracking-tight">
          {financialProjections.totalEarnings.toLocaleString()} <span className="text-lg opacity-60">MT</span>
        </h3>
        
        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
          <div>
            <p className="text-[9px] font-black uppercase opacity-50 mb-1">Taxas de Crédito</p>
            <p className="text-sm font-black">{(stats.totalLoanInterests || 0).toLocaleString()} MT</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase opacity-50 mb-1">Multas de Atraso</p>
            <p className="text-sm font-black">{(stats.totalLateFees || 0).toLocaleString()} MT</p>
          </div>
        </div>
      </div>

      {/* PROJEÇÃO INDIVIDUAL (PARA MEMBROS OU ADMINS SOBRE SI MESMOS) */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-12 -mt-12 opacity-50"></div>
        <div className="flex items-center gap-3">
          <div className="bg-orange-50 p-2 rounded-xl">
            <TrendingUp className="text-orange-600" size={20} />
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Previsão de Recebimento (Nov/26)</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-6 py-4 border-y border-gray-50">
          <div>
            <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Poupança Acumulada</p>
            <p className="text-lg font-black text-gray-800">{currentUser?.totalSavings.toLocaleString()} MT</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Bónus + Excedente</p>
            <p className="text-lg font-black text-green-600">+{myBonus.toLocaleString()} MT</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center gap-1">
             <p className="text-[10px] font-black text-gray-800 uppercase">Valor Líquido no Fecho</p>
             <Info size={12} className="text-gray-300" />
          </div>
          <p className="text-xl font-black text-[#aa0000]">
            {((currentUser?.totalSavings || 0) + myBonus).toLocaleString()} MT
          </p>
        </div>
      </div>

      {/* DETALHES DA OPERAÇÃO (EXCLUSIVO ADMIN OU INFO GERAL) */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Parâmetros de Gestão</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 shadow-inner">
            <Briefcase className="text-gray-400 mb-2" size={18} />
            <p className="text-[8px] font-bold text-gray-400 uppercase">Taxas de Gestão</p>
            <p className="text-sm font-black text-gray-800">{(members.length * settings.managementFeePerMember).toLocaleString()} MT</p>
          </div>
          <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 shadow-inner">
            <Coins className="text-gray-400 mb-2" size={18} />
            <p className="text-[8px] font-bold text-gray-400 uppercase">Total Excedente</p>
            <p className="text-sm font-black text-blue-600">{financialProjections.surplus.toLocaleString()} MT</p>
          </div>
        </div>
      </div>

      {/* RANKING E ELEGIBILIDADE */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 bg-gray-50/50 border-b border-gray-50 flex justify-between items-center">
          <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <Target size={16} className="text-[#aa0000]" /> Meta de 50.000 MT
          </h4>
          <span className="text-[8px] font-black text-gray-400 uppercase">{members.filter(m => m.eligibilityProgress >= 1).length}/{members.length} Elegíveis</span>
        </div>
        <div className="divide-y divide-gray-50">
          {members.sort((a,b) => b.eligibilityProgress - a.eligibilityProgress).map(member => (
            <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#1a1a1a] flex items-center justify-center font-bold text-xs text-white overflow-hidden shrink-0 border-2 border-white shadow-sm">
                  {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : member.name.charAt(0)}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-gray-800 truncate">{member.name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${member.eligibilityProgress >= 1 ? 'bg-green-500' : 'bg-[#aa0000]'}`} 
                        style={{ width: `${Math.min(member.eligibilityProgress * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-[8px] font-black text-gray-400 tracking-tighter">{Math.round(member.eligibilityProgress * 100)}%</span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                {member.eligibilityProgress >= 1 ? (
                  <div className="bg-green-50 p-1.5 rounded-lg">
                    <ShieldCheck size={14} className="text-green-600" />
                  </div>
                ) : (
                  <p className="text-[8px] font-black text-gray-300 uppercase italic">Pendentes {Math.max(50000 - member.totalLoansTaken, 0).toLocaleString()} MT</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
