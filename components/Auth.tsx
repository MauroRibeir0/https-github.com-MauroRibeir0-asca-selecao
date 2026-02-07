
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export default function Auth({ onLogin }: { onLogin: () => void }) {
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    if (isRegistering) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setMessage("Conta criada! Verifique o seu email ou tente fazer login.");
        setIsRegistering(false);
        setLoading(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Credenciais inválidas ou conta não confirmada.");
        setLoading(false);
      } else {
        onLogin();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center p-6 max-w-md mx-auto">
      <div className="w-20 h-20 bg-[#aa0000] rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-[#aa0000]/20 animate-bounce">
        <ShieldCheck size={40} className="text-white" />
      </div>
      
      <div className="bg-white w-full p-8 rounded-[2.5rem] shadow-xl border border-white relative overflow-hidden">
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-[#aa0000]/5 rounded-bl-full"></div>
        
        <h2 className="text-2xl font-bold text-center mb-2">
          {isRegistering ? 'Criar Conta' : 'Bem-vindo'}
        </h2>
        <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest mb-8">
          {isRegistering ? 'Registo no Sistema' : 'Acesso ASCA Seleção'}
        </p>
        
        <form onSubmit={handleAuth} className="space-y-4">
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
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Palavra-passe</label>
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
                {isRegistering ? 'Finalizar Registo' : 'Entrar no Sistema'}
                {isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-50 flex flex-col items-center gap-3">
          <button 
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
              setMessage(null);
            }}
            className="text-[10px] font-bold text-[#aa0000] uppercase tracking-wider hover:underline"
          >
            {isRegistering ? 'Já tem conta? Faça Login' : 'Não tem conta? Registe-se aqui'}
          </button>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col items-center gap-1">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">&copy; 2025 ASCA Seleção - Ribeiro, Lda.</p>
        <div className="w-12 h-1 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
}
