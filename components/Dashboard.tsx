
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
import { COLORS } from '../constants.ts';
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
    // Regra: Poupança + Jóia + Margem Operacional de 1000 MT
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
    const months = ['Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai'];
    return months.map((m, i) => {
      const monthStr = (i + 12) % 12 + 1;
      const formattedMonth = monthStr.toString().padStart(2, '0');
      const total = savings
        .filter(s => s.month.endsWith(formattedMonth))
        .reduce((a, c) => a + c.amount, 0);
      return { name: m, total };
    });
  }, [savings]);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* HEADER KPI: CAIXA DISPONÍVEL */}
      <div className="bg-[#1a1a1a] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#aa0000] opacity-10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
        <div className="flex justify-between items-start mb-4">
          <div className="bg-[#aa0000] p-3 rounded-2xl shadow-lg shadow-[#aa0000]/20">
            <Landmark className="text-white" size={24} />
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Status do Fundo</span>
            <span className="text-[10px] font-bold text-[#aa0000] uppercase">Ribeiro, Lda.</span>
          </div>
        </div>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Liquidez para Crédito</p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-4xl font-black text-white tracking-tighter">{availableForLoan.toLocaleString()}</h2>
          <span className="text-xl font-bold text-[#aa0000]">MT</span>
        </div>
        
        {isAdmin && (
          <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Empréstimos Ativos</p>
              <p className="text-sm font-bold text-white">{stats.activeLoans.toLocaleString()} MT</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Rendimento Bruto</p>
              <p className="text-sm font-bold text-green-500">+{(stats.totalLateFees + stats.totalLoanInterests).toLocaleString()} MT</p>
            </div>
          </div>
        )}
      </div>

      {/* CARD DE CAPACIDADE INDIVIDUAL (EXCLUSIVO MEMBRO) */}
      {!isAdmin && (
        <div className="bg-white p-6 rounded-[2rem] border-2 border-[#aa0000]/10 shadow-sm flex items-center gap-4 relative overflow-hidden group active:scale-[0.98] transition-all">
          <div className="bg-[#aa0000]/5 p-4 rounded-2xl shrink-0 group-hover:bg-[#aa0000] transition-colors">
            <UserCheck className="text-[#aa0000] group-hover:text-white" size={28} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-[#aa0000] uppercase tracking-[0.1em] mb-1">Seu Crédito Pré-Aprovado</p>
            <h4 className="text-2xl font-black text-gray-800 tracking-tight">{myLimit.toLocaleString()} <span className="text-sm font-bold text-gray-300">MT</span></h4>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '100%' }}></div>
              </div>
              <span className="text-[8px] font-black text-green-600 uppercase">Excelente</span>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-300" />
        </div>
      )}

      {/* KPIs RÁPIDOS */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          icon={<Wallet className="text-[#aa0000]" size={18} />} 
          label={isAdmin ? "Total em Poupança" : "Sua Poupança"} 
          value={`${(isAdmin ? stats.totalGroupSavings : (currentUser?.totalSavings || 0)).toLocaleString()} MT`} 
          color="bg-white"
        />
        <StatCard 
          icon={<ShieldCheck className="text-green-600" size={18} />} 
          label="Elegibilidade" 
          value={isAdmin ? `${members.filter(m => m.eligibilityProgress >= 1).length} Membros` : `${Math.round((currentUser?.eligibilityProgress || 0) * 100)}%`} 
          color="bg-white"
        />
      </div>

      {/* ATIVIDADE RECENTE */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Activity size={16} className="text-[#aa0000]" /> Feed do Grupo
          </h3>
          <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Últimas 5 ações</span>
        </div>
        <div className="space-y-4">
          {recentActivities.map((act: any, idx) => {
            const member = members.find(m => m.id === act.memberId);
            return (
              <div key={idx} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${act.type === 'saving' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                    {act.type === 'saving' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{member?.name || 'Membro'}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">{act.type === 'saving' ? 'Depósito Mensal' : 'Solicitação Crédito'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-gray-800">{act.amount.toLocaleString()} MT</p>
                  <p className="text-[8px] text-gray-400 font-bold">{new Date(act.dateObj).toLocaleDateString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GRÁFICO DE PERFORMANCE */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-widest mb-6">Fluxo de Capital (6 Meses)</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }} />
              <YAxis hide />
              <Tooltip cursor={{ fill: '#aa000008' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.total > 0 ? '#aa0000' : '#f3f4f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: any, label: string, value: string, color: string }> = ({ icon, label, value, color }) => (
  <div className={`p-5 rounded-[2rem] ${color} border border-gray-100 shadow-sm active:scale-95 transition-transform`}>
    <div className="mb-2 bg-gray-50 w-fit p-2 rounded-xl">{icon}</div>
    <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest mb-1">{label}</p>
    <p className="text-sm font-black text-[#1a1a1a] truncate">{value}</p>
  </div>
);

export default Dashboard;
