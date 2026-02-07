
import React, { useMemo } from 'react';
import { TrendingUp, Wallet, AlertCircle, Calendar, Users as UsersIcon, Clock, Landmark, Coins, UserCheck, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { COLORS } from '../constants';
import { Member, Saving, Meeting, Loan } from '../types';

interface DashboardProps {
  stats: {
    totalGroupSavings: number;
    activeLoans: number;
    totalLateFees: number;
  };
  meetings: Meeting[];
  members: Member[];
  savings: Saving[];
  loans: Loan[];
  currentUser: Member | null;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, meetings, members, savings, loans, currentUser }) => {
  const availableForLoan = Math.max(stats.totalGroupSavings - stats.activeLoans, 0);

  // Cálculo de limite pessoal para o card de destaque do membro
  const myLimit = useMemo(() => {
    if (!currentUser) return 0;
    return currentUser.totalSavings + (currentUser.joiaPaid ? 1000 : 0) + 1000;
  }, [currentUser]);

  const chartData = [
    { name: 'Jan', total: savings.filter(s => s.month.endsWith('01')).reduce((a, c) => a + c.amount, 0) },
    { name: 'Fev', total: 0 },
    { name: 'Mar', total: 0 },
    { name: 'Abr', total: 0 },
  ];

  const upcomingLoans = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    return loans.filter(loan => {
      if (loan.status !== 'active') return false;
      const dueDate = new Date(loan.dueDate);
      return dueDate >= now && dueDate <= nextWeek;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [loans]);

  return (
    <div className="space-y-6">
      {/* DESTAQUE: CAIXA DISPONÍVEL */}
      <div className="bg-[#1a1a1a] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#aa0000] opacity-20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="flex justify-between items-start mb-4">
          <div className="bg-[#aa0000] p-3 rounded-2xl">
            <Landmark className="text-white" size={24} />
          </div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Caixa Ribeiro Lda.</span>
        </div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Disponível para Crédito</p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-4xl font-black text-white tracking-tighter">{availableForLoan.toLocaleString()}</h2>
          <span className="text-xl font-bold text-[#aa0000]">MT</span>
        </div>
      </div>

      {/* CARD DE CAPACIDADE INDIVIDUAL (EXCLUSIVO MEMBRO) */}
      {!currentUser?.role || currentUser.role === 'member' && (
        <div className="bg-white p-6 rounded-[2rem] border-2 border-[#aa0000]/10 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="bg-[#aa0000]/5 p-4 rounded-2xl shrink-0">
            <UserCheck className="text-[#aa0000]" size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#aa0000] uppercase tracking-[0.1em] mb-1">Sua Capacidade de Crédito</p>
            <h4 className="text-2xl font-black text-gray-800 tracking-tight">{myLimit.toLocaleString()} <span className="text-sm font-bold text-gray-400">MT</span></h4>
            <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Baseado na sua poupança + margem</p>
          </div>
        </div>
      )}

      {/* KPIs Secundários */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          icon={<Wallet className="text-[#aa0000]" size={18} />} 
          label="Sua Poupança" 
          value={`${currentUser?.totalSavings.toLocaleString() || 0} MT`} 
          color="bg-white"
        />
        <StatCard 
          icon={<ShieldCheck className="text-green-600" size={18} />} 
          label="Elegibilidade" 
          value={`${Math.round((currentUser?.eligibilityProgress || 0) * 100)}%`} 
          color="bg-white"
        />
      </div>

      {/* Progress Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-black mb-4 flex items-center gap-2 text-gray-800 uppercase tracking-widest">
          <Calendar size={18} className="text-[#aa0000]" />
          Ciclo Anual 2026
        </h3>
        <div className="space-y-3">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#aa0000] transition-all duration-1000" style={{ width: '15%' }}></div>
          </div>
          <div className="flex justify-between items-center pt-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase">Início Dez/25</p>
            <p className="text-[10px] font-black text-[#aa0000]">85% PARA O FIM</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase">Fim Nov/26</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-widest mb-6">Volume de Depósitos</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }} />
              <YAxis hide />
              <Tooltip cursor={{ fill: '#aa000008' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={24}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.total > 0 ? COLORS.primary : '#f3f4f6'} />
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
    <p className="text-base font-black text-[#1a1a1a]">{value}</p>
  </div>
);

export default Dashboard;
