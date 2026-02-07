
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  PiggyBank, 
  CreditCard, 
  FileText, 
  Settings as SettingsIcon,
  Bell,
  Loader2,
  Lock,
  Menu as MenuIcon,
  X,
  User,
  ShieldCheck,
  LogOut,
  Info,
  ChevronRight,
  Gavel
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'savings' | 'loans' | 'reports' | 'settings'>('dashboard');
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showRules, setShowRules] = useState(false);
  
  const [members, setMembers] = useState<Member[]>([]);
  const [savings, setSavings] = useState<Saving[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
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

      if (sets.data) {
        setSettings({
          joiaAmount: sets.data.joia_amount,
          minMensalidade: sets.data.min_mensalidade,
          maxMensalidade: sets.data.max_mensalidade,
          lateFeeRate: sets.data.late_fee_rate,
          minMovementForInterest: sets.data.min_movement_for_interest,
          fixedInterestReturn: sets.data.fixed_interest_return,
          managementFeePerMember: sets.data.management_fee_per_member,
          loanInterestRate: sets.data.loan_interest_rate
        });
      }

      const mappedLoans: Loan[] = (lns.data || []).map((l: any) => ({
        id: l.id,
        memberId: l.member_id,
        amount: l.amount,
        interestRate: l.interest_rate,
        requestedAt: l.requested_at,
        dueDate: l.due_date,
        paidAt: l.paid_at,
        status: l.status,
        totalRepayment: l.total_repayment
      }));
      setLoans(mappedLoans);

      const mappedSavings: Saving[] = (savs.data || []).map((s: any) => ({
        id: s.id,
        memberId: s.member_id,
        amount: s.amount,
        date: s.date,
        lateFee: s.late_fee || 0,
        month: s.month
      }));
      setSavings(mappedSavings);

      const allMembers = (mems.data || []).map((m: any) => {
        const memberLoans = mappedLoans.filter(l => l.memberId === m.id);
        const memberSavings = mappedSavings.filter(s => s.memberId === m.id);
        const totalSavings = memberSavings.reduce((acc, s) => acc + s.amount, 0);
        const totalLoansTaken = memberLoans.reduce((acc, l) => acc + l.amount, 0);
        const target = sets.data?.min_movement_for_interest || 50000;
        const eligibilityProgress = Math.min(totalLoansTaken / target, 1);

        return {
          id: m.id,
          userId: m.user_id,
          role: m.role || 'member',
          name: m.name,
          email: m.email,
          phone: m.phone,
          address: m.address,
          avatar: m.avatar,
          joinedAt: m.created_at,
          joiaPaid: m.joia_paid,
          totalSavings: totalSavings,
          totalLoansTaken: totalLoansTaken,
          eligibilityProgress: eligibilityProgress
        };
      });

      setMembers(allMembers);

      const userProfile = allMembers.find(m => m.email === session.user.email) || null;
      setCurrentUser(userProfile);

      setMeetings([
        { id: '1', date: '2025-12-15', status: 'completed', description: 'Reunião de Abertura do Ciclo' },
        { id: '2', date: '2026-04-10', status: 'pending', description: 'Reunião de Balanço Semestral' },
        { id: '3', date: '2026-11-20', status: 'pending', description: 'Reunião de Fecho e Partilha' },
      ]);

    } catch (error) {
      console.error("Erro crítico de sincronização:", error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  const stats = useMemo(() => {
    const totalGroupSavings = savings.reduce((acc, s) => acc + Number(s.amount), 0);
    const activeLoans = loans.filter(l => l.status === 'active').reduce((acc, l) => acc + Number(l.amount), 0);
    const totalLateFees = savings.reduce((acc, s) => acc + Number(s.lateFee), 0);
    const totalLoanInterests = loans.reduce((acc, l) => acc + (l.totalRepayment - l.amount), 0);
    return { totalGroupSavings, activeLoans, totalLateFees, totalLoanInterests };
  }, [savings, loans]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowMenu(false);
  };

  if (!session) return <Auth onLogin={() => fetchData()} />;

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
      <Loader2 className="animate-spin text-[#aa0000]" size={48} />
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sincronizando Dados...</p>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard stats={stats} meetings={meetings} members={members} savings={savings} loans={loans} currentUser={currentUser} />;
      case 'members': return <Members members={members} settings={settings} savings={savings} loans={loans} isAdmin={isAdmin} currentUser={currentUser} refreshData={fetchData} />;
      case 'savings': return <Savings savings={savings} refreshData={fetchData} members={members} settings={settings} currentUser={currentUser} isAdmin={isAdmin} />;
      case 'loans': return <Loans loans={loans} refreshData={fetchData} members={members} settings={settings} currentUser={currentUser} isAdmin={isAdmin} />;
      case 'reports': return <Reports members={members} savings={savings} loans={loans} stats={stats} settings={settings} currentUser={currentUser} isAdmin={isAdmin} />;
      case 'settings': 
        return isAdmin ? <Settings settings={settings} refreshData={fetchData} /> : <div className="p-10 text-center"><Lock className="mx-auto mb-4 text-gray-300" size={48} /><p className="font-bold text-gray-500">Acesso Restrito</p></div>;
      default: return <Dashboard stats={stats} meetings={meetings} members={members} savings={savings} loans={loans} currentUser={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto bg-[#f3f4f6] shadow-xl relative flex flex-col h-full overflow-hidden">
      <header className="bg-[#aa0000] text-white p-6 pt-10 sticky top-0 z-50 rounded-b-[2.5rem] shadow-lg safe-area-pt">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowMenu(true)}
              className="bg-white/20 p-2.5 rounded-xl active:scale-95 transition-transform backdrop-blur-md"
            >
              <MenuIcon size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">ASCA Seleção</h1>
              <p className="text-[9px] opacity-80 uppercase tracking-widest font-bold leading-none">
                Ribeiro, Lda.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="bg-white/20 p-2.5 rounded-xl active:scale-95 transition-transform backdrop-blur-md relative"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-yellow-400 rounded-full border border-[#aa0000]"></span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-6 animate-slide-up pb-10">
        {renderContent()}
      </main>

      {/* MENU SANDWICH OVERLAY */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] animate-in fade-in duration-300">
          <div className="absolute top-0 left-0 bottom-0 w-3/4 max-w-xs bg-white shadow-2xl animate-slide-right flex flex-col">
            <div className="p-8 pt-12 bg-[#aa0000] text-white rounded-br-[3rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
              <button onClick={() => setShowMenu(false)} className="absolute top-6 right-6 p-2 bg-white/20 rounded-full"><X size={20}/></button>
              
              <div className="w-16 h-16 bg-white rounded-2xl mb-4 flex items-center justify-center border-4 border-[#aa0000]/20 shadow-xl overflow-hidden">
                {currentUser?.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : <User size={32} className="text-[#aa0000]" />}
              </div>
              <h2 className="text-lg font-bold">{currentUser?.name || 'Membro'}</h2>
              <p className="text-xs opacity-70 font-medium">{currentUser?.email}</p>
              <div className="mt-2 inline-block px-3 py-1 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                {isAdmin ? 'Gestor Administrativo' : 'Investidor Ativo'}
              </div>
            </div>

            <nav className="flex-1 p-6 space-y-2 mt-4">
              <MenuLink 
                icon={<User size={20} />} 
                label="Meu Perfil" 
                onClick={() => { 
                  // Abre o detalhe do membro (isso poderia ser refinado para abrir direto o modal de perfil)
                  setActiveTab('members');
                  setShowMenu(false);
                }} 
              />
              <MenuLink 
                icon={<ShieldCheck size={20} />} 
                label="Regras do Grupo" 
                onClick={() => { 
                  setShowRules(true);
                  setShowMenu(false);
                }} 
              />
              <div className="h-px bg-gray-100 my-4"></div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 p-4 text-red-600 font-bold hover:bg-red-50 rounded-2xl transition-all"
              >
                <LogOut size={20} />
                <span className="text-sm">Sair do Sistema</span>
              </button>
            </nav>

            <div className="p-8 text-center">
              <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest mb-1">ASCA Seleção v1.2</p>
              <div className="w-10 h-1 bg-[#aa0000]/10 mx-auto rounded-full"></div>
            </div>
          </div>
          <div className="flex-1 h-full cursor-pointer" onClick={() => setShowMenu(false)}></div>
        </div>
      )}

      {/* MODAL REGRAS DO GRUPO */}
      {showRules && (
        <div className="fixed inset-0 bg-[#1a1a1a]/95 backdrop-blur-md z-[300] p-6 flex items-center justify-center overflow-y-auto">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 relative shadow-2xl animate-slide-up">
            <button onClick={() => setShowRules(false)} className="absolute top-6 right-8 p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100"><X size={20}/></button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#aa0000] p-3 rounded-2xl shadow-lg shadow-[#aa0000]/20">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-black text-[#1a1a1a] uppercase tracking-tight">Estatutos ASCA</h3>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <RuleItem title="Adesão" desc="Jóia obrigatória de 1.000,00 MT para custos operacionais." />
              <RuleItem title="Mensalidade" desc="Variável entre 2.000,00 MT e 5.000,00 MT mensais." />
              <RuleItem title="Pontualidade" desc="Depósitos até o dia 10. Após o dia 10, incide multa de 15%." />
              <RuleItem title="Elegibilidade" desc="Movimentação mínima de 50.000,00 MT/ano para recebimento de juros." />
              <RuleItem title="Empréstimos" desc="Taxa fixa de 15% sobre o valor solicitado com prazo de 30 dias." />
              <RuleItem title="Inadimplência" desc="Atrasos superiores a 30 dias resultam na duplicação imediata dos juros." />
              <RuleItem title="Retorno Fixo" desc="Bónus garantido de 7.500,00 MT no final do ciclo para elegíveis." />
            </div>

            <button 
              onClick={() => setShowRules(false)} 
              className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl font-bold mt-8 shadow-xl active:scale-95 transition-transform"
            >
              Ciente das Regras
            </button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 py-4 flex justify-between items-center z-50 max-w-md mx-auto rounded-t-[2.5rem] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] safe-area-pb">
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Início" />
        <NavButton active={activeTab === 'members'} onClick={() => setActiveTab('members')} icon={<Users size={20} />} label="Grupo" />
        <NavButton active={activeTab === 'savings'} onClick={() => setActiveTab('savings')} icon={<PiggyBank size={20} />} label="Poupado" />
        <NavButton active={activeTab === 'loans'} onClick={() => setActiveTab('loans')} icon={<CreditCard size={20} />} label="Crédito" />
        <NavButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<FileText size={20} />} label="Relatórios" />
        {isAdmin && <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={20} />} label="Ajustes" />}
      </nav>

      {/* MODAL DE NOTIFICAÇÕES */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-start justify-center pt-24 px-6" onClick={() => setShowNotifications(false)}>
          <div className="bg-white w-full rounded-3xl p-6 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#aa0000] mb-4">Alertas do Ciclo</h3>
            <div className="space-y-3">
              <NotificationItem title="Depósito Próximo" desc="Lembre-se: depósitos após o dia 10 geram multa de 15%." date="10 Jan" />
              <NotificationItem title="Elegibilidade" desc="Você já atingiu 40% da meta de movimentação anual." date="Hoje" />
              <NotificationItem title="Reembolso" desc="O empréstimo de João Ribeiro vence em 2 dias." date="08 Jan" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MenuLink = ({ icon, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-[#aa0000]/5 rounded-2xl transition-all group active:scale-[0.98]"
  >
    <div className="flex items-center gap-4">
      <div className="text-gray-400 group-hover:text-[#aa0000] transition-colors">{icon}</div>
      <span className="text-sm font-bold text-gray-700">{label}</span>
    </div>
    <ChevronRight size={16} className="text-gray-300 group-hover:text-[#aa0000]" />
  </button>
);

const RuleItem = ({ title, desc }: any) => (
  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
    <h4 className="text-[10px] font-black uppercase text-[#aa0000] tracking-widest mb-1">{title}</h4>
    <p className="text-xs text-gray-600 leading-tight font-medium">{desc}</p>
  </div>
);

const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 flex-1 transition-all duration-300 ${active ? 'text-[#aa0000]' : 'text-gray-400'}`}>
    <div className={`p-2 rounded-xl ${active ? 'bg-[#aa0000]/10' : ''}`}>{icon}</div>
    <span className={`text-[8px] font-bold uppercase tracking-tighter ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
  </button>
);

const NotificationItem = ({ title, desc, date }: any) => (
  <div className="flex gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-all border-b border-gray-50 last:border-0">
    <div className="w-2 h-2 bg-[#aa0000] rounded-full mt-1.5 shrink-0"></div>
    <div className="flex-1">
      <div className="flex justify-between items-center mb-0.5">
        <h4 className="text-[10px] font-black uppercase text-gray-800">{title}</h4>
        <span className="text-[8px] font-bold text-gray-400 uppercase">{date}</span>
      </div>
      <p className="text-[11px] text-gray-500 leading-tight">{desc}</p>
    </div>
  </div>
);

export default App;
