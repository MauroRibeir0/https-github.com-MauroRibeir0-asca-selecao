
import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  AlertCircle, 
  Calendar, 
  Users as UsersIcon, 
  Clock, 
  Landmark, 
  Coins, 
  UserCheck, 
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Member, Saving, Meeting, Loan } from '../types.ts';

interface DashboardProps {
  stats: {
    totalGroupSavings: number;
    activeLoans: number;
    totalLateFees: number;
    totalLoanInterests: number;
  };
  meetings: Meeting[];
  members: Member[];
  savings: Saving[];
  loans: Loan[];
  currentUser: Member | null;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, meetings, members, savings, loans, currentUser }) => {
  const isAdmin = currentUser?.role === 'admin';
  const availableForLoan = Math.max(stats.totalGroupSavings - stats.activeLoans, 0);

  const myLimit = useMemo(() => {
    if (!currentUser) return 0;
    // Regra: Poupança + Jóia + Margem Operacional
    return currentUser.totalSavings + (currentUser.joiaPaid ? 1000 : 0) + 1000;
  }, [currentUser]);

  const recentActivities = useMemo(() => {
    const combined = [
      ...savings.map(s => ({ ...s, type: 'saving', dateObj: new Date(s.date) })),
      ...loans.map(l => ({ ...l, type: 'loan', dateObj: new Date(l.requestedAt) }))
    ].sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
    return combined.slice(0, 5);
  }, [savings, loans]);

  const chartData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    return months.map((m, i) => {
      const monthStr = (i + 1).toString().padStart(2, '0');
      const total = savings
        .filter(s => s.month.endsWith(monthStr))
        .reduce((a, c) => a + c.amount, 0);
      return { name: m, total };
    });
  }, [savings]);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* HEADER: DINHEIRO PARA EMPRESTAR */}
      <div className="bg-[#1a1a1a] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#aa0000] opacity-10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
        <div className="flex justify-between items-start mb-4">
          <div className="bg-[#aa0000] p-3 rounded-2xl shadow-lg shadow-[#aa0000]/20">
            <Landmark className="text-white" size={24} />
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">ASCA Seleção</span>
            <span className="text-[10px] font-bold text-[#aa0000] uppercase">Resumo Geral</span>
          </div>
        </div>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Elegibilidade de Empréstimo</p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-4xl font-black text-white tracking-tighter">{availableForLoan.toLocaleString()}</h2>
          <span className="text-xl font-bold text-[#aa0000]">MT</span>
        </div>
        
        {isAdmin && (
          <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Total Emprestado</p>
              <p className="text-sm font-bold text-white">{stats.activeLoans.toLocaleString()} MT</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Ganhos do Grupo</p>
              <p className="text-sm font-bold text-green-500">+{(stats.totalLateFees + stats.totalLoanInterests).toLocaleString()} MT</p>
            </div>
          </div>
        )}
      </div>

      {/* LIMITE DO POUPADOR */}
      {!isAdmin && (
        <div className="bg-white p-6 rounded-[2rem] border-2 border-[#aa0000]/10 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-all">
          <div className="bg-[#aa0000]/5 p-4 rounded-2xl">
            <UserCheck className="text-[#aa0000]" size={28} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-[#aa0000] uppercase mb-1">Meu Limite de Empréstimo</p>
            <h4 className="text-2xl font-black text-gray-800 tracking-tight">{myLimit.toLocaleString()} <span className="text-sm font-bold text-gray-300">MT</span></h4>
          </div>
          <ChevronRight size={20} className="text-gray-300" />
        </div>
      )}

      {/* RESUMO RÁPIDO */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          icon={<Wallet className="text-[#aa0000]" size={18} />} 
          label={isAdmin ? "Total em Caixa" : "Minha Poupança"} 
          value={`${(isAdmin ? stats.totalGroupSavings : (currentUser?.totalSavings || 0)).toLocaleString()} MT`} 
        />
        <StatCard 
          icon={<ShieldCheck className="text-green-600" size={18} />} 
          label="Acesso a Juros?" 
          value={isAdmin ? `${members.filter(m => m.eligibilityProgress >= 1).length} Elegíveis` : `${Math.round((currentUser?.eligibilityProgress || 0) * 100)}%`} 
        />
      </div>

      {/* MOVIMENTOS */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-6">
          <Activity size={16} className="text-[#aa0000]" /> Ações Recentes
        </h3>
        <div className="space-y-4">
          {recentActivities.map((act: any, idx) => {
            const member = members.find(m => m.id === act.memberId);
            return (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${act.type === 'saving' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                    {act.type === 'saving' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{member?.name || 'Membro'}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">{act.type === 'saving' ? 'Poupou' : 'Empréstimo'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-gray-800">{act.amount.toLocaleString()} MT</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }: any) => (
  <div className="p-5 rounded-[2rem] bg-white border border-gray-100 shadow-sm active:scale-95 transition-transform">
    <div className="mb-2 bg-gray-50 w-fit p-2 rounded-xl">{icon}</div>
    <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest mb-1">{label}</p>
    <p className="text-sm font-black text-[#1a1a1a] truncate">{value}</p>
  </div>
);

export default Dashboard;
