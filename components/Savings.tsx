
import React, { useState } from 'react';
// Added Clock to imports
import { PiggyBank, Plus, CheckCircle2, AlertTriangle, ArrowUpRight, Loader2, X, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';
import { Member, Saving, SystemSettings } from '../types.ts';

interface SavingsProps {
  savings: Saving[];
  refreshData: () => void;
  members: Member[];
  settings: SystemSettings;
}

const Savings: React.FC<SavingsProps> = ({ savings, refreshData, members, settings }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    memberId: '',
    amount: 2000,
    date: new Date().toISOString().split('T')[0]
  });

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
        <h2 className="text-xl font-bold text-gray-800">Poupança Mensal</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#aa0000] text-white flex items-center gap-2 px-5 py-3 rounded-[1.25rem] shadow-lg shadow-[#aa0000]/20 active:scale-95 transition-transform"
        >
          <Plus size={20} />
          <span className="text-sm font-bold">Depositar</span>
        </button>
      </div>

      <div className="bg-[#1a1a1a] p-5 rounded-[2rem] flex gap-4 border border-gray-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#aa0000] opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="bg-[#aa0000]/20 p-3 rounded-2xl shrink-0">
          <AlertTriangle className="text-[#aa0000]" size={24} />
        </div>
        <div>
          <h4 className="text-white font-bold text-sm">Aviso de Prazos</h4>
          <p className="text-[10px] text-gray-400 font-bold uppercase leading-tight mt-1">
            Depósitos após o dia 10 sofrem multa automática de 15%.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {savings.length > 0 ? (
          savings.map(saving => {
            const member = members.find(m => m.id === saving.memberId);
            return (
              <div key={saving.id} className="bg-white p-5 rounded-[2rem] border border-gray-100 flex items-center justify-between shadow-sm hover:border-[#aa0000]/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center shrink-0 overflow-hidden ${saving.lateFee > 0 ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'}`}>
                    {member?.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className={`font-bold text-lg ${saving.lateFee > 0 ? 'text-orange-600' : 'text-green-600'}`}>{member?.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{member?.name || 'Membro'}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 font-bold uppercase tracking-tight">
                      <Clock size={10} />
                      {new Date(saving.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-800 leading-none">{saving.amount.toLocaleString()} MT</p>
                  {saving.lateFee > 0 && (
                    <p className="text-[9px] text-red-500 font-bold uppercase tracking-tighter mt-1 flex items-center gap-1 justify-end">
                      Multa +{saving.lateFee.toLocaleString()} MT
                    </p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
            <PiggyBank className="mx-auto text-gray-200 mb-4" size={56} />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nenhum depósito efetuado</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end justify-center p-0 md:p-4">
          <div className="bg-white w-full max-sm rounded-t-[40px] md:rounded-[40px] p-8 animate-slide-up shadow-2xl relative">
            <button onClick={() => setIsAdding(false)} className="absolute top-6 right-8 text-gray-400 p-2"><X /></button>
            <h3 className="text-xl font-bold mb-6 text-center text-gray-800">Registrar Depósito</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Membro Depositante</label>
                <select 
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#aa0000]/20 font-bold text-gray-700"
                  value={formData.memberId}
                  onChange={e => setFormData({...formData, memberId: e.target.value})}
                  required
                >
                  <option value="">Selecione na lista...</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Valor da Poupança (MT)</label>
                <input 
                  type="number" 
                  min={settings.minMensalidade}
                  max={settings.maxMensalidade}
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#aa0000]/20 font-black text-xl text-[#aa0000]"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                  required
                />
                <div className="flex justify-between mt-1 px-2">
                  <p className="text-[9px] text-gray-400 font-bold uppercase">Mín: {settings.minMensalidade}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">Máx: {settings.maxMensalidade}</p>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Data do Movimento</label>
                <input 
                  type="date" 
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#aa0000]/20 font-bold text-gray-700"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              
              <div className="pt-4 flex gap-4">
                <button type="submit" disabled={loading} className="w-full py-4 bg-[#aa0000] text-white text-sm font-bold rounded-2xl shadow-xl shadow-[#aa0000]/20 active:scale-95 transition-all flex justify-center items-center gap-2">
                  {loading ? <Loader2 className="animate-spin" /> : 'Confirmar e Sincronizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Savings;
