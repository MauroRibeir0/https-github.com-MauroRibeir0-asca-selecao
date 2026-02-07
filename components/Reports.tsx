
import React from 'react';
import { FileText, Download, TrendingDown, Target, ShieldCheck } from 'lucide-react';
import { Member, Saving, Loan, SystemSettings } from '../types';

interface ReportsProps {
  members: Member[];
  savings: Saving[];
  loans: Loan[];
  stats: any;
  settings: SystemSettings;
}

const Reports: React.FC<ReportsProps> = ({ members, savings, loans, stats, settings }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Relatórios Financeiros</h2>
        <button className="text-[#aa0000] p-2 rounded-xl bg-white border border-gray-100 shadow-sm">
          <Download size={20} />
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-[#aa0000] text-white p-6 rounded-[32px] shadow-xl relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full -mb-20 -mr-20 blur-3xl"></div>
        <div className="relative z-10">
          <p className="text-xs uppercase font-bold tracking-widest opacity-80 mb-2">Previsão de Partilha Anual</p>
          <h3 className="text-3xl font-bold mb-6">{(stats.totalLateFees + (loans.reduce((a, l) => a + (l.totalRepayment - l.amount), 0))).toLocaleString()} MT</h3>
          
          <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
            <div>
              <p className="text-[10px] uppercase opacity-60 font-bold">Juros Gerados</p>
              <p className="text-sm font-bold">85.400 MT</p>
            </div>
            <div>
              <p className="text-[10px] uppercase opacity-60 font-bold">Multas Acumuladas</p>
              <p className="text-sm font-bold">{stats.totalLateFees.toLocaleString()} MT</p>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold mb-2">Visão por Membro</h3>
      <div className="space-y-3">
        {members.map(member => (
          <div key={member.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-bold text-gray-400 overflow-hidden">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  member.name.charAt(0)
                )}
              </div>
              <div>
                <p className="text-sm font-bold">{member.name}</p>
                <div className="flex items-center gap-1">
                  {member.eligibilityProgress >= 1 ? (
                    <span className="flex items-center gap-0.5 text-[8px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full uppercase">
                      <ShieldCheck size={8} /> Elegível a Juros
                    </span>
                  ) : (
                    <span className="text-[8px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full uppercase">Ineligível</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase">Projeção Final</p>
              <p className="text-sm font-bold text-[#1a1a1a]">
                {(member.totalSavings + (member.eligibilityProgress >= 1 ? settings.fixedInterestReturn : 0)).toLocaleString()} MT
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-6 rounded-3xl space-y-4">
        <h4 className="font-bold flex items-center gap-2">
          <Target size={18} className="text-[#aa0000]" />
          Metas Operacionais
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 uppercase font-bold tracking-tight">Taxas de Gestão (Provisionadas)</span>
            <span className="font-bold">{(members.length * settings.managementFeePerMember).toLocaleString()} MT</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 uppercase font-bold tracking-tight">Fundo de Reserva (Jóias)</span>
            <span className="font-bold">{(members.filter(m => m.joiaPaid).length * settings.joiaAmount).toLocaleString()} MT</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
