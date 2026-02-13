
import { GoogleGenAI, Type } from "@google/genai";
import { SentimentAnalysis, ChatMessage, Attachment } from "../types";

// استدعاء المفاتيح من متغيرات البيئة لضمان الأمان عند النشر
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;
const GEMINI_KEY = process.env.API_KEY;

const SYSTEM_PROMPT = `أنت "خبير المشاعر البصري واللفظي الهجين".
مهمتك:
1. إذا أرسل المستخدم صورة: حلل العناصر البصرية العاطفية (الألوان، التعبيرات، الجو العام) واستخرج أي نصوص بداخلها.
2. إذا أرسل نصاً: حلل المشاعر الكامنة خلف الكلمات.
3. قدم تحليلاً "هجيناً" يجمع بين الرؤية البصرية والتحليل النصي.

دائماً قدم النتيجة بتنسيق JSON إذا كان هناك تحليل مشاعر مطلوب:
{
  "sentiment": "إيجابي" | "سلبي" | "محايد",
  "confidence": number,
  "emoji": string,
  "explanation": "شرح مفصل يدمج الجوانب البصرية والنصية"
}
إذا لم يكن هناك تحليل، أجب بشكل حواري طبيعي.`;

const analyzeWithDeepSeek = async (text: string): Promise<SentimentAnalysis | null> => {
  if (!text || !DEEPSEEK_KEY) return null;
  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: `Analyze sentiment of this text: ${text}. Output JSON with keys: sentiment, confidence, emoji, explanation.` }],
        response_format: { type: "json_object" }
      })
    });
    if (!response.ok) return null;
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("DeepSeek Analysis Error:", error);
    return null;
  }
};

export const sendChatMessage = async (
  userMessage: string, 
  history: ChatMessage[],
  attachment?: Attachment
): Promise<{ text: string; analysis?: SentimentAnalysis }> => {
  // استخدام process.env.API_KEY مباشرة للمصادقة مع Gemini
  const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
  
  const currentParts: any[] = [{ text: userMessage || "حلل هذا المرفق" }];
  if (attachment && attachment.mimeType.startsWith('image/')) {
    currentParts.push({
      inlineData: {
        data: attachment.data,
        mimeType: attachment.mimeType
      }
    });
  }

  const chatContents = history.map(msg => {
    const parts: any[] = [{ text: msg.text + (msg.sentimentResult ? ` [Result: ${JSON.stringify(msg.sentimentResult)}]` : '') }];
    if (msg.attachment && msg.attachment.mimeType.startsWith('image/')) {
      parts.push({
        inlineData: {
          data: msg.attachment.data,
          mimeType: msg.attachment.mimeType
        }
      });
    }
    return {
      role: msg.role === 'user' ? 'user' : 'model',
      parts
    };
  });

  chatContents.push({ role: 'user', parts: currentParts });

  let dsResult = null;
  if (userMessage && DEEPSEEK_KEY) {
    dsResult = await analyzeWithDeepSeek(userMessage);
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: chatContents,
    config: {
      systemInstruction: SYSTEM_PROMPT + (dsResult ? `\nDeepSeek Insight: ${JSON.stringify(dsResult)}` : ""),
    },
  });

  const responseText = response.text;

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]) as SentimentAnalysis;
      return { text: analysis.explanation, analysis };
    }
  } catch (e) {}

  return { text: responseText };
};
