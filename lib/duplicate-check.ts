import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function findDuplicate(
  newQuestion: string,
  existingQuestions: string[]
) {
 /* const prompt = `
You are a duplicate question detector.

Existing questions:
${existingQuestions.map((q) => `- ${q}`).join("\n")}

New question:
${newQuestion}

If the new question asks essentially the same thing as one of the existing questions,
return ONLY the matching existing question.

Otherwise return NONE.
`;*/
const prompt = `
You are a duplicate question detector.

Existing questions:
${existingQuestions.map((q) => `- ${q}`).join("\n")}

New question:
${newQuestion}

Determine whether the new question is asking essentially the same thing as ONE of the existing questions.

Examples:

Existing: What is the biggest animal?
New: What is the largest animal?
Result: What is the biggest animal?

Existing: How do I redeploy an application?
New: How can I redeploy my app?
Result: How do I redeploy an application?

If there is a match:
Return ONLY the matching existing question text.

If there is no match:
Return ONLY NONE.

Do not explain your answer.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text?.trim() || "NONE";
}