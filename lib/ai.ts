import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function normalizeQuestion(question: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
Convert this question into a standard, clear Q&A format.

Examples:
"how to redeploy"
→ "How do I redeploy an application?"

"how can we redeploy"
→ "How do I redeploy an application?"

Return ONLY the normalized question.

Question:
${question}
`,
    });

    return response.text?.trim() || question;
  } catch {
    return question;
  }
}