
import React, { useState, useMemo } from 'react';
import { UserPlus, Search, X, History, ShieldEllipsis, ChevronRight, User, Loader2, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';
import { Member, Saving, Loan, SystemSettings } from '../types.ts';
import AIAssistant from './AIAssistant.tsx';

interface MembersProps {
  members: Member[];
  settings: SystemSettings;
  savings: Saving[];
  loans: Loan[];
  isAdmin: boolean;
  currentUser: Member | null;
  refreshData: () => void;
  externalSelected: Member | null;
  setExternalSelected: (m: Member | null) => void;
}

const Members: React.FC<MembersProps> = ({ members, settings, savings, loans, isAdmin, currentUser, refreshData, externalSelected, setExternalSelected }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredMembers = useMemo(() => {
    return members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [members, searchTerm]);

  const handleCreateMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAdmin) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from('members').insert({
      name: formData.get('name'),
      email: String(formData.get('email')).toLowerCase().trim(),
      phone: formData.get('phone'),
      role: formData.get('role') || 'member',
      joia_paid: false
    });

    if (error) alert("Erro ao registar membro: " + error.message);
    else {
      refreshData();
      setIsAddingMember(false);
    }
    setLoading(false);
  };

  const toggleJoia = async (memberId: string, current: boolean) => {
    if (!isAdmin) return;
    const { error } = await supabase.from('members').update({ joia_paid: !current }).eq('id', memberId);
    if (error) alert(error.message);
    else refreshData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Membros do Grupo</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Controle de Participação</p>
        </div>
        {isAdmin && (
          <button onClick={() => setIsAddingMember(true)} className="bg-[#aa0000] text-white p-3 rounded-2xl shadow-lg active:scale-95 flex items-center gap-2 pr-5 transition-all">
            <UserPlus size={20} />
            <span className="text-xs font-bold uppercase">Registar</span>
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Procurar por nome..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none shadow-sm font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredMembers.map(member => (
          <div key={member.id} onClick={() => setExternalSelected(member)} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all">
            <div className={`w-12 h-12 ${member.role === 'admin' ? 'bg-[#aa0000]' : 'bg-[#1a1a1a]'} text-white rounded-2xl flex items-center justify-center font-black border-2 border-white`}>
              {member.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-800 truncate flex items-center gap-2 text-sm">
                {member.name}
                {member.role === 'admin' && <ShieldEllipsis size={12} className="text-yellow-500" />}
              </h4>
              <div className="flex gap-2 items-center mt-1">
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${member.joiaPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  JÓIA: {member.joiaPaid ? 'PAGA' : 'PENDENTE'}
                </span>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{member.role === 'admin' ? 'Gestor' : 'Investidor'}</span>
              </div>
            </div>
            <ChevronRight className="text-gray-300" size={20} />
          </div>
        ))}
        {filteredMembers.length === 0 && (
          <div className="py-20 text-center opacity-30">
            <User size={48} className="mx-auto mb-2" />
            <p className="font-black uppercase tracking-[0.2em] text-[10px]">Nenhum membro encontrado</p>
          </div>
        )}
      </div>

      {isAddingMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end justify-center p-0">
          <div className="bg-white w-full max-w-md rounded-t-[40px] p-8 animate-slide-up shadow-2xl relative">
            <button onClick={() => setIsAddingMember(false)} className="absolute top-6 right-8 text-gray-400 p-2"><X /></button>
            <h3 className="text-xl font-bold mb-6 text-center text-gray-800">Registar Novo Membro</h3>
            <form onSubmit={handleCreateMember} className="space-y-4">
              <Input label="Nome Completo" name="name" placeholder="Ex: João Silva" required />
              <Input label="Email de Acesso (Login)" name="email" type="email" placeholder="email@exemplo.com" required />
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block mb-1">Qual o papel no grupo?</label>
                <select name="role" className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold outline-none border-none">
                  <option value="member">Investidor (Comum)</option>
                  <option value="admin">Administrador (Gestão)</option>
                </select>
              </div>
              <button disabled={loading} type="submit" className="w-full bg-[#aa0000] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl mt-4 flex justify-center items-center gap-2 active:scale-95 transition-all">
                {loading ? <Loader2 className="animate-spin" /> : 'Confirmar Registo'}
              </button>
            </form>
          </div>
        </div>
      )}

      {externalSelected && (
        <MemberDetail 
          member={externalSelected} 
          isMe={externalSelected.id === currentUser?.id}
          isAdmin={isAdmin}
          onClose={() => setExternalSelected(null)} 
          savings={savings.filter(s => s.memberId === externalSelected.id)}
          loans={loans.filter(l => l.memberId === externalSelected.id)}
          settings={settings}
          onToggleJoia={() => toggleJoia(externalSelected.id, externalSelected.joiaPaid)}
        />
      )}
    </div>
  );
};

const Input = ({ label, ...props }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block">{label}</label>
    <input className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-800 focus:ring-2 focus:ring-[#aa0000]/10 transition-all" {...props} />
  </div>
);

const MemberDetail = ({ member, isMe, isAdmin, onClose, savings, loans, settings, onToggleJoia }: any) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-end justify-center p-0">
    <div className="bg-[#f3f4f6] w-full max-w-md rounded-t-[40px] animate-slide-up h-[90vh] flex flex-col shadow-2xl overflow-hidden">
      <div className="bg-white p-8 border-b relative">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 p-2"><X /></button>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-[#1a1a1a] text-white rounded-[1.5rem] flex items-center justify-center font-black text-3xl border-4 border-white shadow-xl">
            {member.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{member.name}</h3>
            <div className="flex gap-2">
              <button onClick={onToggleJoia} disabled={!isAdmin} className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border mt-2 ${member.joiaPaid ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                Jóia: {member.joiaPaid ? 'Paga' : 'Não Validada'}
              </button>
              {member.role === 'admin' && <span className="text-[9px] font-black uppercase px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 mt-2">Admin</span>}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <StatBox label="Poupança Total" val={`${member.totalSavings.toLocaleString()} MT`} />
          <StatBox label="Elegibilidade" val={`${member.totalLoansTaken.toLocaleString()} MT`} />
        </div>
        {(isMe || isAdmin) && <AIAssistant member={member} savings={savings} loans={loans} settings={settings} />}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <h4 className="text-[10px] font-black text-gray-400 uppercase mb-4 flex items-center gap-2"><History size={16} /> Movimentação Recente</h4>
          <div className="space-y-3">
            {savings.length > 0 ? savings.map((s: any) => (
              <div key={s.id} className="flex justify-between items-center py-2 border-b last:border-0 border-gray-50">
                <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(s.date).toLocaleDateString()}</span>
                <span className="text-sm font-black text-gray-800">{s.amount.toLocaleString()} MT</span>
              </div>
            )) : <p className="text-center py-4 text-[10px] font-black text-gray-300 uppercase">Sem registos de poupança</p>}
          </div>
        </div>
      </div>
      <button onClick={onClose} className="m-6 bg-[#1a1a1a] text-white py-4 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all">Voltar</button>
    </div>
  </div>
);

const StatBox = ({ label, val }: any) => (
  <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm text-center">
    <p className="text-[8px] font-black text-gray-400 uppercase mb-1 tracking-widest leading-tight">{label}</p>
    <p className="font-black text-gray-800 text-sm">{val}</p>
  </div>
);

export default Members;
