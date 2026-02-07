
import React, { useState, useMemo, useEffect } from 'react';
// Added User to the imported icons from lucide-react
import { UserPlus, Search, Trophy, MapPin, Phone, Mail, Camera, X, Plus, Wallet, History, ReceiptText, ShieldCheck, Clock, CheckCircle2, Loader2, AlertCircle, ShieldEllipsis, UserCheck, ChevronRight, Lock, User } from 'lucide-react';
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
    
    // Explicitamente inserindo a coluna 'role' com valor do select
    const { error } = await supabase.from('members').insert({
      name: formData.get('name'),
      email: formData.get('email')?.toString().toLowerCase(),
      phone: formData.get('phone'),
      address: formData.get('address'),
      role: formData.get('role') || 'member',
      joia_paid: false,
      total_savings: 0,
      total_loans_taken: 0,
      eligibility_progress: 0
    });

    if (error) {
      alert("Erro ao criar membro: " + error.message);
    } else {
      refreshData();
      setIsAddingMember(false);
    }
    setLoading(false);
  };

  const toggleJoia = async (memberId: string, current: boolean) => {
    if (!isAdmin) return;
    const { error } = await supabase.from('members').update({ joia_paid: !current }).eq('id', memberId);
    if (error) {
      alert("Erro ao atualizar Jóia: " + error.message);
    } else {
      refreshData();
      if (externalSelected && externalSelected.id === memberId) {
        setExternalSelected({...externalSelected, joiaPaid: !current});
      }
    }
  };

  return (
    <div className="space-y-6 pb-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Transparência</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase">Membros do Grupo</p>
        </div>
        {isAdmin && (
          <button onClick={() => setIsAddingMember(true)} className="bg-[#aa0000] text-white p-3 rounded-2xl active:scale-95 transition-transform shadow-lg">
            <UserPlus size={20} />
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Pesquisar companheiros..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none shadow-sm font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredMembers.map(member => {
          const isMe = member.id === currentUser?.id;
          const isMemberAdmin = member.role === 'admin';
          return (
            <div key={member.id} onClick={() => setExternalSelected(member)} className={`bg-white p-5 rounded-[2rem] border ${isMe ? 'border-[#aa0000]/40 bg-[#aa0000]/5' : 'border-gray-100'} shadow-sm flex items-center gap-4 cursor-pointer hover:border-[#aa0000]/30 transition-all active:scale-[0.98]`}>
              <div className={`w-14 h-14 ${isMemberAdmin ? 'bg-[#aa0000]' : 'bg-[#1a1a1a]'} text-white rounded-2xl flex items-center justify-center font-bold overflow-hidden shrink-0 border-2 border-white shadow-md`}>
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">{member.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-800 truncate">{member.name}</h4>
                  {isMemberAdmin && <ShieldEllipsis size={12} className="text-[#aa0000]" />}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${member.joiaPaid ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    Jóia: {member.joiaPaid ? 'PAGA' : 'PENDENTE'}
                  </span>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${isMemberAdmin ? 'bg-[#aa0000]/10 text-[#aa0000]' : 'bg-gray-100 text-gray-500'}`}>
                    {isMemberAdmin ? 'ADM' : 'MBR'}
                  </span>
                  {isMe && <span className="text-[8px] font-black text-[#aa0000] uppercase bg-white px-2 py-0.5 rounded-full border border-[#aa0000]/20">TU</span>}
                </div>
              </div>
              <ChevronRight className="text-gray-300" size={20} />
            </div>
          );
        })}
      </div>

      {isAddingMember && isAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end justify-center p-0 md:p-4">
          <div className="bg-white w-full max-w-md rounded-t-[40px] md:rounded-[40px] p-8 animate-slide-up shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAddingMember(false)} className="absolute top-6 right-8 text-gray-400 p-2"><X /></button>
            <h3 className="text-xl font-bold mb-6 text-center text-gray-800 underline underline-offset-8 decoration-[#aa0000] decoration-4">Novo Cadastro ASCA</h3>
            <form onSubmit={handleCreateMember} className="space-y-5">
              <Input label="Nome Completo" name="name" placeholder="Ex: João Ribeiro" required />
              <Input label="Email de Acesso" name="email" type="email" placeholder="membro@exemplo.com" required />
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 block">Nível de Acesso (Papel)</label>
                <select name="role" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#aa0000]/20 font-bold text-gray-700">
                  <option value="member">Investidor (Membro)</option>
                  <option value="admin">Administrador (Gestor)</option>
                </select>
              </div>
              <Input label="Telefone" name="phone" placeholder="+258..." />
              <button disabled={loading} type="submit" className="w-full bg-[#aa0000] text-white py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-all flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : 'Registrar e Configurar Perfil'}
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
    <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 block">{label}</label>
    <input className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#aa0000]/20 font-medium text-gray-800" {...props} />
  </div>
);

const MemberDetail = ({ member, isMe, isAdmin, onClose, savings, loans, settings, onToggleJoia }: any) => {
  const canSeePrivate = isMe || isAdmin;
  const isMemberAdmin = member.role === 'admin';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-end justify-center p-0">
      <div className="bg-[#f3f4f6] w-full max-w-md rounded-t-[40px] animate-slide-up h-[92vh] overflow-hidden flex flex-col shadow-2xl border-t border-white/20">
        <div className="bg-white p-8 border-b relative shrink-0">
          <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 p-2 bg-gray-50 rounded-full"><X size={20} /></button>
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 ${isMemberAdmin ? 'bg-[#aa0000]' : 'bg-[#1a1a1a]'} text-white rounded-[1.5rem] flex items-center justify-center font-bold text-3xl overflow-hidden border-4 border-white shadow-xl`}>
              {member.avatar ? <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" /> : member.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold text-gray-800 truncate">{member.name}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <button 
                  onClick={onToggleJoia} 
                  disabled={!isAdmin}
                  className={`text-[10px] font-bold uppercase px-4 py-1.5 rounded-full border transition-all flex items-center gap-2 ${member.joiaPaid ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}
                >
                  {member.joiaPaid ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  Jóia: {member.joiaPaid ? 'Paga' : (isAdmin ? 'Liquidar Agora' : 'Pendente')}
                </button>
                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border uppercase flex items-center gap-1 ${isMemberAdmin ? 'bg-[#aa0000]/5 text-[#aa0000] border-[#aa0000]/20' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {isMemberAdmin ? <ShieldEllipsis size={12} /> : <User size={12} />}
                  {isMemberAdmin ? 'Gestor' : 'Investidor'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Poupado</p>
              <p className="font-bold text-xl text-gray-800">{member.totalSavings.toLocaleString()} MT</p>
            </div>
            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Movimentado</p>
              <p className="font-bold text-[#aa0000] text-xl">{member.totalLoansTaken.toLocaleString()} MT</p>
            </div>
          </div>
          
          {canSeePrivate ? (
            <AIAssistant member={member} savings={savings} loans={loans} settings={settings} />
          ) : (
            <div className="bg-gray-100 p-6 rounded-[2rem] border border-dashed border-gray-300 text-center opacity-60">
              <Lock size={20} className="mx-auto mb-2 text-gray-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Análise Privada ao Membro</p>
            </div>
          )}
          
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-5 flex items-center gap-2"><History size={16} className="text-[#aa0000]" /> Extrato do Membro</h4>
            <div className="space-y-4">
              {savings.length > 0 ? (
                savings.slice(0, 8).map((s: any) => (
                  <div key={s.id} className="flex justify-between items-center py-2 border-b last:border-0 border-gray-50">
                    <div>
                      <span className="text-xs font-bold text-gray-700 block">{new Date(s.date).toLocaleDateString('pt-BR')}</span>
                      <span className="text-[9px] text-gray-400 uppercase font-bold">Depósito Mensal</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-800 block">{s.amount.toLocaleString()} MT</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center opacity-40">
                  <ReceiptText size={40} className="mx-auto mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest">Sem movimentações</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-8 border-t border-gray-100 safe-area-pb">
          <button onClick={onClose} className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform">
            Fechar Perfil
          </button>
        </div>
      </div>
    </div>
  );
};

export default Members;
