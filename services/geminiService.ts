
import { GoogleGenAI, Type } from "@google/genai";
import { SentimentAnalysis } from "../types";

export const analyzeSentiment = async (text: string): Promise<SentimentAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the sentiment of this text: "${text}". 
    Provide the result in Arabic. The sentiment should be one of: 'إيجابي' (Positive), 'سلبي' (Negative), or 'محايد' (Neutral).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sentiment: {
            type: Type.STRING,
            description: "The sentiment category in Arabic (إيجابي, سلبي, محايد).",
          },
          confidence: {
            type: Type.NUMBER,
            description: "Confidence score from 0 to 1.",
          },
          emoji: {
            type: Type.STRING,
            description: "A relevant emoji for the sentiment.",
          },
          explanation: {
            type: Type.STRING,
            description: "A brief one-sentence explanation in Arabic.",
          },
        },
        required: ["sentiment", "confidence", "emoji", "explanation"],
      },
    },
  });

  const jsonStr = response.text.trim();
  try {
    return JSON.parse(jsonStr) as SentimentAnalysis;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("تعذر تحليل الرد من الذكاء الاصطناعي.");
  }
};
