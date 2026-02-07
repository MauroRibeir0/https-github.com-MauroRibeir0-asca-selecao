import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, ShieldAlert, LogOut, Loader2, Info } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';
import { SystemSettings } from '../types.ts';

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
    try {
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

      if (error) throw error;
      
      refreshData();
      alert("Configurações sincronizadas com sucesso!");
    } catch (error: any) {
      alert("Erro ao salvar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Parâmetros do Sistema</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Gestão Ribeiro, Lda.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#aa0000] text-white p-4 rounded-2xl shadow-xl shadow-[#aa0000]/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
        </button>
      </div>

      <div className="bg-[#1a1a1a] p-5 rounded-[2rem] border border-gray-800 shadow-xl mb-4">
        <div className="flex items-center gap-3 mb-2">
          <Info className="text-[#aa0000]" size={18} />
          <h4 className="text-white text-xs font-bold uppercase tracking-widest">Sincronização em Nuvem</h4>
        </div>
        <p className="text-[10px] text-gray-400 leading-tight">Estes valores alteram instantaneamente as regras de cálculo para todos os membros do grupo.</p>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
        <section className="space-y-5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert size={14} className="text-[#aa0000]" />
            Poupança & Adesão
          </h3>
          
          <div className="space-y-5">
            <InputGroup 
              label="Taxa de Adesão (Jóia)" 
              value={localSettings.joiaAmount} 
              onChange={(val) => handleChange('joiaAmount', val)} 
              suffix="MT"
            />
            <div className="grid grid-cols-2 gap-4">
              <InputGroup 
                label="Limite Mínimo" 
                value={localSettings.minMensalidade} 
                onChange={(val) => handleChange('minMensalidade', val)} 
                suffix="MT"
              />
              <InputGroup 
                label="Limite Máximo" 
                value={localSettings.maxMensalidade} 
                onChange={(val) => handleChange('maxMensalidade', val)} 
                suffix="MT"
              />
            </div>
            <InputGroup 
              label="Meta de Movimentação Anual" 
              value={localSettings.minMovementForInterest} 
              onChange={(val) => handleChange('minMovementForInterest', val)} 
              suffix="MT"
            />
            <InputGroup 
              label="Lucro Fixo Garantido" 
              value={localSettings.fixedInterestReturn} 
              onChange={(val) => handleChange('fixedInterestReturn', val)} 
              suffix="MT"
            />
          </div>
        </section>

        <section className="space-y-5 pt-6 border-t border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <SettingsIcon size={14} className="text-[#aa0000]" />
            Taxas & Gestão
          </h3>
          <div className="space-y-5">
            <InputGroup 
              label="Juros de Empréstimo" 
              value={localSettings.loanInterestRate * 100} 
              onChange={(val) => handleChange('loanInterestRate', val / 100)} 
              suffix="%"
            />
            <InputGroup 
              label="Gestão por Membro" 
              value={localSettings.managementFeePerMember} 
              onChange={(val) => handleChange('managementFeePerMember', val)} 
              suffix="MT"
            />
            <InputGroup 
              label="Multa de Atraso" 
              value={localSettings.lateFeeRate * 100} 
              onChange={(val) => handleChange('lateFeeRate', val / 100)} 
              suffix="%"
            />
          </div>
        </section>

        <div className="pt-4">
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center justify-center gap-3 py-4 text-red-600 font-bold bg-red-50 border border-red-100 rounded-2xl active:scale-95 transition-all"
          >
            <LogOut size={20} />
            Encerrar Sessão Segura
          </button>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2 py-4">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ASCA Seleção &bull; v1.2.0</p>
        <div className="w-10 h-1 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
};

const InputGroup: React.FC<{ label: string, value: number, onChange: (val: number) => void, suffix: string }> = ({ label, value, onChange, suffix }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 block">{label}</label>
    <div className="relative">
      <input 
        type="number" 
        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#aa0000]/20 font-black text-gray-800 transition-all"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase">{suffix}</span>
    </div>
  </div>
);

export default Settings;