
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Member, Saving, Loan } from "../types.ts";

export const analyzeMemberPerformance = async (
  member: Member,
  savings: Saving[],
  loans: Loan[],
  settings: any
) => {
  const apiKey = (typeof process !== 'undefined' && process.env.API_KEY) || '';
  if (!apiKey) return "Configuração de IA pendente.";

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Analise o desempenho financeiro deste membro:
    Membro: ${member.name}
    Total Poupado: ${member.totalSavings} MT
    Movimentação: ${member.totalLoansTaken} MT
    Meta: ${settings.minMovementForInterest} MT
    
    Histórico: ${JSON.stringify(savings.map(s => ({ data: s.date, valor: s.amount })))}
    Empréstimos: ${JSON.stringify(loans.map(l => ({ valor: l.amount, status: l.status })))}

    Forneça uma análise motivacional curta (3 parágrafos) em Português sobre o caminho para a meta e o lucro final.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Erro Gemini:", error);
    return "Falha ao gerar análise.";
  }
};
