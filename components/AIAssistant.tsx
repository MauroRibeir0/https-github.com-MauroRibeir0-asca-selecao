
import React, { useState } from 'react';
import { Sparkles, BrainCircuit, Loader2 } from 'lucide-react';
import { Member, Saving, Loan, SystemSettings } from '../types';
import { analyzeMemberPerformance } from '../services/gemini';

interface AIAssistantProps {
  member: Member;
  savings: Saving[];
  loans: Loan[];
  settings: SystemSettings;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ member, savings, loans, settings }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeMemberPerformance(member, savings, loans, settings);
    setAnalysis(result || "Ocorreu um erro ao processar sua solicitação.");
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-[#aa0000]/10 to-white border border-[#aa0000]/20 p-5 rounded-3xl shadow-inner">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-[#aa0000] p-2 rounded-xl text-white">
          <Sparkles size={18} />
        </div>
        <div>
          <h4 className="font-bold text-sm">Assistente Inteligente</h4>
          <p className="text-[10px] text-gray-500">Análise personalizada via IA</p>
        </div>
      </div>

      {!analysis ? (
        <button 
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] text-white py-3 rounded-xl font-bold text-sm active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <BrainCircuit size={18} />
              Gerar Relatório de Desempenho
            </>
          )}
        </button>
      ) : (
        <div className="space-y-4 animate-slide-up">
          <div className="text-sm text-gray-700 leading-relaxed bg-white/50 p-4 rounded-2xl italic">
            "{analysis}"
          </div>
          <button 
            onClick={() => setAnalysis(null)}
            className="text-xs font-bold text-[#aa0000] uppercase tracking-wider underline"
          >
            Refazer Análise
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
