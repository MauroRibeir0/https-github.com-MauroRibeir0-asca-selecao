
import React, { useState, useMemo } from 'react';
import { UserPlus, Search, Trophy, MapPin, Phone, Mail, Camera, X, Plus, Wallet, History, ReceiptText, ShieldCheck, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2 } from 'lucide-react';
import { Member, Saving, Loan, SystemSettings } from '../types';
import AIAssistant from './AIAssistant';

interface MembersProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  settings: SystemSettings;
  savings: Saving[];
  loans: Loan[];
  isAdmin: boolean;
  onAddMember: (member: Member) => void;
}

const Members: React.FC<MembersProps> = ({ members, setMembers, settings, savings, loans, isAdmin, onAddMember }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberPhoto, setNewMemberPhoto] = useState<string | undefined>(undefined);

  const filteredMembers = useMemo(() => {
    return members
      .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members, searchTerm]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMemberPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newMember: Member = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      avatar: newMemberPhoto,
      joinedAt: new Date().toISOString(),
      joiaPaid: false,
      totalSavings: 0,
      totalLoansTaken: 0,
      eligibilityProgress: 0
    };

    onAddMember(newMember);
    setIsAddingMember(false);
    setNewMemberPhoto(undefined);
  };

  // Helper to get member-specific data
  const getMemberData = (memberId: string) => {
    const memberSavings = savings.filter(s => s.memberId === memberId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const memberLoans = loans.filter(l => l.memberId === memberId).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    return { memberSavings, memberLoans };
  };

  return (
    <div className="space-y-6 pb-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Gestão de Membros</h2>
        {isAdmin && (
          <button 
            onClick={() => setIsAddingMember(true)}
            className="bg-[#aa0000] text-white p-2 rounded-xl shadow-lg shadow-[#aa0000]/20 active:scale-95 transition-transform"
          >
            <UserPlus size={20} />
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Pesquisar membro..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#aa0000]/20 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredMembers.map(member => (
          <div 
            key={member.id} 
            onClick={() => setSelectedMember(member)}
            className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm active:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#1a1a1a] text-white rounded-2xl flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  member.name.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-lg truncate">{member.name}</h4>
                <div className="flex gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${member.joiaPaid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    Jóia: {member.joiaPaid ? 'Paga' : 'Pendente'}
                  </span>
                </div>
              </div>
              <Trophy className={member.eligibilityProgress >= 1 ? "text-yellow-500 shrink-0" : "text-gray-200 shrink-0"} size={24} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                <span>Elegibilidade a Juros</span>
                <span>{member.totalLoansTaken.toLocaleString()} / 50.000 MT</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${member.eligibilityProgress >= 1 ? 'bg-green-500' : 'bg-[#aa0000]'}`} 
                  style={{ width: `${Math.min(member.eligibilityProgress * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      {isAddingMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-t-[40px] p-8 animate-slide-up max-h-[95vh] overflow-y-auto relative shadow-2xl">
            <button 
              onClick={() => { setIsAddingMember(false); setNewMemberPhoto(undefined); }}
              className="absolute top-6 right-8 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
            
            <h3 className="text-2xl font-bold text-center mb-6">Novo Membro</h3>
            
            <form onSubmit={handleCreateMember} className="space-y-5">
              <div className="flex flex-col items-center mb-6">
                <label className="relative cursor-pointer group">
                  <div className="w-24 h-24 bg-gray-100 rounded-[32px] flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 group-hover:border-[#aa0000] transition-colors">
                    {newMemberPhoto ? (
                      <img src={newMemberPhoto} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="text-gray-400 group-hover:text-[#aa0000] transition-colors" size={32} />
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  <div className="absolute -bottom-2 -right-2 bg-[#aa0000] text-white p-2 rounded-xl shadow-lg">
                    <Plus size={16} />
                  </div>
                </label>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-3">Foto de Perfil (Opcional)</p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Nome Completo</label>
                <input 
                  name="name"
                  type="text" 
                  required
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#aa0000]/20 font-medium"
                  placeholder="Ex: João da Silva"
                />
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">E-mail</label>
                  <input 
                    name="email"
                    type="email" 
                    required
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#aa0000]/20 font-medium"
                    placeholder="joao@exemplo.com"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Celular (WhatsApp)</label>
                  <input 
                    name="phone"
                    type="tel" 
                    required
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#aa0000]/20 font-medium"
                    placeholder="+258 8X XXX XXXX"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Morada</label>
                <input 
                  name="address"
                  type="text" 
                  required
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#aa0000]/20 font-medium"
                  placeholder="Cidade, Bairro, Rua..."
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-[#aa0000] text-white py-5 rounded-3xl font-bold text-lg shadow-xl shadow-[#aa0000]/20 active:scale-95 transition-all"
                >
                  Criar Novo Membro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Details Modal with Expanded Info */}
      {selectedMember && (() => {
        const { memberSavings, memberLoans } = getMemberData(selectedMember.id);
        const totalPendingLoans = memberLoans.filter(l => l.status === 'active').reduce((acc, l) => acc + l.totalRepayment, 0);

        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-end justify-center p-0 md:p-4">
            <div className="bg-[#f3f4f6] w-full max-w-md rounded-t-[40px] md:rounded-[40px] animate-slide-up max-h-[95vh] overflow-hidden flex flex-col shadow-2xl border-t border-white/20">
              
              {/* Modal Header Sticky */}
              <div className="bg-white px-8 pt-8 pb-6 border-b border-gray-100 shrink-0 relative">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
                <button 
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-8 right-8 p-2 bg-gray-50 rounded-full text-gray-400"
                >
                  <X size={20} />
                </button>

                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 bg-[#aa0000] text-white rounded-[28px] flex items-center justify-center font-bold text-3xl shadow-lg overflow-hidden shrink-0 border-4 border-white">
                    {selectedMember.avatar ? (
                      <img src={selectedMember.avatar} alt={selectedMember.name} className="w-full h-full object-cover" />
                    ) : (
                      selectedMember.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold truncate">{selectedMember.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${selectedMember.joiaPaid ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-red-100 text-red-600 border border-red-200'}`}>
                        Jóia: {selectedMember.joiaPaid ? 'Paga' : 'Pendente'}
                      </span>
                      {selectedMember.eligibilityProgress >= 1 && (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200 uppercase">
                          <ShieldCheck size={10} /> Elegível a Juros
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f3f4f6]">
                
                {/* Section: Resumo de Saldos */}
                <section>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Wallet size={14} className="text-[#aa0000]" />
                    Saldos & Relatórios
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Poupado</p>
                      <p className="text-lg font-bold text-[#1a1a1a]">{selectedMember.totalSavings.toLocaleString()} MT</p>
                    </div>
                    <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Dívida Ativa</p>
                      <p className="text-lg font-bold text-[#aa0000]">{totalPendingLoans.toLocaleString()} MT</p>
                    </div>
                  </div>
                  <div className="mt-3 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Progresso Meta 50k</p>
                      <p className="text-xs font-bold text-[#aa0000]">{Math.floor(selectedMember.eligibilityProgress * 100)}%</p>
                    </div>
                    <div className="h-3 bg-gray-50 rounded-full overflow-hidden p-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-[#aa0000] to-red-500 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(selectedMember.eligibilityProgress * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="mt-2 text-[10px] text-gray-500 font-medium">
                      Falta movimentar <span className="font-bold text-[#1a1a1a]">{Math.max(0, 50000 - selectedMember.totalLoansTaken).toLocaleString()} MT</span> para garantir os {settings.fixedInterestReturn.toLocaleString()} MT de juros.
                    </p>
                  </div>
                </section>

                {/* Section: Histórico de Poupança */}
                <section>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <History size={14} className="text-[#aa0000]" />
                      Depósitos Mensais
                    </h4>
                    <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">
                      {memberSavings.length} Lançamentos
                    </span>
                  </div>
                  <div className="space-y-2">
                    {memberSavings.length > 0 ? memberSavings.map(s => (
                      <div key={s.id} className="bg-white p-3 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${s.lateFee > 0 ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`}>
                            <ArrowUpRight size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-800">{new Date(s.date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                            <p className="text-[9px] text-gray-400">{new Date(s.date).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{s.amount.toLocaleString()} MT</p>
                          {s.lateFee > 0 && <p className="text-[8px] text-red-500 font-bold">+ {s.lateFee.toLocaleString()} MT Multa</p>}
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-6 bg-white rounded-3xl border border-dashed border-gray-200">
                        <p className="text-xs text-gray-400 font-medium">Nenhum depósito registrado.</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Section: Histórico de Crédito */}
                <section>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <ReceiptText size={14} className="text-[#aa0000]" />
                      Empréstimos & Crédito
                    </h4>
                    <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">
                      {memberLoans.length} Registros
                    </span>
                  </div>
                  <div className="space-y-3">
                    {memberLoans.length > 0 ? memberLoans.map(l => (
                      <div key={l.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${l.status === 'paid' ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'}`}>
                              {l.status === 'paid' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-tight">Empréstimo</p>
                              <p className="text-[9px] text-gray-400">{new Date(l.requestedAt).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-[#aa0000]">{l.amount.toLocaleString()} MT</p>
                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md ${l.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                              {l.status === 'paid' ? 'Liquidado' : 'Ativo'}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-xl">
                          <div>
                            <p className="text-[8px] font-bold text-gray-400 uppercase">A Pagar (+15%)</p>
                            <p className="text-xs font-bold">{l.totalRepayment.toLocaleString()} MT</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] font-bold text-gray-400 uppercase">Vencimento</p>
                            <p className="text-xs font-bold">{new Date(l.dueDate).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-6 bg-white rounded-3xl border border-dashed border-gray-200">
                        <p className="text-xs text-gray-400 font-medium">Nenhum crédito solicitado.</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Section: AI Analysis */}
                <section>
                  <AIAssistant 
                    member={selectedMember} 
                    savings={memberSavings}
                    loans={memberLoans}
                    settings={settings}
                  />
                </section>

                {/* Section: Contact Details */}
                <section className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                   <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Informação de Contacto</h4>
                   <div className="space-y-3">
                      <div className="flex items-start gap-4">
                        <Phone className="text-[#aa0000] shrink-0" size={16} />
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">WhatsApp</p>
                          <p className="text-xs font-semibold">{selectedMember.phone || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <MapPin className="text-[#aa0000] shrink-0" size={16} />
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Morada</p>
                          <p className="text-xs font-semibold">{selectedMember.address || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Mail className="text-[#aa0000] shrink-0" size={16} />
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Email</p>
                          <p className="text-xs font-semibold">{selectedMember.email || 'N/A'}</p>
                        </div>
                      </div>
                   </div>
                </section>

                <div className="h-4"></div>
              </div>

              {/* Modal Footer Sticky */}
              <div className="bg-white p-6 border-t border-gray-100 shrink-0">
                <button 
                  onClick={() => setSelectedMember(null)}
                  className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Fechar Painel do Membro
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Members;
