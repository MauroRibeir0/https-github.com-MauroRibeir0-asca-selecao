
import React, { useState } from 'react';
import { supabase } from '../lib/supabase.ts';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Loader2, 
  LogIn, 
  User, 
  AlertCircle, 
  UserPlus, 
  ArrowLeft,
  Info
} from 'lucide-react';

export default function Auth({ onLogin }: { onLogin: () => void }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [error, setError] = useState<{message: string, isRateLimit?: boolean} | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    const normalizedEmail = email.toLowerCase().trim();

    try {
      if (isRegistering) {
        // 1. Criar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: password,
        });

        if (authError) {
          if (authError.message.includes('rate limit')) {
            throw { message: "Limite de e-mails excedido pelo Supabase. Desative 'Confirm Email' no painel do Supabase para continuar.", isRateLimit: true };
          }
          throw authError;
        }

        // 2. Criar registro na nossa tabela pública vinculando o user_id
        const { error: dbError } = await supabase.from('members').insert({
          user_id: authData.user?.id,
          name: name,
          email: normalizedEmail,
          role: role,
          joia_paid: false,
          must_change_password: true
        });

        if (dbError) throw dbError;

        setSuccess("Conta criada com sucesso! Já pode entrar.");
        setIsRegistering(false);
        setPassword('');
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({ 
          email: normalizedEmail, 
          password 
        });

        if (loginError) throw loginError;
        onLogin();
      }
    } catch (err: any) {
      setError({
        message: err.message || "Erro de autenticação.",
        isRateLimit: err.isRateLimit || false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center p-6 max-w-md mx-auto relative overflow-hidden">
      <div className="absolute top-[-5%] left-[-5%] w-72 h-72 bg-[#aa0000]/5 rounded-full blur-3xl"></div>
      
      <div className="w-20 h-20 bg-[#aa0000] rounded-3xl flex items-center justify-center mb-8 shadow-2xl z-10 animate-pulse border-4 border-white">
        <ShieldCheck size={40} className="text-white" />
      </div>
      
      <div className="bg-white w-full p-8 rounded-[3rem] shadow-2xl z-10 relative border border-white">
        <div className="text-center mb-8 pt-4">
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
            {isRegistering ? 'Novo Membro' : 'ASCA Seleção'}
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">
            {isRegistering ? 'Registo Provisório no Grupo' : 'Acesso ao Painel de Poupança'}
          </p>
        </div>
        
        <form onSubmit={handleAuth} className="space-y-5">
          {isRegistering && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  className="w-full pl-14 pr-5 py-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#aa0000]/10 transition-all"
                  placeholder="Nome do Membro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Email Corporativo</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                className="w-full pl-14 pr-5 py-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#aa0000]/10 transition-all"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Palavra-passe</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                className="w-full pl-14 pr-5 py-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#aa0000]/10 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {isRegistering && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Nível de Acesso</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  onClick={() => setRole('member')} 
                  className={`py-3.5 rounded-2xl text-[10px] font-black uppercase border-2 transition-all ${role === 'member' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-lg' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                >
                  Membro
                </button>
                <button 
                  type="button" 
                  onClick={() => setRole('admin')} 
                  className={`py-3.5 rounded-2xl text-[10px] font-black uppercase border-2 transition-all ${role === 'admin' ? 'bg-[#aa0000] text-white border-[#aa0000] shadow-lg' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                >
                  Admin
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-slide-up ${error.isRateLimit ? 'bg-orange-50 border-orange-100' : 'bg-red-50 border-red-100'}`}>
              {error.isRateLimit ? <Info className="text-orange-500 shrink-0" size={18} /> : <AlertCircle className="text-red-500 shrink-0" size={18} />}
              <p className={`text-[10px] font-bold uppercase leading-tight ${error.isRateLimit ? 'text-orange-700' : 'text-red-600'}`}>
                {error.message}
              </p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex items-start gap-3 animate-slide-up">
              <ShieldCheck className="text-green-500 shrink-0" size={18} />
              <p className="text-green-600 text-[10px] font-bold uppercase leading-tight">{success}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#aa0000] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 mt-4 active:scale-95 transition-all shadow-2xl shadow-[#aa0000]/30 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : (isRegistering ? <UserPlus size={22} /> : <LogIn size={22} />)}
            {isRegistering ? 'Criar Conta' : 'Entrar no Sistema'}
          </button>
        </form>

        <button 
          onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
          className="w-full mt-8 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-[#aa0000] transition-colors py-2"
        >
          {isRegistering ? (
            <span className="flex items-center justify-center gap-2"><ArrowLeft size={12}/> Voltar para o Login</span>
          ) : 'Não tem conta? Registe-se agora'}
        </button>
      </div>
      
      <p className="mt-8 text-[9px] text-gray-300 font-bold uppercase tracking-[0.4em]">
        ASCA Seleção v2.0
      </p>
    </div>
  );
}
