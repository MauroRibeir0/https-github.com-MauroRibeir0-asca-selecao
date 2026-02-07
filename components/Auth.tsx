
import React, { useState } from 'react';
import { supabase } from '../lib/supabase.ts';
import { ShieldCheck, Mail, Lock, Loader2, LogIn, KeyRound } from 'lucide-react';

export default function Auth({ onLogin }: { onLogin: () => void }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Credenciais inválidas. Verifique o seu email e palavra-passe.");
      setLoading(false);
    } else {
      onLogin();
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Por favor, introduza o seu email primeiro.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setError(error.message);
    } else {
      setMessage("Instruções de recuperação enviadas para o seu email.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center p-6 max-w-md mx-auto">
      <div className="w-20 h-20 bg-[#aa0000] rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-[#aa0000]/20 animate-bounce">
        <ShieldCheck size={40} className="text-white" />
      </div>
      
      <div className="bg-white w-full p-8 rounded-[2.5rem] shadow-xl border border-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-[#aa0000]/5 rounded-bl-full"></div>
        
        <h2 className="text-2xl font-bold text-center mb-2">Bem-vindo</h2>
        <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest mb-8">
          Acesso Restrito ASCA Seleção
        </p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Email Corporativo</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#aa0000]/20 border-none font-medium transition-all"
                placeholder="exemplo@ribeiro.lda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Palavra-passe</label>
              <button 
                type="button"
                onClick={handleResetPassword}
                className="text-[9px] font-bold text-[#aa0000] uppercase tracking-tighter hover:underline px-2"
              >
                Esqueceu sua senha?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#aa0000]/20 border-none font-medium transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 p-3 rounded-xl border border-red-100">
              <p className="text-red-500 text-[10px] font-bold text-center">{error}</p>
            </div>
          )}

          {message && (
            <div className="bg-green-50 p-3 rounded-xl border border-green-100">
              <p className="text-green-600 text-[10px] font-bold text-center">{message}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#aa0000] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mt-4 active:scale-95 transition-transform disabled:opacity-50 shadow-lg shadow-[#aa0000]/20"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Entrar no Sistema
                <LogIn size={18} />
              </>
            )}
          </button>
        </form>
      </div>
      
      <div className="mt-8 flex flex-col items-center gap-1">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">&copy; 2025 ASCA Seleção - Ribeiro, Lda.</p>
        <div className="w-12 h-1 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
}
