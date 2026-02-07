
import React, { useState } from 'react';
import { PiggyBank, Plus, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Member, Saving, SystemSettings } from '../types';

interface SavingsProps {
  savings: Saving[];
  setSavings: React.Dispatch<React.SetStateAction<Saving[]>>;
  members: Member[];
  settings: SystemSettings;
}

const Savings: React.FC<SavingsProps> = ({ savings, setSavings, members, settings }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    memberId: '',
    amount: 2000,
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId) return;

    const day = parseInt(formData.date.split('-')[2]);
    const isLate = day > 10;
    const lateFee = isLate ? formData.amount * settings.lateFeeRate : 0;

    const newSaving: Saving = {
      id: Math.random().toString(36).substr(2, 9),
      memberId: formData.memberId,
      amount: formData.amount,
      date: formData.date,
      lateFee,
      month: formData.date.substring(0, 7)
    };

    setSavings([newSaving, ...savings]);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Depósitos de Poupança</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#aa0000] text-white flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={20} />
          <span className="text-sm font-bold">Depositar</span>
        </button>
      </div>

      <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex gap-3">
        <AlertTriangle className="text-orange-500 shrink-0" size={20} />
        <p className="text-xs text-orange-700 leading-tight">
          Lembrete: Depósitos após o dia 10 de cada mês sofrem multa automática de 15%.
        </p>
      </div>

      <div className="space-y-3">
        {savings.map(saving => {
          const member = members.find(m => m.id === saving.memberId);
          return (
            <div key={saving.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden ${saving.lateFee > 0 ? 'bg-orange-50' : 'bg-green-50'}`}>
                  {member?.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className={`font-bold text-sm ${saving.lateFee > 0 ? 'text-orange-600' : 'text-green-600'}`}>{member?.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold">{member?.name || 'Membro'}</p>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <ArrowUpRight size={10} className={saving.lateFee > 0 ? 'text-orange-500' : 'text-green-500'} />
                    {new Date(saving.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{saving.amount.toLocaleString()} MT</p>
                {saving.lateFee > 0 && (
                  <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">+ {saving.lateFee.toLocaleString()} MT Multa</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 animate-slide-up shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-center">Registrar Depósito</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Membro</label>
                <select 
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#aa0000]/20"
                  value={formData.memberId}
                  onChange={e => setFormData({...formData, memberId: e.target.value})}
                  required
                >
                  <option value="">Selecione um membro</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Valor (MT)</label>
                <input 
                  type="number" 
                  min={settings.minMensalidade}
                  max={settings.maxMensalidade}
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#aa0000]/20"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Data do Depósito</label>
                <input 
                  type="date" 
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#aa0000]/20"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 text-sm font-bold text-gray-500">Cancelar</button>
                <button type="submit" className="flex-[2] py-4 bg-[#aa0000] text-white text-sm font-bold rounded-2xl shadow-lg shadow-[#aa0000]/20 active:scale-95 transition-all">
                  Confirmar Depósito
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
