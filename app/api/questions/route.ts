import { supabase } from "@/lib/supabase";
import { getQuestionsPage, searchQuestions } from "@/lib/questions";
import { normalizeQuestion } from "@/lib/ai";
import { findDuplicate } from "@/lib/duplicate-check";
const PAGE_SIZE = 10;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (q) {
    const questions = await searchQuestions(q, PAGE_SIZE);
    return Response.json({ questions, hasMore: false });
  }

  const offset = Number(searchParams.get("offset") ?? 0);
  const { questions, hasMore } = await getQuestionsPage(offset, PAGE_SIZE);
  return Response.json({ questions, hasMore });
}

export async function POST(req: Request) {
  const { body, author,attachment_url } = await req.json();
  const normalizedBody = await normalizeQuestion(body);
  /*const normalizedBody = await normalizeQuestion(body);
const { data: existing } = await supabase
  .from("questions")
  .select("id")
  /*.ilike("body", body.trim())*/
  /*.ilike("body", body.trim().replace(/\s+/g, " "))*/
  /*.ilike("body", normalizedBody)*/
  /*.maybeSingle();

if (existing) {
  return Response.json(
    { error: "This question already exists." },
    { status: 409 }
  );
}*/
const { data: questions } = await supabase
  .from("questions")
  .select("body");
 /* const duplicate = await findDuplicate(
  body,
  (questions ?? []).map((q) => q.body)
);
if (duplicate !== "NONE") {
  return Response.json(
    {
      error: "Similar question already exists.",
      existingQuestion: duplicate,
    },
    { status: 409 }
  );
}*/
let duplicate = "NONE";

try {
  duplicate = await findDuplicate(
    body,
    (questions ?? []).map((q) => q.body)
  );
} catch (err) {
  console.error("Duplicate check failed:", err);

  // IMPORTANT: fallback = allow request
  duplicate = "NONE";
}

if (duplicate !== "NONE") {
  return Response.json(
    {
      error: "Similar question already exists.",
      existingQuestion: duplicate,
    },
    { status: 409 }
  );
}

  const { data, error } = await supabase
    .from("questions")
    .insert({ body: normalizedBody, author , attachment_url,})
    .select()
    .single();

  //if (error) return Response.json({ error: error.message }, { status: 500 });
  ///return Response.json(data);
//}
if (error) {
  console.log("INSERT ERROR:", error);
  return Response.json(
    { error: error.message, details: error },
    { status: 500 }
  );
  
}
return Response.json(data);}