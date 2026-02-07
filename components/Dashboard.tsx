
import React, { useMemo } from 'react';
import { TrendingUp, Wallet, AlertCircle, Calendar, Users as UsersIcon, Clock, AlertTriangle } from 'lucide-react';
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
}

const Dashboard: React.FC<DashboardProps> = ({ stats, meetings, members, savings, loans }) => {
  const chartData = [
    { name: 'Jan', total: savings.filter(s => s.month.endsWith('01')).reduce((a, c) => a + c.amount, 0) },
    { name: 'Fev', total: savings.filter(s => s.month.endsWith('02')).reduce((a, c) => a + c.amount, 0) },
    { name: 'Mar', total: savings.filter(s => s.month.endsWith('03')).reduce((a, c) => a + c.amount, 0) },
    { name: 'Abr', total: 0 },
    { name: 'Mai', total: 0 },
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
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          icon={<Wallet className="text-[#aa0000]" />} 
          label="Fundo Total" 
          value={`${stats.totalGroupSavings.toLocaleString()} MT`} 
          color="bg-[#aa0000]/10"
        />
        <StatCard 
          icon={<TrendingUp className="text-green-600" />} 
          label="Empréstimos" 
          value={`${stats.activeLoans.toLocaleString()} MT`} 
          color="bg-green-100"
        />
        <StatCard 
          icon={<AlertCircle className="text-orange-500" />} 
          label="Multas" 
          value={`${stats.totalLateFees.toLocaleString()} MT`} 
          color="bg-orange-100"
        />
        <StatCard 
          icon={<UsersIcon className="text-blue-500" />} 
          label="Membros" 
          value={members.length.toString()} 
          color="bg-blue-100"
        />
      </div>

      {/* Progress Card */}
      <div className="bg-[#1a1a1a] text-white p-6 rounded-3xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#aa0000] opacity-20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-[#aa0000]" />
          Ciclo 2025-2026
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm opacity-80">
            <span>Progresso Anual</span>
            <span>25%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-[#aa0000] transition-all duration-1000" style={{ width: '25%' }}></div>
          </div>
          <div className="flex justify-between items-end pt-2">
            <div>
              <p className="text-xs opacity-50 uppercase">Dezembro 2025</p>
              <p className="text-sm font-semibold">Início</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-50 uppercase">Novembro 2026</p>
              <p className="text-sm font-semibold">Fim</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Expiries */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Clock size={20} className="text-[#aa0000]" />
            Vencimentos Próximos
          </h3>
          <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50 px-2 py-1 rounded-lg">Próximos 7 dias</span>
        </div>
        
        {upcomingLoans.length > 0 ? (
          <div className="space-y-3">
            {upcomingLoans.map(loan => {
              const member = members.find(m => m.id === loan.memberId);
              const dueDate = new Date(loan.dueDate);
              const diffDays = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={loan.id} className="flex items-center gap-4 p-3 bg-red-50/50 rounded-2xl border border-red-100/50 transition-all hover:bg-red-50">
                  <div className="w-10 h-10 rounded-xl bg-white border border-red-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {member?.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[#aa0000] font-bold text-sm">{member?.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-gray-800">{member?.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium">Reembolso: <span className="font-bold text-[#aa0000]">{loan.totalRepayment.toLocaleString()} MT</span></p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#aa0000]">{diffDays === 0 ? 'Hoje' : `Em ${diffDays} dias`}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">{dueDate.toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-xs text-gray-400 font-medium">Nenhum empréstimo vencendo nos próximos 7 dias.</p>
          </div>
        )}
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold mb-6">Poupança Mensal</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis hide />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={24}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.total > 0 ? COLORS.primary : '#e5e7eb'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Meetings Section */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-6">
        <h3 className="text-lg font-bold mb-4">Agenda de Reuniões</h3>
        <div className="space-y-4">
          {meetings.map((m) => (
            <div key={m.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-colors">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${m.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                <Calendar size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">{m.description}</p>
                <p className="text-xs text-gray-500">{new Date(m.date).toLocaleDateString('pt-BR')}</p>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${m.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                {m.status === 'completed' ? 'Realizada' : 'Pendente'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
  <div className={`p-4 rounded-3xl ${color} border border-white/50 backdrop-blur-sm transition-transform active:scale-95`}>
    <div className="mb-2">{icon}</div>
    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">{label}</p>
    <p className="text-lg font-bold text-[#1a1a1a]">{value}</p>
  </div>
);

export default Dashboard;
