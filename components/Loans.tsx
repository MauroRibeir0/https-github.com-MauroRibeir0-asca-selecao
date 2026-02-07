
import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  X, 
  TrendingUp, 
  Calendar,
  Wallet,
  ShieldAlert,
  ChevronRight,
  TriangleAlert,
  Loader2,
  Lock,
  UserCheck,
  Landmark,
  ShieldX,
  History
} from 'lucide-react';
import { supabase } from '../lib/supabase.ts';
import { Member, Loan, SystemSettings } from '../types.ts';

interface LoansProps {
  loans: Loan[];
  refreshData: () => void;
  members: Member[];
  settings: SystemSettings;
  currentUser: Member | null;
  isAdmin: boolean;
}

const Loans: React.FC<LoansProps> = ({ loans, refreshData, members, settings, currentUser, isAdmin }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemberLoans, setSelectedMemberLoans] = useState<Member | null>(null);
  
  const [formData, setFormData] = useState({
    memberId: currentUser?.role === 'admin' ? '' : currentUser?.id || '',
    amount: 5000
  });

  const memberLimit = useMemo(() => {
    if (!formData.memberId) return 0;
    const member = members.find(m => m.id === formData.memberId);
    if (!member) return 0;
    return member.totalSavings + (member.joiaPaid ? 1000 : 0) + 1000;
  }, [formData.memberId, members]);

  const globalCashAvailable = useMemo(() => {
    const totalSavings = members.reduce((acc, m) => acc + m.totalSavings, 0);
    const activeLoansTotal = loans.filter(l => l.status === 'active').reduce((acc, l) => acc + l.amount, 0);
    return Math.max(totalSavings - activeLoansTotal, 0);
  }, [members, loans]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId) return;
    if (formData.amount > memberLimit || formData.amount > globalCashAvailable) {
      alert("Operação negada: Limite excedido ou falta de liquidez no grupo.");
      return;
    }

    setLoading(true);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const { error } = await supabase.from('loans').insert({
      member_id: formData.memberId,
      amount: formData.amount,
      interest_rate: settings.loanInterestRate,
      requested_at: new Date().toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      status: 'active',
      total_repayment: formData.amount * (1 + settings.loanInterestRate)
    });

    if (error) alert(error.message);
    else {
      refreshData();
      setIsRequesting(false);
    }
    setLoading(false);
  };

  const handleAction = async (id: string, action: 'pay' | 'renew') => {
    if (!isAdmin) return;
    setLoading(true);
    const loan = loans.find(l => l.id === id);
    if (!loan) return;

    if (action === 'pay') {
      await supabase.from('loans').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', id);
    } else {
      const newDueDate = new Date(loan.dueDate);
      newDueDate.setDate(newDueDate.getDate() + 30);
      await supabase.from('loans').update({ 
        due_date: newDueDate.toISOString().split('T')[0],
        total_repayment: loan.totalRepayment + (loan.amount * settings.loanInterestRate)
      }).eq('id', id);
    }
    refreshData();
    setLoading(false);
  };

  const filteredSummary = useMemo(() => {
    const grouped = members.map(m => {
      const mLoans = loans.filter(l => l.memberId === m.id);
      return { member: m, loans: mLoans, active: mLoans.filter(l => l.status === 'active') };
    });
    return grouped.filter(g => g.member.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [loans, members, searchTerm]);

  return (
    <div className="space-y-6 pb-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Gestão de Crédito</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ciclo Ribeiro Lda.</p>
        </div>
        <button onClick={() => setIsRequesting(true)} className="bg-[#aa0000] text-white p-3 rounded-2xl shadow-lg active:scale-95 transition-transform">
          <Plus size={24} />
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-4 shadow-sm relative overflow-hidden">
        <div className="bg-green-50 p-3 rounded-2xl"><Landmark className="text-green-600" size={24} /></div>
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Caixa para Empréstimos</p>
          <p className="text-2xl font-black text-gray-800 tracking-tight">{globalCashAvailable.toLocaleString()} <span className="text-sm font-bold text-gray-300">MT</span></p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar devedor..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none shadow-sm font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredSummary.map(({ member, active }) => (
          <div key={member.id} onClick={() => setSelectedMemberLoans(member)} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-bold text-gray-400 overflow-hidden border-2 border-white">
                {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : member.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-gray-800">{member.name}</h4>
                <div className="flex gap-2 items-center">
                   <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${active.length > 0 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                    {active.length > 0 ? `${active.length} Empréstimo(s)` : 'Sem Dívidas'}
                   </span>
                </div>
              </div>
            </div>
            <ChevronRight className="text-gray-300" size={20} />
          </div>
        ))}
      </div>

      {/* MODAL SOLICITAÇÃO */}
      {isRequesting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 animate-slide-up shadow-2xl relative">
            <button onClick={() => setIsRequesting(false)} className="absolute top-6 right-8 text-gray-300"><X size={20} /></button>
            <h3 className="text-xl font-bold mb-6 text-center text-gray-800">Novo Empréstimo</h3>
            <form onSubmit={handleRequest} className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Membro</label>
                {isAdmin ? (
                  <select className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold" value={formData.memberId} onChange={e => setFormData({...formData, memberId: e.target.value})} required>
                    <option value="">Escolher...</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                ) : <div className="w-full px-5 py-4 bg-gray-100 rounded-2xl font-bold text-gray-500">{currentUser?.name}</div>}
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Valor Solicitado (MT)</label>
                <input type="number" step="500" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-black text-2xl text-[#aa0000]" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} required />
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Seu Limite Estimado</p>
                <p className="text-lg font-black text-blue-800">{memberLimit.toLocaleString()} MT</p>
              </div>
              <button type="submit" disabled={loading} className="w-full py-4 bg-[#aa0000] text-white font-bold rounded-2xl shadow-xl active:scale-95 transition-all">
                {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Liberar Crédito'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALHES DE DÍVIDA POR MEMBRO */}
      {selectedMemberLoans && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[210] flex items-end justify-center p-0">
          <div className="bg-[#f3f4f6] w-full max-w-md rounded-t-[3rem] h-[85vh] animate-slide-up flex flex-col">
            <div className="p-8 bg-white border-b relative">
              <button onClick={() => setSelectedMemberLoans(null)} className="absolute top-8 right-8 text-gray-400 p-2"><X /></button>
              <h3 className="text-xl font-bold">{selectedMemberLoans.name}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Carteira de Empréstimos</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loans.filter(l => l.memberId === selectedMemberLoans.id).map(loan => {
                const isOverdue = loan.status === 'active' && new Date(loan.dueDate) < new Date();
                const totalWithPenalty = isOverdue ? loan.amount + ((loan.amount * loan.interestRate) * 2) : loan.totalRepayment;
                
                return (
                  <div key={loan.id} className={`bg-white p-6 rounded-[2rem] border ${isOverdue ? 'border-red-200 shadow-lg shadow-red-500/5' : 'border-gray-100'} space-y-4`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {isOverdue ? <ShieldX className="text-red-500" size={20} /> : <Clock className="text-orange-400" size={20} />}
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                          {loan.status === 'paid' ? 'Liquidado' : (isOverdue ? 'Inadimplência (Juros x2)' : 'Em Aberto')}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-400">{new Date(loan.requestedAt).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 border-y border-gray-50 py-4">
                      <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase">Capital</p>
                        <p className="font-bold text-gray-800">{loan.amount.toLocaleString()} MT</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black text-gray-400 uppercase">Vencimento</p>
                        <p className={`font-bold ${isOverdue ? 'text-red-500' : 'text-gray-800'}`}>{new Date(loan.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black text-gray-800 uppercase">Total a Reembolsar</p>
                      <p className={`text-xl font-black ${isOverdue ? 'text-red-600' : 'text-[#aa0000]'}`}>{totalWithPenalty.toLocaleString()} MT</p>
                    </div>

                    {isAdmin && loan.status === 'active' && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button onClick={() => handleAction(loan.id, 'pay')} className="bg-green-600 text-white py-3 rounded-xl text-xs font-bold active:scale-95 transition-transform flex items-center justify-center gap-2">
                          <CheckCircle2 size={14} /> Liquidar
                        </button>
                        <button onClick={() => handleAction(loan.id, 'renew')} className="bg-white border border-gray-200 text-gray-600 py-3 rounded-xl text-xs font-bold active:scale-95 transition-transform">
                          Adiar +30 dias
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {loans.filter(l => l.memberId === selectedMemberLoans.id).length === 0 && (
                <div className="py-20 text-center opacity-30">
                  <History size={48} className="mx-auto mb-2" />
                  <p className="font-bold uppercase tracking-widest text-xs">Sem histórico de crédito</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loans;
