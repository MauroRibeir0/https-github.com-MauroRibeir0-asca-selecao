
import React, { useMemo } from 'react';
import { FileText, Download, TrendingUp, Target, ShieldCheck, Wallet, Coins, Briefcase } from 'lucide-react';
import { Member, Saving, Loan, SystemSettings } from '../types';

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
    const totalEarnings = stats.totalLateFees + stats.totalLoanInterests;
    
    // Compromissos (Juros Fixos Prometidos de 7.500 para quem é elegível)
    const eligibleMembers = members.filter(m => m.eligibilityProgress >= 1);
    const totalFixedCommitment = eligibleMembers.length * settings.fixedInterestReturn;
    
    // Excedente para Partilha Equitativa
    const surplus = Math.max(totalEarnings - totalFixedCommitment, 0);
    const surplusPerMember = members.length > 0 ? surplus / members.length : 0;

    // Fundo Operacional (Jóias)
    const operationalFund = members.filter(m => m.joiaPaid).length * settings.joiaAmount;

    return { totalEarnings, totalFixedCommitment, surplus, surplusPerMember, operationalFund };
  }, [members, stats, settings]);

  return (
    <div className="space-y-6 pb-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Relatório Consolidado</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ciclo Dez/25 - Nov/26</p>
        </div>
        <button className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm text-[#aa0000] active:scale-95 transition-transform">
          <Download size={20} />
        </button>
      </div>

      {/* KPI GLOBAL DE RENDIMENTOS */}
      <div className="bg-[#aa0000] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Rendimento Bruto do Grupo</p>
        <h3 className="text-4xl font-black mb-6 tracking-tight">
          {financialProjections.totalEarnings.toLocaleString()} <span className="text-lg opacity-60">MT</span>
        </h3>
        
        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
          <div>
            <p className="text-[9px] font-black uppercase opacity-50 mb-1">Juros de Crédito</p>
            <p className="text-sm font-black">{stats.totalLoanInterests.toLocaleString()} MT</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase opacity-50 mb-1">Multas por Atraso</p>
            <p className="text-sm font-black">{stats.totalLateFees.toLocaleString()} MT</p>
          </div>
        </div>
      </div>

      {/* PROJEÇÃO INDIVIDUAL PARA O MEMBRO LOGADO */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-50 p-2 rounded-xl">
            <TrendingUp className="text-orange-600" size={20} />
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sua Previsão de Retorno (Nov/26)</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-6 py-4 border-y border-gray-50">
          <div>
            <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Seu Poupado</p>
            <p className="text-lg font-black text-gray-800">{currentUser?.totalSavings.toLocaleString()} MT</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Bónus Estimado</p>
            <p className="text-lg font-black text-green-600">
              {( (currentUser?.eligibilityProgress || 0) >= 1 ? settings.fixedInterestReturn : 0 + financialProjections.surplusPerMember).toLocaleString()} MT
            </p>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2">
          <p className="text-[10px] font-black text-gray-800 uppercase">Total Estimado no Fecho</p>
          <p className="text-xl font-black text-[#aa0000]">
            {(
              (currentUser?.totalSavings || 0) + 
              ((currentUser?.eligibilityProgress || 0) >= 1 ? settings.fixedInterestReturn : 0) + 
              financialProjections.surplusPerMember
            ).toLocaleString()} MT
          </p>
        </div>
      </div>

      {/* ESTRUTURA OPERACIONAL */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Gestão Corporativa</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
            <Briefcase className="text-gray-400 mb-2" size={18} />
            <p className="text-[8px] font-bold text-gray-400 uppercase">Taxa de Gestora</p>
            <p className="text-sm font-black text-gray-800">{(members.length * settings.managementFeePerMember).toLocaleString()} MT</p>
          </div>
          <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
            <Coins className="text-gray-400 mb-2" size={18} />
            <p className="text-[8px] font-bold text-gray-400 uppercase">Fundo de Jóias</p>
            <p className="text-sm font-black text-gray-800">{financialProjections.operationalFund.toLocaleString()} MT</p>
          </div>
        </div>
      </div>

      {/* LISTA DE ELEGIBILIDADE */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 bg-gray-50/50 border-b border-gray-50">
          <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <Target size={16} className="text-[#aa0000]" /> Ranking de Elegibilidade
          </h4>
        </div>
        <div className="divide-y divide-gray-50">
          {members.sort((a,b) => b.eligibilityProgress - a.eligibilityProgress).map(member => (
            <div key={member.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-[10px] text-gray-400 overflow-hidden shrink-0">
                  {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : member.name.charAt(0)}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-gray-800 truncate">{member.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${member.eligibilityProgress >= 1 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${member.eligibilityProgress * 100}%` }}></div>
                    </div>
                    <span className="text-[8px] font-black text-gray-400">{Math.round(member.eligibilityProgress * 100)}%</span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                {member.eligibilityProgress >= 1 ? (
                  <ShieldCheck size={16} className="text-green-500 ml-auto" />
                ) : (
                  <p className="text-[8px] font-black text-orange-500 uppercase">Em Progresso</p>
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
