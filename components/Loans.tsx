
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
  // Added missing Landmark import
  Landmark
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
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    memberId: currentUser?.role === 'admin' ? '' : currentUser?.id || '',
    amount: 5000
  });

  const memberLimit = useMemo(() => {
    if (!formData.memberId) return 0;
    const member = members.find(m => m.id === formData.memberId);
    if (!member) return 0;

    // Regra: Soma do deposito + Joia (1000) + Margem (1000)
    const baseLimit = member.totalSavings + (member.joiaPaid ? 1000 : 0) + 1000;
    return baseLimit;
  }, [formData.memberId, members]);

  const globalCashAvailable = useMemo(() => {
    const totalSavings = members.reduce((acc, m) => acc + m.totalSavings, 0);
    const activeLoansTotal = loans.filter(l => l.status === 'active').reduce((acc, l) => acc + l.amount, 0);
    return Math.max(totalSavings - activeLoansTotal, 0);
  }, [members, loans]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId) return;

    // Validação de limite individual
    if (formData.amount > memberLimit) {
      alert(`Limite excedido! O limite máximo para este membro é de ${memberLimit.toLocaleString()} MT.`);
      return;
    }

    // Validação de caixa global
    if (formData.amount > globalCashAvailable) {
      alert(`Saldo insuficiente em caixa! O grupo possui apenas ${globalCashAvailable.toLocaleString()} MT disponíveis.`);
      return;
    }

    setLoading(true);
    const requestedAt = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const totalRepayment = formData.amount * (1 + settings.loanInterestRate);

    const { error } = await supabase.from('loans').insert({
      member_id: formData.memberId,
      amount: formData.amount,
      interest_rate: settings.loanInterestRate,
      requested_at: requestedAt,
      due_date: dueDate.toISOString().split('T')[0],
      status: 'active',
      total_repayment: totalRepayment
    });

    if (error) {
      alert("Erro ao solicitar empréstimo: " + error.message);
    } else {
      refreshData();
      setIsRequesting(false);
    }
    setLoading(false);
  };

  const handleLiquidate = async (id: string, type: 'total' | 'interest') => {
    if (!isAdmin) return;
    setLoading(true);
    if (type === 'total') {
      const { error } = await supabase.from('loans').update({ 
        status: 'paid', 
        paid_at: new Date().toISOString() 
      }).eq('id', id);
      
      if (error) alert(error.message);
      else refreshData();
    } else {
      const loan = loans.find(l => l.id === id);
      if (!loan) return;
      
      const newDueDate = new Date(loan.dueDate);
      newDueDate.setDate(newDueDate.getDate() + 30);
      
      const { error } = await supabase.from('loans').update({ 
        due_date: newDueDate.toISOString().split('T')[0],
        total_repayment: loan.totalRepayment + (loan.amount * settings.loanInterestRate)
      }).eq('id', id);
      
      if (error) alert(error.message);
      else refreshData();
    }
    setLoading(false);
  };

  const memberLoanSummaries = useMemo(() => {
    const memberIdsWithLoans = Array.from(new Set(loans.map(l => l.memberId)));
    
    return memberIdsWithLoans.map(mId => {
      const member = members.find(m => m.id === mId);
      const memberLoans = loans
        .filter(l => l.memberId === mId)
        .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
      
      return {
        member,
        latestLoan: memberLoans[0],
        totalActiveCount: memberLoans.filter(l => l.status === 'active').length,
        totalLoansCount: memberLoans.length
      };
    })
    .filter(summary => summary.member?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (a.member?.name || '').localeCompare(b.member?.name || ''));
  }, [loans, members, searchTerm]);

  return (
    <div className="space-y-6 pb-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Solicitar Crédito</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Verificação de Elegibilidade</p>
        </div>
        <button 
          onClick={() => {
            setFormData({...formData, memberId: isAdmin ? '' : currentUser?.id || ''});
            setIsRequesting(true);
          }}
          className="bg-[#aa0000] text-white flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={20} />
          <span className="text-sm font-bold">Solicitar</span>
        </button>
      </div>

      <div className="bg-white p-5 rounded-[2rem] border border-gray-100 flex items-center gap-4 shadow-sm">
        <div className="bg-green-50 p-3 rounded-2xl">
          <Landmark className="text-green-600" size={24} />
        </div>
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Saldo Total Disponível</p>
          <p className="text-xl font-black text-gray-800">{globalCashAvailable.toLocaleString()} MT</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Pesquisar por membro..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none shadow-sm font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {memberLoanSummaries.length > 0 ? (
          memberLoanSummaries.map(summary => {
            const { member, latestLoan, totalActiveCount } = summary;
            const isOverdue = latestLoan.status === 'active' && new Date(latestLoan.dueDate) < new Date();
            
            return (
              <div 
                key={member?.id} 
                onClick={() => setSelectedMemberId(member?.id || null)}
                className={`bg-white p-5 rounded-[2rem] border ${isOverdue ? 'border-red-200' : 'border-gray-100'} shadow-sm space-y-4 active:scale-[0.98] transition-all cursor-pointer`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-[#1a1a1a] text-white rounded-2xl flex items-center justify-center font-bold overflow-hidden border-2 border-white`}>
                      {member?.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : member?.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold">{member?.name}</h4>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${totalActiveCount > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {totalActiveCount} Ativo(s)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Último Valor</p>
                    <p className="text-lg font-bold text-[#aa0000]">{latestLoan.amount.toLocaleString()} MT</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center bg-white rounded-[3rem] border border-dashed border-gray-100">
            <CreditCard className="mx-auto text-gray-200 mb-2" size={48} />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nenhum empréstimo ativo</p>
          </div>
        )}
      </div>

      {isRequesting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 animate-slide-up shadow-2xl relative">
            <button onClick={() => setIsRequesting(false)} className="absolute top-6 right-8 text-gray-300"><X size={20} /></button>
            <h3 className="text-xl font-bold mb-6 text-center text-gray-800 underline decoration-[#aa0000] decoration-4 underline-offset-8">Solicitar Crédito</h3>
            
            <form onSubmit={handleRequest} className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Membro</label>
                {isAdmin ? (
                  <select 
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-[#aa0000]/20" 
                    value={formData.memberId} 
                    onChange={e => setFormData({...formData, memberId: e.target.value})} 
                    required
                  >
                    <option value="">Escolher...</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                ) : (
                  <div className="w-full px-5 py-4 bg-gray-100 rounded-2xl font-bold text-gray-500">{currentUser?.name}</div>
                )}
              </div>

              {formData.memberId && (
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 animate-slide-up">
                  <div className="flex items-center gap-2 mb-1">
                    <UserCheck size={14} className="text-blue-600" />
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Análise de Elegibilidade</p>
                  </div>
                  <p className="text-sm text-blue-800 font-bold">Seu Limite: <span className="text-lg font-black">{memberLimit.toLocaleString()} MT</span></p>
                  <p className="text-[9px] text-blue-400 font-medium leading-tight mt-1">
                    Cálculo: Poupança + Jóia + Margem (1.000 MT).
                  </p>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Valor (MT)</label>
                <input 
                  type="number" 
                  step="500"
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-black text-2xl text-[#aa0000] focus:ring-2 focus:ring-[#aa0000]/20" 
                  value={formData.amount} 
                  onChange={e => setFormData({...formData, amount: Number(e.target.value)})} 
                  required 
                />
              </div>

              <div className="bg-red-50 p-5 rounded-3xl border border-red-100">
                <p className="text-[9px] uppercase font-black text-[#aa0000] tracking-widest text-center mb-1">Compromisso de Reembolso</p>
                <p className="text-2xl font-black text-red-600 text-center">{(formData.amount * (1 + settings.loanInterestRate)).toLocaleString()} MT</p>
                <p className="text-[8px] text-red-400 font-bold text-center mt-1">Inclui juros ASCA de 15% mensais</p>
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 bg-[#aa0000] text-white text-sm font-bold rounded-2xl shadow-xl active:scale-95 transition-all flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Aprovar Empréstimo'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loans;
