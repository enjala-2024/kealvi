import { supabase } from "@/lib/supabase";

export async function getPolls() {
  const { data, error } = await supabase
    .from("polls")
    .select(`
      *,
      poll_options (
        id,
        option_text,
        votes
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data ?? [];
}