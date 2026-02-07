
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Member, Saving, Loan } from "../types.ts";

export const analyzeMemberPerformance = async (
  member: Member,
  savings: Saving[],
  loans: Loan[],
  settings: any
) => {
  // Always use standard initialization pattern as per Google GenAI guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analise o desempenho financeiro deste membro do grupo de poupança ASCA Seleção:
    Membro: ${member.name}
    Total Poupado: ${member.totalSavings} MT
    Total de Empréstimos Tomados (Movimentação): ${member.totalLoansTaken} MT
    Meta de Movimentação para Juros: ${settings.minMovementForInterest} MT
    Configurações: Rendimento fixo de ${settings.fixedInterestReturn} MT se atingir a meta.
    
    Histórico de Poupança: ${JSON.stringify(savings.map(s => ({ data: s.date, valor: s.amount })))}
    Histórico de Empréstimos: ${JSON.stringify(loans.map(l => ({ valor: l.amount, status: l.status })))}

    Forneça uma análise curta e motivacional (máximo 3 parágrafos) em Português:
    1. Se ele está no caminho certo para a meta de 50k MT.
    2. O lucro esperado no final do ciclo.
    3. Uma dica financeira para otimizar os ganhos.
  `;

  try {
    // Correctly call generateContent with model and prompt as a direct parameter object.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    // Access text as a property directly.
    return response.text;
  } catch (error) {
    console.error("Erro na análise Gemini:", error);
    return "Não foi possível gerar a análise no momento. Verifique sua conexão.";
  }
};
