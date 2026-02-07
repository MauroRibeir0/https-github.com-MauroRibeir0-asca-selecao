
import React, { useState } from 'react';
import { PiggyBank, Plus, CheckCircle2, AlertTriangle, ArrowUpRight, Loader2, X, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';
import { Member, Saving, SystemSettings } from '../types.ts';

interface SavingsProps {
  savings: Saving[];
  refreshData: () => void;
  members: Member[];
  settings: SystemSettings;
  currentUser: Member | null;
  isAdmin: boolean;
}

const Savings: React.FC<SavingsProps> = ({ savings, refreshData, members, settings, currentUser, isAdmin }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    memberId: currentUser?.id || '',
    amount: 2000,
    date: new Date().toISOString().split('T')[0]
  });

  const canDepositForOthers = isAdmin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId) return;

    setLoading(true);
    const day = parseInt(formData.date.split('-')[2]);
    const isLate = day > 10;
    const lateFee = isLate ? formData.amount * settings.lateFeeRate : 0;

    const { error } = await supabase.from('savings').insert({
      member_id: formData.memberId,
      amount: formData.amount,
      date: formData.date,
      late_fee: lateFee,
      month: formData.date.substring(0, 7)
    });

    if (error) {
      alert("Erro ao registrar depósito: " + error.message);
    } else {
      refreshData();
      setIsAdding(false);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Poupança Mensal</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase">Entradas de Dinheiro</p>
        </div>
        <button 
          onClick={() => {
            setFormData({...formData, memberId: currentUser?.id || ''});
            setIsAdding(true);
          }}
          className="bg-[#aa0000] text-white flex items-center gap-2 px-5 py-3 rounded-[1.25rem] shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={20} />
          <span className="text-sm font-bold">Poupar</span>
        </button>
      </div>

      <div className="bg-[#1a1a1a] p-5 rounded-[2rem] flex gap-4 border border-gray-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#aa0000] opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="bg-[#aa0000]/20 p-3 rounded-2xl shrink-0">
          <AlertTriangle className="text-[#aa0000]" size={24} />
        </div>
        <div>
          <h4 className="text-white font-bold text-sm">Regras do Grupo ASCA</h4>
          <p className="text-[10px] text-gray-400 font-bold uppercase leading-tight mt-1">
            Deposite até o dia 10 de cada mês para evitar a multa de 15%.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {savings.length > 0 ? (
          savings.map(saving => {
            const member = members.find(m => m.id === saving.memberId);
            const isMySaving = saving.memberId === currentUser?.id;
            
            return (
              <div key={saving.id} className={`bg-white p-5 rounded-[2rem] border ${isMySaving ? 'border-[#aa0000]/20 shadow-md' : 'border-gray-100'} flex items-center justify-between shadow-sm`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center shrink-0 ${saving.lateFee > 0 ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-green-50 border-green-100 text-green-600'} font-black text-lg`}>
                    {member?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{member?.name || 'Membro'}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 font-bold uppercase">
                      <Clock size={10} />
                      {new Date(saving.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-800">{saving.amount.toLocaleString()} MT</p>
                  {saving.lateFee > 0 && (
                    <p className="text-[9px] text-red-500 font-bold uppercase mt-1">
                      Multa: {saving.lateFee.toLocaleString()} MT
                    </p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
            <PiggyBank className="mx-auto text-gray-200 mb-4" size={56} />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ainda sem registros</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end justify-center p-0">
          <div className="bg-white w-full max-w-sm rounded-t-[40px] p-8 animate-slide-up shadow-2xl relative">
            <button onClick={() => setIsAdding(false)} className="absolute top-6 right-8 text-gray-400 p-2"><X /></button>
            <h3 className="text-xl font-bold mb-6 text-center text-gray-800">Registrar Poupança</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Quem está depositando?</label>
                {canDepositForOthers ? (
                  <select 
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 outline-none"
                    value={formData.memberId}
                    onChange={e => setFormData({...formData, memberId: e.target.value})}
                    required
                  >
                    <option value="">Escolha...</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                ) : (
                  <div className="w-full px-5 py-4 bg-gray-100 border-none rounded-2xl font-bold text-gray-500">
                    {currentUser?.name}
                  </div>
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Valor (MT)</label>
                <input 
                  type="number" 
                  min={settings.minMensalidade}
                  max={settings.maxMensalidade}
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-black text-xl text-[#aa0000] outline-none"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Data de Depósito</label>
                <input 
                  type="date" 
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 outline-none"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="w-full py-4 bg-[#aa0000] text-white font-bold rounded-2xl shadow-xl active:scale-95 transition-all">
                {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Confirmar Registro'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Savings;
