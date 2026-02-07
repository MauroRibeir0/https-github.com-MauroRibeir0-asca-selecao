
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  PiggyBank, 
  CreditCard, 
  FileText, 
  Settings as SettingsIcon,
  Bell,
  Plus
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import Savings from './components/Savings';
import Loans from './components/Loans';
import Reports from './components/Reports';
import Settings from './components/Settings';
import { Member, Saving, Loan, SystemSettings, Meeting } from './types';
import { INITIAL_SETTINGS } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'savings' | 'loans' | 'reports' | 'settings'>('dashboard');
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [isAdmin, setIsAdmin] = useState<boolean>(true); // Simulated admin status
  
  // Initial Mock Data - Sorted alphabetically below
  const [members, setMembers] = useState<Member[]>([
    { 
      id: '1', 
      name: 'António Ribeiro', 
      email: 'antonio@ribeiro.lda', 
      phone: '+258 84 123 4567',
      address: 'Av. Mao Tse Tung, Maputo',
      joiaPaid: true, 
      totalSavings: 15000, 
      totalLoansTaken: 45000, 
      eligibilityProgress: 0.9, 
      joinedAt: '2025-12-01' 
    },
    { 
      id: '2', 
      name: 'Isabel Santos', 
      email: 'isabel@email.com', 
      phone: '+258 82 987 6543',
      address: 'Rua da Beira, Matola',
      joiaPaid: true, 
      totalSavings: 8000, 
      totalLoansTaken: 12000, 
      eligibilityProgress: 0.24, 
      joinedAt: '2025-12-05' 
    },
    { 
      id: '3', 
      name: 'Carlos Manuel', 
      email: 'carlos@mail.mz', 
      phone: '+258 87 555 0000',
      address: 'Bairro Central, Maputo',
      joiaPaid: false, 
      totalSavings: 2000, 
      totalLoansTaken: 0, 
      eligibilityProgress: 0, 
      joinedAt: '2026-01-10' 
    },
  ]);

  const [savings, setSavings] = useState<Saving[]>([
    { id: 's1', memberId: '1', amount: 5000, date: '2026-01-05', lateFee: 0, month: '2026-01' },
    { id: 's2', memberId: '1', amount: 5000, date: '2026-02-12', lateFee: 750, month: '2026-02' }, // Late
    { id: 's3', memberId: '2', amount: 4000, date: '2026-01-08', lateFee: 0, month: '2026-01' },
  ]);

  const [loans, setLoans] = useState<Loan[]>([
    { id: 'l1', memberId: '1', amount: 20000, interestRate: 0.15, requestedAt: '2026-01-15', dueDate: '2026-02-14', status: 'paid', totalRepayment: 23000 },
    { id: 'l2', memberId: '1', amount: 25000, interestRate: 0.15, requestedAt: '2026-02-20', dueDate: '2026-03-22', status: 'active', totalRepayment: 28750 },
    { id: 'l3', memberId: '2', amount: 12000, interestRate: 0.15, requestedAt: '2026-03-01', dueDate: '2026-03-31', status: 'active', totalRepayment: 13800 },
  ]);

  const [meetings, setMeetings] = useState<Meeting[]>([
    { id: 'm1', date: '2025-12-01', status: 'completed', description: 'Assembleia Geral de Abertura' },
    { id: 'm2', date: '2026-06-15', status: 'pending', description: 'Reunião de Meio de Ciclo' },
    { id: 'm3', date: '2026-11-20', status: 'pending', description: 'Encerramento e Partilha' },
  ]);

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => a.name.localeCompare(b.name));
  }, [members]);

  const stats = useMemo(() => {
    const totalGroupSavings = savings.reduce((acc, s) => acc + s.amount, 0);
    const activeLoans = loans.filter(l => l.status === 'active').reduce((acc, l) => acc + l.amount, 0);
    const totalLateFees = savings.reduce((acc, s) => acc + s.lateFee, 0);
    return { totalGroupSavings, activeLoans, totalLateFees };
  }, [savings, loans]);

  const handleAddMember = (newMember: Member) => {
    setMembers(prev => [...prev, newMember]);
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard stats={stats} meetings={meetings} members={sortedMembers} savings={savings} loans={loans} />;
      case 'members': return (
        <Members 
          members={sortedMembers} 
          setMembers={setMembers} 
          settings={settings} 
          savings={savings} 
          loans={loans} 
          isAdmin={isAdmin}
          onAddMember={handleAddMember}
        />
      );
      case 'savings': return <Savings savings={savings} setSavings={setSavings} members={sortedMembers} settings={settings} />;
      case 'loans': return <Loans loans={loans} setLoans={setLoans} members={sortedMembers} settings={settings} />;
      case 'reports': return <Reports members={sortedMembers} savings={savings} loans={loans} stats={stats} settings={settings} />;
      case 'settings': return <Settings settings={settings} setSettings={setSettings} />;
      default: return <Dashboard stats={stats} meetings={meetings} members={sortedMembers} savings={savings} loans={loans} />;
    }
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto bg-white shadow-xl relative overflow-hidden">
      {/* Header */}
      <header className="bg-[#aa0000] text-white p-6 sticky top-0 z-50 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ASCA Seleção</h1>
            <p className="text-xs opacity-80 uppercase tracking-widest font-medium">Gestão de Crédito & Poupança</p>
          </div>
          <div className="bg-white/20 p-2 rounded-full relative cursor-pointer active:scale-95 transition-transform">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-[#aa0000]"></span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pt-6 animate-slide-up">
        {renderContent()}
      </main>

      {/* Persistent Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-3 flex justify-between items-center z-50 max-w-md mx-auto rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={22} />} label="Início" />
        <NavButton active={activeTab === 'members'} onClick={() => setActiveTab('members')} icon={<Users size={22} />} label="Membros" />
        <NavButton active={activeTab === 'savings'} onClick={() => setActiveTab('savings')} icon={<PiggyBank size={22} />} label="Poupança" />
        <NavButton active={activeTab === 'loans'} onClick={() => setActiveTab('loans')} icon={<CreditCard size={22} />} label="Empréstimos" />
        <NavButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<FileText size={22} />} label="Relatórios" />
        <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={22} />} label="Ajustes" />
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-300 px-2 ${active ? 'text-[#aa0000] scale-110' : 'text-gray-400'}`}
  >
    <div className={`${active ? 'bg-[#aa0000]/10 p-2 rounded-xl' : ''}`}>
      {icon}
    </div>
    <span className={`text-[10px] font-semibold ${active ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
  </button>
);

export default App;
