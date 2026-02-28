import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGameCommentary = async (score: number, result: 'WIN' | 'LOSS'): Promise<string> => {
  try {
    const prompt = `
      You are a high-energy, encouraging game announcer for a "Breakout" style game themed around "Mercuries Life Insurance" (三商美邦人壽).
      
      The player just finished a game.
      Result: ${result}
      Score: ${score}
      
      Generate a very short, punchy message (max 20 words) in Traditional Chinese (Taiwan).
      If they won or scored high, congratulate them and mention "Wealth" or "Protection".
      If they lost, encourage them to "Try again for better coverage" or "Re-evaluate their risk".
      Use emojis.
    `;

    const response = await ai.models.generateContent({
      model: 'gemma-3-27b-it',
      contents: prompt,
    });

    return response.text || "三商美邦人壽，為您加油！💪";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return result === 'WIN' ? "恭喜獲勝！您的未來更有保障了！🎉" : "再接再厲！堅持到底就是勝利！💪";
  }
};
