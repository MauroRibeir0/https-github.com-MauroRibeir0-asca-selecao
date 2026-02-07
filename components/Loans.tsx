import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Ban, 
  Search, 
  X, 
  TrendingUp, 
  Calendar,
  Wallet,
  ShieldAlert,
  ChevronRight,
  TriangleAlert,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Member, Loan, SystemSettings } from '../types';

interface LoansProps {
  loans: Loan[];
  refreshData: () => void;
  members: Member[];
  settings: SystemSettings;
}

const Loans: React.FC<LoansProps> = ({ loans, refreshData, members, settings }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    memberId: '',
    amount: 5000
  });

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

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId) return;

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
    if (type === 'total') {
      const { error } = await supabase.from('loans').update({ 
        status: 'paid', 
        paid_at: new Date().toISOString() 
      }).eq('id', id);
      
      if (error) alert(error.message);
      else refreshData();
    } else {
      // Logic for paying interest and extending (custom business logic)
      const loan = loans.find(l => l.id === id);
      if (!loan) return;
      
      const newDueDate = new Date(loan.dueDate);
      newDueDate.setDate(newDueDate.getDate() + 30);
      
      const { error } = await supabase.from('loans').update({ 
        due_date: newDueDate.toISOString().split('T')[0]
      }).eq('id', id);
      
      if (error) alert(error.message);
      else refreshData();
    }
  };

  const getMemberDetails = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    const now = new Date();
    const imminentThreshold = 7;

    const mLoans = loans
      .filter(l => l.memberId === memberId)
      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    
    const activeLoans = mLoans.filter(l => l.status === 'active');
    const overdueLoans = activeLoans.filter(l => new Date(l.dueDate) < now);
    const imminentLoans = activeLoans.filter(l => {
      const dueDate = new Date(l.dueDate);
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= imminentThreshold;
    });

    const totalDebt = activeLoans.reduce((acc, l) => acc + l.totalRepayment, 0);
    const totalPaid = mLoans.filter(l => l.status === 'paid').reduce((acc, l) => acc + l.totalRepayment, 0);
    
    return { member, mLoans, totalDebt, totalPaid, overdueLoans, imminentLoans };
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Gestão de Crédito</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Membros com Empréstimos</p>
        </div>
        <button 
          onClick={() => setIsRequesting(true)}
          className="bg-[#1a1a1a] text-white flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={20} />
          <span className="text-sm font-bold">Novo Crédito</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Pesquisar por membro..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#aa0000]/20 shadow-sm"
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
                className={`bg-white p-5 rounded-[2rem] border ${isOverdue ? 'border-red-200' : 'border-gray-100'} shadow-sm space-y-4 active:scale-[0.98] transition-all cursor-pointer group relative overflow-hidden`}
              >
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#aa0000] text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-md shrink-0 border-2 border-white overflow-hidden">
                      {member?.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        member?.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold group-hover:text-[#aa0000] transition-colors">{member?.name}</h4>
                      <div className="flex items-center gap-2">
                         <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${totalActiveCount > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                          {totalActiveCount} Ativo{totalActiveCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Último Valor</p>
                    <p className="text-lg font-bold text-[#aa0000] leading-none">{latestLoan.amount.toLocaleString()} MT</p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100/50 flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-gray-400" />
                    <span className="text-[10px] text-gray-500 font-semibold">
                      Solicitado em {new Date(latestLoan.requestedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[#aa0000]">
                    <span className="text-[10px] font-bold uppercase">Painel Detalhado</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <CreditCard className="mx-auto text-gray-200 mb-2" size={40} />
            <p className="text-sm text-gray-400">Nenhum empréstimo registrado ainda.</p>
          </div>
        )}
      </div>

      {selectedMemberId && (() => {
        const { member, mLoans, totalDebt, totalPaid, overdueLoans, imminentLoans } = getMemberDetails(selectedMemberId);

        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-end justify-center p-0 md:p-4">
            <div className="bg-[#f3f4f6] w-full max-w-md rounded-t-[40px] md:rounded-[40px] animate-slide-up max-h-[95vh] overflow-hidden flex flex-col shadow-2xl border-t border-white/20">
              
              <div className="bg-white px-8 pt-8 pb-6 border-b border-gray-100 shrink-0 relative">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
                <button onClick={() => setSelectedMemberId(null)} className="absolute top-8 right-8 p-2 bg-gray-50 rounded-full text-gray-400"><X size={20} /></button>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#aa0000] text-white rounded-[20px] flex items-center justify-center font-bold text-2xl shadow-lg shrink-0 border-4 border-white overflow-hidden">
                    {member?.avatar ? <img src={member.avatar} alt={member?.name} className="w-full h-full object-cover" /> : member?.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold truncate">{member?.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Painel de Empréstimos</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {(overdueLoans.length > 0 || imminentLoans.length > 0) && (
                  <section className="space-y-3">
                    <h4 className="text-[10px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-2">
                      <ShieldAlert size={14} /> Atenção: Prazos Críticos
                    </h4>
                    <div className="space-y-3">
                      {overdueLoans.map(l => (
                        <div key={l.id} className="bg-white p-5 rounded-3xl border-2 border-red-500 shadow-lg shadow-red-500/10 space-y-4 relative overflow-hidden">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[9px] font-bold text-red-600 uppercase bg-red-50 px-2 py-0.5 rounded-full inline-block mb-1">VENCIDO</p>
                              <p className="text-lg font-bold text-[#1a1a1a]">{l.amount.toLocaleString()} MT</p>
                              <p className="text-[9px] text-gray-500 font-bold uppercase">Venceu em: {new Date(l.dueDate).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] text-gray-400 font-bold uppercase">Total com Juros</p>
                              <p className="text-lg font-bold text-red-600">{l.totalRepayment.toLocaleString()} MT</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleLiquidate(l.id, 'interest')} className="flex-1 py-3 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-xl border border-gray-200 active:scale-95 transition-all">Estender (+30d)</button>
                            <button onClick={() => handleLiquidate(l.id, 'total')} className="flex-[1.5] py-3 bg-red-600 text-white text-[10px] font-bold rounded-xl shadow-lg active:scale-95 transition-all">Liquidar Total</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Dívida Ativa</p>
                    <p className="text-lg font-bold text-[#aa0000]">{totalDebt.toLocaleString()} MT</p>
                  </div>
                  <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Total Pago</p>
                    <p className="text-lg font-bold text-green-600">{totalPaid.toLocaleString()} MT</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><Wallet size={14} className="text-[#aa0000]" /> Histórico</h4>
                  {mLoans.map(l => {
                    const overdue = l.status === 'active' && new Date(l.dueDate) < new Date();
                    return (
                      <div key={l.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] font-bold text-gray-800 uppercase">{new Date(l.requestedAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${l.status === 'paid' ? 'bg-green-50 text-green-700 border-green-100' : overdue ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                            {l.status === 'paid' ? 'Liquidado' : overdue ? 'Vencido' : 'Ativo'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 py-2 border-y border-gray-50">
                          <div>
                            <p className="text-[8px] text-gray-400 font-bold uppercase">Principal</p>
                            <p className="text-base font-bold">{l.amount.toLocaleString()} MT</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] text-gray-400 font-bold uppercase">A Reembolsar</p>
                            <p className="text-base font-bold text-[#aa0000]">{l.totalRepayment.toLocaleString()} MT</p>
                          </div>
                        </div>
                        {l.status === 'active' && (
                          <div className="flex gap-2">
                             <button onClick={() => handleLiquidate(l.id, 'interest')} className="flex-1 py-3 bg-gray-50 text-[#1a1a1a] text-[10px] font-bold rounded-xl border border-gray-100 active:scale-95 transition-all">Renovar Juros</button>
                             <button onClick={() => handleLiquidate(l.id, 'total')} className="flex-[1.5] py-3 bg-[#aa0000] text-white text-[10px] font-bold rounded-xl shadow-lg active:scale-95 transition-all">Liquidar</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-6 border-t border-gray-100">
                <button onClick={() => setSelectedMemberId(null)} className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"><X size={18} /> Fechar Painel</button>
              </div>
            </div>
          </div>
        );
      })()}

      {isRequesting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 animate-slide-up shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-center">Novo Empréstimo</h3>
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Membro</label>
                <select className="w-full mt-1 px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#aa0000]/20 font-semibold" value={formData.memberId} onChange={e => setFormData({...formData, memberId: e.target.value})} required>
                  <option value="">Selecione um membro</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Valor (MT)</label>
                <input type="number" step="500" className="w-full mt-1 px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#aa0000]/20 font-bold text-lg" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} required />
              </div>
              <div className="bg-gray-50 p-5 rounded-[1.5rem] space-y-3 border border-gray-100 text-center">
                <p className="text-[10px] uppercase font-bold text-gray-400">Total com Juros (15%)</p>
                <p className="text-xl font-bold text-[#aa0000]">{(formData.amount * 1.15).toLocaleString()} MT</p>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsRequesting(false)} className="flex-1 py-4 text-sm font-bold text-gray-400">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-[2] py-4 bg-[#aa0000] text-white text-sm font-bold rounded-2xl shadow-xl active:scale-95 transition-all flex justify-center items-center">
                  {loading ? <Loader2 className="animate-spin" /> : 'Emitir Crédito'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loans;