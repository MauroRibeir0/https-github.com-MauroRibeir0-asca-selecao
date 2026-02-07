import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  PiggyBank, 
  CreditCard, 
  FileText, 
  Settings as SettingsIcon,
  Bell,
  Loader2
} from 'lucide-react';
import { supabase } from './lib/supabase.ts';
import Dashboard from './components/Dashboard.tsx';
import Members from './components/Members.tsx';
import Savings from './components/Savings.tsx';
import Loans from './components/Loans.tsx';
import Reports from './components/Reports.tsx';
import Settings from './components/Settings.tsx';
import Auth from './components/Auth.tsx';
import { Member, Saving, Loan, SystemSettings, Meeting } from './types.ts';
import { INITIAL_SETTINGS } from './constants.ts';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'savings' | 'loans' | 'reports' | 'settings'>('dashboard');
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  
  const [members, setMembers] = useState<Member[]>([]);
  const [savings, setSavings] = useState<Saving[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    // Auth Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mems, savs, lns, sets] = await Promise.all([
        supabase.from('members').select('*').order('name'),
        supabase.from('savings').select('*').order('date', { ascending: false }),
        supabase.from('loans').select('*').order('requested_at', { ascending: false }),
        supabase.from('settings').select('*').single()
      ]);

      if (mems.data) setMembers(mems.data as any);
      if (savs.data) setSavings(savs.data as any);
      if (lns.data) setLoans(lns.data as any);
      if (sets.data) setSettings(sets.data as any);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalGroupSavings = savings.reduce((acc, s) => acc + Number(s.amount), 0);
    const activeLoans = loans.filter(l => l.status === 'active').reduce((acc, l) => acc + Number(l.amount), 0);
    const totalLateFees = savings.reduce((acc, s) => acc + Number(s.lateFee), 0);
    return { totalGroupSavings, activeLoans, totalLateFees };
  }, [savings, loans]);

  if (!session) return <Auth onLogin={() => fetchData()} />;

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
      <Loader2 className="animate-spin text-[#aa0000]" size={48} />
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sincronizando com ASCA Seleção...</p>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard stats={stats} meetings={meetings} members={members} savings={savings} loans={loans} />;
      case 'members': return <Members members={members} settings={settings} savings={savings} loans={loans} isAdmin={true} refreshData={fetchData} />;
      case 'savings': return <Savings savings={savings} refreshData={fetchData} members={members} settings={settings} />;
      case 'loans': return <Loans loans={loans} refreshData={fetchData} members={members} settings={settings} />;
      case 'reports': return <Reports members={members} savings={savings} loans={loans} stats={stats} settings={settings} />;
      case 'settings': return <Settings settings={settings} refreshData={fetchData} />;
      default: return <Dashboard stats={stats} meetings={meetings} members={members} savings={savings} loans={loans} />;
    }
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto bg-white shadow-xl relative overflow-hidden">
      <header className="bg-[#aa0000] text-white p-6 sticky top-0 z-50 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ASCA Seleção</h1>
            <p className="text-xs opacity-80 uppercase tracking-widest font-medium">Gestão em Tempo Real</p>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="bg-white/20 p-2 rounded-full active:scale-95 transition-transform">
            <Bell size={20} />
          </button>
        </div>
      </header>

      <main className="px-4 pt-6 animate-slide-up">
        {renderContent()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-3 flex justify-between items-center z-50 max-w-md mx-auto rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={22} />} label="Início" />
        <NavButton active={activeTab === 'members'} onClick={() => setActiveTab('members')} icon={<Users size={22} />} label="Membros" />
        <NavButton active={activeTab === 'savings'} onClick={() => setActiveTab('savings')} icon={<PiggyBank size={22} />} label="Poupança" />
        <NavButton active={activeTab === 'loans'} onClick={() => setActiveTab('loans')} icon={<CreditCard size={22} />} label="Crédito" />
        <NavButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<FileText size={22} />} label="Relatórios" />
        <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={22} />} label="Ajustes" />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all duration-300 px-2 ${active ? 'text-[#aa0000] scale-110' : 'text-gray-400'}`}>
    <div className={`${active ? 'bg-[#aa0000]/10 p-2 rounded-xl' : ''}`}>{icon}</div>
    <span className={`text-[10px] font-semibold ${active ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
  </button>
);

export default App;