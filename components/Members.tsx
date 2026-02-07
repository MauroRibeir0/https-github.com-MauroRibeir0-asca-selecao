import React, { useState, useMemo } from 'react';
import { UserPlus, Search, Trophy, MapPin, Phone, Mail, Camera, X, Plus, Wallet, History, ReceiptText, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';
import { Member, Saving, Loan, SystemSettings } from '../types.ts';
import AIAssistant from './AIAssistant.tsx';

interface MembersProps {
  members: Member[];
  settings: SystemSettings;
  savings: Saving[];
  loans: Loan[];
  isAdmin: boolean;
  refreshData: () => void;
}

const Members: React.FC<MembersProps> = ({ members, settings, savings, loans, isAdmin, refreshData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredMembers = useMemo(() => {
    return members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [members, searchTerm]);

  const handleCreateMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from('members').insert({
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      avatar: formData.get('avatar'),
      joia_paid: false,
      total_savings: 0,
      total_loans_taken: 0,
      eligibility_progress: 0
    });

    if (error) {
      console.error("Error creating member:", error);
      alert("Erro ao criar membro: " + error.message);
    } else {
      refreshData();
      setIsAddingMember(false);
    }
    setLoading(false);
  };

  const toggleJoia = async (memberId: string, current: boolean) => {
    const { error } = await supabase.from('members').update({ joia_paid: !current }).eq('id', memberId);
    if (error) {
      alert("Erro ao atualizar Jóia: " + error.message);
    } else {
      refreshData();
      if (selectedMember && selectedMember.id === memberId) {
        setSelectedMember({...selectedMember, joiaPaid: !current});
      }
    }
  };

  return (
    <div className="space-y-6 pb-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Membros</h2>
        {isAdmin && (
          <button onClick={() => setIsAddingMember(true)} className="bg-[#aa0000] text-white p-2 rounded-xl active:scale-95 transition-transform shadow-lg">
            <UserPlus size={20} />
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Pesquisar..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#aa0000]/20 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredMembers.map(member => (
          <div key={member.id} onClick={() => setSelectedMember(member)} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-[#aa0000]/30 transition-colors">
            <div className="w-12 h-12 bg-[#1a1a1a] text-white rounded-2xl flex items-center justify-center font-bold overflow-hidden shrink-0 border border-gray-100">
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                member.name.charAt(0)
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-bold truncate">{member.name}</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase">{member.joiaPaid ? 'Jóia OK' : 'Jóia Pendente'}</p>
            </div>
            <Trophy className={member.eligibilityProgress >= 1 ? "text-yellow-500" : "text-gray-200"} size={20} />
          </div>
        ))}
      </div>

      {isAddingMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-[40px] p-8 animate-slide-up shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAddingMember(false)} className="absolute top-6 right-8 text-gray-400"><X /></button>
            <h3 className="text-xl font-bold mb-6 text-center">Novo Membro</h3>
            <form onSubmit={handleCreateMember} className="space-y-4">
              <Input label="Nome Completo" name="name" required />
              <Input label="Email Corporativo" name="email" type="email" required />
              <Input label="Telefone" name="phone" placeholder="+258..." required />
              <Input label="Morada" name="address" required />
              <Input label="URL da Foto (Opcional)" name="avatar" placeholder="https://..." />
              <button disabled={loading} type="submit" className="w-full bg-[#aa0000] text-white py-4 rounded-2xl font-bold mt-4 shadow-xl active:scale-95 transition-all">
                {loading ? 'Processando...' : 'Adicionar Membro'}
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedMember && (
        <MemberDetail 
          member={selectedMember} 
          onClose={() => setSelectedMember(null)} 
          savings={savings.filter(s => s.memberId === selectedMember.id)}
          loans={loans.filter(l => l.memberId === selectedMember.id)}
          settings={settings}
          onToggleJoia={() => toggleJoia(selectedMember.id, selectedMember.joiaPaid)}
        />
      )}
    </div>
  );
};

const Input = ({ label, ...props }: any) => (
  <div>
    <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">{label}</label>
    <input className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#aa0000]/20" {...props} />
  </div>
);

const MemberDetail = ({ member, onClose, savings, loans, settings, onToggleJoia }: any) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-end justify-center p-0">
    <div className="bg-[#f3f4f6] w-full max-w-md rounded-t-[40px] animate-slide-up h-[90vh] overflow-hidden flex flex-col">
      <div className="bg-white p-8 border-b relative">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-400"><X /></button>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#aa0000] text-white rounded-2xl flex items-center justify-center font-bold text-2xl overflow-hidden border-2 border-white shadow-lg">
            {member.avatar ? <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" /> : member.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-bold">{member.name}</h3>
            <button onClick={onToggleJoia} className={`text-[9px] font-bold uppercase px-3 py-1 rounded-full border mt-1 active:scale-95 transition-all ${member.joiaPaid ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
              Jóia: {member.joiaPaid ? 'Paga' : 'Pendente (Liquidar)'}
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-[9px] font-bold text-gray-400 uppercase">Total Poupado</p>
            <p className="font-bold text-lg">{member.totalSavings.toLocaleString()} MT</p>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-[9px] font-bold text-gray-400 uppercase">Movimentado</p>
            <p className="font-bold text-[#aa0000] text-lg">{member.totalLoansTaken.toLocaleString()} MT</p>
          </div>
        </div>
        
        <AIAssistant member={member} savings={savings} loans={loans} settings={settings} />
        
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-4 flex items-center gap-2"><History size={14} /> Histórico Recente</h4>
          <div className="space-y-3">
            {savings.length > 0 ? (
              savings.slice(0, 5).map((s: any) => (
                <div key={s.id} className="flex justify-between items-center py-2 border-b last:border-0 border-gray-50">
                  <span className="text-xs font-medium text-gray-600">{new Date(s.date).toLocaleDateString('pt-BR')}</span>
                  <span className="text-xs font-bold text-gray-800">{s.amount.toLocaleString()} MT</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">Nenhum registro de poupança.</p>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white p-6 border-t border-gray-100">
        <button onClick={onClose} className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform">Fechar Detalhes</button>
      </div>
    </div>
  </div>
);

export default Members;