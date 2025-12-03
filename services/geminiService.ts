import { GoogleGenAI } from "@google/genai";
import { SearchResult, StudioData, GroundingChunk } from "../types";

// Helper to parse the text response into structured-ish data
const parseStudioResponse = (text: string): StudioData[] => {
  // We asked the model to separate entries with ---SEPARATOR---
  const parts = text.split('---SEPARATOR---').map(p => p.trim()).filter(p => p.length > 10);
  
  return parts.map(part => {
    // Simple regex extraction for specific fields if the model followed instructions
    const nameMatch = part.match(/\*\*Nome\*\*:\s*(.+)/) || part.match(/Nome:\s*(.+)/);
    const addressMatch = part.match(/\*\*Endereço\*\*:\s*(.+)/) || part.match(/Endereço:\s*(.+)/);
    const phoneMatch = part.match(/\*\*Telefone\*\*:\s*(.+)/) || part.match(/Telefone:\s*(.+)/);
    const websiteMatch = part.match(/\*\*Website\*\*:\s*(.+)/) || part.match(/Website:\s*(.+)/);
    const instagramMatch = part.match(/\*\*Instagram\*\*:\s*(.+)/) || part.match(/Instagram:\s*(.+)/);
    const facebookMatch = part.match(/\*\*Facebook\*\*:\s*(.+)/) || part.match(/Facebook:\s*(.+)/);
    const descriptionMatch = part.match(/\*\*Descrição\*\*:\s*(.+)/) || part.match(/Descrição:\s*(.+)/);

    return {
      rawText: part,
      parsedName: nameMatch ? nameMatch[1].trim() : undefined,
      parsedAddress: addressMatch ? addressMatch[1].trim() : undefined,
      parsedPhone: phoneMatch ? phoneMatch[1].trim() : undefined,
      parsedWebsite: websiteMatch ? websiteMatch[1].trim() : undefined,
      parsedInstagram: instagramMatch ? instagramMatch[1].trim() : undefined,
      parsedFacebook: facebookMatch ? facebookMatch[1].trim() : undefined,
      parsedDescription: descriptionMatch ? descriptionMatch[1].trim() : undefined,
    };
  });
};

export const searchPilatesStudios = async (city: string): Promise<SearchResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Atue como um pesquisador de dados de mercado avançado.
    Sua missão é criar uma lista EXAUSTIVA (o máximo possível, tente encontrar mais de 20 se existirem) de estúdios de Pilates na cidade de "${city}".

    FONTES DE DADOS:
    1. Utilize o Google Maps para validar endereços.
    2. Utilize o Google Search para encontrar estúdios em listas, portais (como Gympass, ClassPass), diretórios locais e REDES SOCIAIS.
    3. Busque especificamente por perfis de Instagram e páginas de Facebook dos estúdios.

    INSTRUÇÃO DE FORMATAÇÃO CRÍTICA:
    Para cada estúdio encontrado, gere um bloco de texto separado EXATAMENTE pela string "---SEPARATOR---".
    
    Dentro de cada bloco, use estritamente este formato:
    **Nome**: [Nome do Estúdio]
    **Endereço**: [Endereço completo]
    **Telefone**: [Número de telefone]
    **Website**: [URL do site]
    **Instagram**: [URL completa do perfil do Instagram]
    **Facebook**: [URL completa da página do Facebook]
    **Descrição**: [Resumo curto das especialidades, nota média ou diferenciais encontrados]
    
    REGRAS:
    - Se não encontrar um dado (ex: site), escreva "Não disponível".
    - Para Instagram/Facebook, tente encontrar o link direto. Se não achar, "Não disponível".
    - NÃO pare nos primeiros resultados. Cave fundo. Busque estúdios menores, estúdios de bairro, não apenas as grandes redes.
    - Não escreva introduções ou conclusões, apenas a lista bruta separada.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        // Combining Google Maps (for precision) and Google Search (for quantity and social media discovery)
        tools: [
          { googleMaps: {} },
          { googleSearch: {} }
        ],
      },
    });

    const text = response.text || "Nenhum resultado encontrado.";
    
    // Extract grounding chunks to display attribution links
    const groundingChunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as GroundingChunk[];

    const studios = parseStudioResponse(text);

    return {
      studios,
      groundingChunks
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};