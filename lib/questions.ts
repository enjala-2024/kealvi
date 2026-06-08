import { supabase } from "@/lib/supabase";

export async function getQuestionsPage(offset: number, limit: number) {
  const { data, error } = await supabase
    .from("questions")
    .select("id, body, author,creator_id, attachment_url, created_at, votes(count)")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit); // inclusive → asks for limit + 1 rows

  if (error) throw new Error(error.message);

  const rows = (data ?? []).map((q) => ({
    id: q.id,
    body: q.body,
    author: q.author,
    attachment_url: q.attachment_url,
    votes: q.votes?.[0]?.count ?? 0,
    created_at: q.created_at,
    creator_id: q.creator_id,
  }));

rows.sort((a, b) => b.votes - a.votes);
  const hasMore = rows.length > limit; // got the extra row? there's a next page
  return { questions: rows.slice(0, limit), hasMore };
}

export async function searchQuestions(q: string, limit: number) {
  const { data, error } = await supabase
    .from("questions")
    .select("id, body, author, creator_id, attachment_url,created_at, votes(count)")
    .textSearch("body", q, { type: "websearch", config: "english" })
    .limit(limit);

  if (error) throw new Error(error.message);

 /* return (data ?? []).map((row) => ({
    id: row.id,
    body: row.body,
    author: row.author,
    votes: row.votes?.[0]?.count ?? 0,
  }));*/
  const rows = (data ?? []).map((row) => ({
  id: row.id,
  body: row.body,
  author: row.author,
  votes: row.votes?.[0]?.count ?? 0,
  created_at: row.created_at,
  attachment_url: row.attachment_url,
  creator_id: row.creator_id,
}));

rows.sort((a, b) => b.votes - a.votes);

return rows;
}
