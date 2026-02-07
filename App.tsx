
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  PiggyBank, 
  HandCoins, 
  FileText, 
  ShieldCheck,
  Loader2,
  Lock,
  Menu as MenuIcon,
  X,
  User,
  LogOut,
  ChevronRight,
  ShieldEllipsis,
  Database,
  KeyRound,
  RefreshCw
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
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'savings' | 'loans' | 'reports' | 'settings'>('dashboard');
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [showMenu, setShowMenu] = useState(false);
  const [globalSelectedMember, setGlobalSelectedMember] = useState<Member | null>(null);
  
  const [members, setMembers] = useState<Member[]>([]);
  const [savings, setSavings] = useState<Saving[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchData();
  }, [session]);

  const fetchData = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const [mems, savs, lns, sets] = await Promise.all([
        supabase.from('members').select('*').order('name'),
        supabase.from('savings').select('*').order('date', { ascending: false }),
        supabase.from('loans').select('*').order('requested_at', { ascending: false }),
        supabase.from('settings').select('*').maybeSingle()
      ]);

      if (sets.data) {
        setSettings({
          joiaAmount: Number(sets.data.joia_amount) || INITIAL_SETTINGS.joiaAmount,
          minMensalidade: Number(sets.data.min_mensalidade) || INITIAL_SETTINGS.minMensalidade,
          maxMensalidade: Number(sets.data.max_mensalidade) || INITIAL_SETTINGS.maxMensalidade,
          lateFeeRate: Number(sets.data.late_fee_rate) || INITIAL_SETTINGS.lateFeeRate,
          minMovementForInterest: Number(sets.data.min_movement_for_interest) || INITIAL_SETTINGS.minMovementForInterest,
          fixedInterestReturn: Number(sets.data.fixed_interest_return) || INITIAL_SETTINGS.fixedInterestReturn,
          managementFeePerMember: Number(sets.data.management_fee_per_member) || INITIAL_SETTINGS.managementFeePerMember,
          loanInterestRate: Number(sets.data.loan_interest_rate) || INITIAL_SETTINGS.loanInterestRate
        });
      }

      const mappedLoans: Loan[] = (lns.data || []).map((l: any) => ({
        id: l.id,
        memberId: l.member_id,
        amount: Number(l.amount),
        interest_rate: Number(l.interest_rate),
        requested_at: l.requested_at,
        due_date: l.due_date,
        paidAt: l.paid_at,
        status: l.status,
        totalRepayment: Number(l.total_repayment)
      }));
      setLoans(mappedLoans);

      const mappedSavings: Saving[] = (savs.data || []).map((s: any) => ({
        id: s.id,
        memberId: s.member_id,
        amount: Number(s.amount),
        date: s.date,
        lateFee: Number(s.late_fee || 0),
        month: s.month
      }));
      setSavings(mappedSavings);

      const allMembers: Member[] = (mems.data || []).map((m: any) => {
        const totalLoansTaken = mappedLoans.filter(l => l.memberId === m.id).reduce((acc, l) => acc + l.amount, 0);
        return {
          id: m.id,
          userId: m.user_id,
          role: (m.role || 'member').toLowerCase().trim() as 'admin' | 'member',
          name: m.name,
          email: (m.email || '').toLowerCase().trim(),
          phone: m.phone,
          avatar: m.avatar,
          joinedAt: m.created_at,
          joiaPaid: !!m.joia_paid,
          mustChangePassword: !!m.must_change_password,
          totalSavings: mappedSavings.filter(s => s.memberId === m.id).reduce((acc, s) => acc + s.amount, 0),
          totalLoansTaken: totalLoansTaken,
          eligibilityProgress: Math.min(totalLoansTaken / settings.minMovementForInterest, 1)
        };
      });

      setMembers(allMembers);

      if (session?.user?.email) {
        const loggedEmail = session.user.email.toLowerCase().trim();
        const userProfile = allMembers.find(m => m.email === loggedEmail) || null;
        setCurrentUser(userProfile);
        if (userProfile?.mustChangePassword) setIsChangingPassword(true);
      }

      setMeetings([
        { id: '1', date: '2025-12-15', status: 'completed', description: 'Abertura do Ciclo' },
        { id: '2', date: '2026-04-10', status: 'pending', description: 'Revisão de Metas' },
      ]);

    } catch (error) {
      console.error("Erro Supabase:", error);
      setDbError("Erro de ligação aos dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return alert("Mínimo 6 caracteres.");
    setLoading(true);
    try {
      await supabase.auth.updateUser({ password: newPassword });
      if (currentUser) await supabase.from('members').update({ must_change_password: false }).eq('id', currentUser.id);
      setIsChangingPassword(false);
      fetchData();
    } catch (err: any) {
      alert("Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowMenu(false);
  };

  if (loading) return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[999]">
      <Loader2 className="animate-spin text-[#aa0000]" size={40} />
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4">Carregando ASCA...</p>
    </div>
  );

  if (!session) return <Auth onLogin={() => fetchData()} />;

  if (isChangingPassword) return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center p-8">
      <div className="bg-white w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl text-center">
        <KeyRound className="mx-auto text-orange-500 mb-4" size={40} />
        <h2 className="text-xl font-black uppercase tracking-tight">Nova Senha</h2>
        <p className="text-[10px] text-gray-400 font-bold uppercase mb-6">Define a tua senha de acesso.</p>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <input 
            type="password" 
            className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-none font-bold"
            placeholder="Nova Palavra-passe"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoFocus
          />
          <button type="submit" className="w-full bg-[#aa0000] text-white py-4 rounded-2xl font-black uppercase shadow-xl">Ativar Agora</button>
        </form>
      </div>
    </div>
  );

  const isAdmin = currentUser?.role === 'admin';
  const totalGroupSavings = savings.reduce((acc, s) => acc + Number(s.amount), 0);
  const activeLoans = loans.filter(l => l.status === 'active').reduce((acc, l) => acc + Number(l.amount), 0);
  const totalLateFees = savings.reduce((acc, s) => acc + Number(s.lateFee), 0);
  const totalLoanInterests = loans.reduce((acc, l) => acc + (l.totalRepayment - l.amount), 0);
  const stats = { totalGroupSavings, activeLoans, totalLateFees, totalLoanInterests };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto bg-[#f3f4f6] relative flex flex-col shadow-2xl">
      <header className="bg-[#aa0000] text-white p-6 pt-10 sticky top-0 z-50 rounded-b-[2.5rem] shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowMenu(true)} className="bg-white/20 p-2.5 rounded-xl"><MenuIcon size={24} /></button>
            <h1 className="text-xl font-bold">ASCA Seleção</h1>
          </div>
          <div className="bg-white/20 p-2.5 rounded-xl">
             {isAdmin ? <ShieldCheck size={20} className="text-yellow-400" /> : <User size={20} />}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-6 animate-slide-up">
        {dbError ? (
          <div className="p-8 bg-white rounded-3xl text-center border border-red-100 shadow-sm">
            <Database className="mx-auto text-red-500 mb-4" />
            <p className="text-xs font-bold uppercase text-red-500">{dbError}</p>
            <button onClick={() => fetchData()} className="mt-4 text-[10px] font-black uppercase text-[#aa0000] flex items-center justify-center gap-2 mx-auto"><RefreshCw size={12}/> Tentar Sincronizar</button>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <Dashboard stats={stats} meetings={meetings} members={members} savings={savings} loans={loans} currentUser={currentUser} />}
            {activeTab === 'members' && <Members members={members} settings={settings} savings={savings} loans={loans} isAdmin={isAdmin} currentUser={currentUser} refreshData={fetchData} externalSelected={globalSelectedMember} setExternalSelected={setGlobalSelectedMember} />}
            {activeTab === 'savings' && <Savings savings={savings} refreshData={fetchData} members={members} settings={settings} currentUser={currentUser} isAdmin={isAdmin} />}
            {activeTab === 'loans' && <Loans loans={loans} refreshData={fetchData} members={members} settings={settings} currentUser={currentUser} isAdmin={isAdmin} />}
            {activeTab === 'reports' && <Reports members={members} savings={savings} loans={loans} stats={stats} settings={settings} currentUser={currentUser} isAdmin={isAdmin} />}
            {activeTab === 'settings' && (isAdmin ? <Settings settings={settings} refreshData={fetchData} /> : <div className="p-10 text-center opacity-30"><Lock size={48} className="mx-auto" /></div>)}
          </>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 py-4 flex justify-between items-center z-50 max-w-md mx-auto rounded-t-[2.5rem] shadow-2xl">
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Home" />
        <NavButton active={activeTab === 'savings'} onClick={() => setActiveTab('savings')} icon={<PiggyBank size={20} />} label="Poupar" />
        <NavButton active={activeTab === 'loans'} onClick={() => setActiveTab('loans')} icon={<HandCoins size={20} />} label="Empr." />
        <NavButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<FileText size={20} />} label="Relat." />
        {isAdmin && <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<ShieldCheck size={20} />} label="Admin" />}
      </nav>

      {showMenu && (
        <div className="fixed inset-0 bg-black/60 z-[200]" onClick={() => setShowMenu(false)}>
          <div className="absolute top-0 left-0 bottom-0 w-3/4 bg-white shadow-2xl flex flex-col animate-slide-right" onClick={e => e.stopPropagation()}>
            <div className="p-8 pt-12 bg-[#aa0000] text-white rounded-br-[3rem]">
              <div className="w-16 h-16 bg-white rounded-2xl mb-4 flex items-center justify-center text-[#aa0000] font-black text-2xl">{currentUser?.name?.charAt(0) || '?'}</div>
              <h2 className="text-lg font-bold truncate">{currentUser?.name || 'Membro'}</h2>
              <span className="text-[9px] font-black uppercase opacity-60">{isAdmin ? 'ADMINISTRADOR' : 'INVESTIDOR'}</span>
            </div>
            <nav className="flex-1 p-6 space-y-2 mt-4">
              <button onClick={() => { setActiveTab('dashboard'); setShowMenu(false); }} className="w-full text-left p-4 hover:bg-gray-50 rounded-2xl font-bold flex items-center gap-3"><LayoutDashboard size={20}/> Home</button>
              <button onClick={() => { setActiveTab('members'); setShowMenu(false); }} className="w-full text-left p-4 hover:bg-gray-50 rounded-2xl font-bold flex items-center gap-3"><Users size={20}/> Membros</button>
              <button onClick={handleLogout} className="w-full p-4 text-red-600 font-bold flex items-center gap-3 mt-4"><LogOut size={20} /> Sair</button>
            </nav>
            <button onClick={() => setShowMenu(false)} className="absolute top-6 right-6 p-2 bg-white/20 rounded-full text-white"><X size={20}/></button>
          </div>
        </div>
      )}
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 flex-1 transition-all ${active ? 'text-[#aa0000]' : 'text-gray-400'}`}>
    <div className={`p-2 rounded-xl ${active ? 'bg-[#aa0000]/10' : ''}`}>{icon}</div>
    <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);

export default App;
