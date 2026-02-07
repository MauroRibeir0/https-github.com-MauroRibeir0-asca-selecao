import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, ShieldAlert, LogOut, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SystemSettings } from '../types';

interface SettingsProps {
  settings: SystemSettings;
  refreshData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, refreshData }) => {
  const [localSettings, setLocalSettings] = useState<SystemSettings>(settings);
  const [loading, setLoading] = useState(false);

  const handleChange = (key: keyof SystemSettings, value: number) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.from('settings').update({
      joia_amount: localSettings.joiaAmount,
      min_mensalidade: localSettings.minMensalidade,
      max_mensalidade: localSettings.maxMensalidade,
      late_fee_rate: localSettings.lateFeeRate,
      min_movement_for_interest: localSettings.minMovementForInterest,
      fixed_interest_return: localSettings.fixedInterestReturn,
      management_fee_per_member: localSettings.managementFeePerMember,
      loan_interest_rate: localSettings.loanInterestRate
    }).eq('id', 1);

    if (error) {
      alert("Erro ao salvar configurações: " + error.message);
    } else {
      refreshData();
      alert("Configurações salvas com sucesso!");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Configurações do Grupo</h2>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#aa0000] text-white p-3 rounded-xl shadow-lg active:scale-95 transition-transform disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert size={14} className="text-[#aa0000]" />
            Parâmetros Financeiros
          </h3>
          
          <div className="space-y-4">
            <InputGroup 
              label="Valor da Jóia de Adesão (MT)" 
              value={localSettings.joiaAmount} 
              onChange={(val) => handleChange('joiaAmount', val)} 
            />
            <div className="grid grid-cols-2 gap-4">
              <InputGroup 
                label="Poupança Mín (MT)" 
                value={localSettings.minMensalidade} 
                onChange={(val) => handleChange('minMensalidade', val)} 
              />
              <InputGroup 
                label="Poupança Máx (MT)" 
                value={localSettings.maxMensalidade} 
                onChange={(val) => handleChange('maxMensalidade', val)} 
              />
            </div>
            <InputGroup 
              label="Meta de Movimentação (50k) MT" 
              value={localSettings.minMovementForInterest} 
              onChange={(val) => handleChange('minMovementForInterest', val)} 
            />
            <InputGroup 
              label="Bónus Fixo Anual (MT)" 
              value={localSettings.fixedInterestReturn} 
              onChange={(val) => handleChange('fixedInterestReturn', val)} 
            />
          </div>
        </section>

        <section className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Crédito & Taxas</h3>
          <div className="space-y-4">
            <InputGroup 
              label="Juros de Empréstimo (%)" 
              value={localSettings.loanInterestRate * 100} 
              onChange={(val) => handleChange('loanInterestRate', val / 100)} 
            />
            <InputGroup 
              label="Taxa de Gestão p/ Membro (MT)" 
              value={localSettings.managementFeePerMember} 
              onChange={(val) => handleChange('managementFeePerMember', val)} 
            />
          </div>
        </section>

        <button 
          onClick={() => supabase.auth.signOut()}
          className="w-full flex items-center justify-center gap-2 py-4 text-red-600 font-bold border border-red-100 rounded-2xl active:bg-red-50 transition-colors mt-4"
        >
          <LogOut size={18} />
          Terminar Sessão
        </button>
      </div>
      
      <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">ASCA Seleção &bull; Ribeiro, Lda. &bull; v1.0.1</p>
    </div>
  );
};

const InputGroup: React.FC<{ label: string, value: number, onChange: (val: number) => void }> = ({ label, value, onChange }) => (
  <div>
    <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">{label}</label>
    <input 
      type="number" 
      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#aa0000]/20 font-bold text-gray-800"
      value={value}
      onChange={e => onChange(Number(e.target.value))}
    />
  </div>
);

export default Settings;