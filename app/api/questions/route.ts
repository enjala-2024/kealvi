import { supabase } from "@/lib/supabase";
import { getQuestionsPage, searchQuestions } from "@/lib/questions";

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
const { data: existing } = await supabase
  .from("questions")
  .select("id")
  /*.ilike("body", body.trim())*/
  .ilike("body", body.trim().replace(/\s+/g, " "))
  .maybeSingle();

if (existing) {
  return Response.json(
    { error: "This question already exists." },
    { status: 409 }
  );
}
  const { data, error } = await supabase
    .from("questions")
    .insert({ body, author , attachment_url,})
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