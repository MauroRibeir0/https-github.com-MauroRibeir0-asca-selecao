
import React from 'react';
import { Settings as SettingsIcon, Save, ShieldAlert, LogOut } from 'lucide-react';
import { SystemSettings } from '../types';

interface SettingsProps {
  settings: SystemSettings;
  setSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
}

const Settings: React.FC<SettingsProps> = ({ settings, setSettings }) => {
  const handleChange = (key: keyof SystemSettings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Configurações</h2>
        <button className="bg-green-600 text-white p-2 rounded-xl shadow-lg active:scale-95 transition-transform">
          <Save size={20} />
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert size={14} className="text-[#aa0000]" />
            Parâmetros do Ciclo
          </h3>
          
          <div className="space-y-4">
            <InputGroup 
              label="Valor da Jóia (MT)" 
              value={settings.joiaAmount} 
              onChange={(val) => handleChange('joiaAmount', val)} 
            />
            <div className="grid grid-cols-2 gap-4">
              <InputGroup 
                label="Poupança Mín (MT)" 
                value={settings.minMensalidade} 
                onChange={(val) => handleChange('minMensalidade', val)} 
              />
              <InputGroup 
                label="Poupança Máx (MT)" 
                value={settings.maxMensalidade} 
                onChange={(val) => handleChange('maxMensalidade', val)} 
              />
            </div>
            <InputGroup 
              label="Meta de Movimentação p/ Juros (MT)" 
              value={settings.minMovementForInterest} 
              onChange={(val) => handleChange('minMovementForInterest', val)} 
            />
            <InputGroup 
              label="Juros Fixo p/ Membro (MT)" 
              value={settings.fixedInterestReturn} 
              onChange={(val) => handleChange('fixedInterestReturn', val)} 
            />
          </div>
        </section>

        <section className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Regras de Crédito</h3>
          <InputGroup 
            label="Taxa de Juros de Empréstimo (%)" 
            value={settings.loanInterestRate * 100} 
            onChange={(val) => handleChange('loanInterestRate', val / 100)} 
          />
        </section>

        <button className="w-full flex items-center justify-center gap-2 py-4 text-red-600 font-bold border border-red-100 rounded-2xl active:bg-red-50 transition-colors">
          <LogOut size={18} />
          Sair do Sistema
        </button>
      </div>
      
      <p className="text-center text-[10px] text-gray-400 font-medium">ASCA Seleção v1.0.0 &bull; Desenvolvido para Gestão Profissional</p>
    </div>
  );
};

const InputGroup: React.FC<{ label: string, value: number, onChange: (val: number) => void }> = ({ label, value, onChange }) => (
  <div>
    <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">{label}</label>
    <input 
      type="number" 
      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#aa0000]/20 font-bold"
      value={value}
      onChange={e => onChange(Number(e.target.value))}
    />
  </div>
);

export default Settings;
