import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function normalizeQuestion(question: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro", // better accuracy than flash

      contents: `
You are a strict question normalizer for a Q&A platform.

TASK:
Rewrite the input into a clear, standard English question.

RULES:
- Keep original meaning EXACT
- Do NOT add new information
- Do NOT change intent
- Output ONLY one sentence
- Must be a proper question
- No explanations, no extra text

EXAMPLES:
Input: how to redeploy
Output: How do I redeploy an application?

Input: how can we redeploy
Output: How do I redeploy an application?

Input: ${question}
Output:
      `,
    });

    const text = response.text?.trim();

    // safety fallback
    if (!text || text.length < 3) return question;

    return text;
  } catch (err) {
    console.error("normalizeQuestion error:", err);
    return question;
  }
}