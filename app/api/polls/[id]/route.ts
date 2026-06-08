import { supabase } from "@/lib/supabase";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { creator_id } = await req.json();

  const { data: poll } = await supabase
    .from("polls")
    .select("creator_id")
    .eq("id", id)
    .single();

  if (!poll) {
    return Response.json(
      { error: "Poll not found" },
      { status: 404 }
    );
  }

  if (poll.creator_id !== creator_id) {
    return Response.json(
      { error: "Not allowed" },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from("polls")
    .delete()
    .eq("id", id);

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return Response.json({ success: true });
}