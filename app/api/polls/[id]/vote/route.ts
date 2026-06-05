/*import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: optionId } = await params;

  const { data, error } = await supabase
    .from("poll_options")
    .select("votes")
    .eq("id", optionId)
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("poll_options")
    .update({
      votes: (data?.votes ?? 0) + 1,
    })
    .eq("id", optionId);

  if (updateError) {
    return Response.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true });
}*/

/*import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: pollId } = await params;

  const { optionId, userId } = await req.json();

  // your vote logic here
}
  // 1. check if user already voted
  const { data: existing } = await supabase
    .from("votes")
    .select("*")
    .eq("poll_id", pollId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    // 2. update vote
    await supabase
      .from("votes")
      .update({ option_id: optionId })
      .eq("poll_id", pollId)
      .eq("user_id", userId);
  } else {
    // 3. insert vote
    await supabase.from("votes").insert([
      {
        poll_id: pollId,
        option_id: optionId,
        user_id: userId,
      },
    ]);
  }

  return Response.json({ success: true });
}*/
/*import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: pollId } = await params;

  const { optionId, userId } = await req.json();

  const { data: existing } = await supabase
    .from("votes")
    .select("*")
    .eq("question_id", pollId)
    .eq("voter_id", userId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("votes")
      .update({ option_id: optionId })
      .eq("question_id", pollId)
      .eq("voter_id", userId);
  } else {
    await supabase.from("votes").insert([
      {
        question_id: pollId,
        voter_id: userId,
        option_id: optionId,
      },
    ]);
  }

  return Response.json({ success: true });
}*/
import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: pollId } = await params;
  const { optionId, userId } = await req.json();

 /* const { data: existing } = await supabase
    .from("votes")
    .select("*")
    .eq("question_id", pollId)
    .eq("voter_id", userId)
    .maybeSingle();*/
    const { data: existing } = await supabase
  .from("poll_votes")
  .select("*")
  .eq("poll_id", pollId)
  .eq("voter_id", userId)
  .maybeSingle();

  if (existing) {
    // User clicked the same option again
    if (existing.option_id === optionId) {
      return Response.json({ success: true });
    }

    // Get old option votes
    const { data: oldOption } = await supabase
      .from("poll_options")
      .select("votes")
      .eq("id", existing.option_id)
      .single();

    // Decrease old option
    await supabase
      .from("poll_options")
      .update({
        votes: Math.max(0, (oldOption?.votes || 0) - 1),
      })
      .eq("id", existing.option_id);

    // Get new option votes
    const { data: newOption } = await supabase
      .from("poll_options")
      .select("votes")
      .eq("id", optionId)
      .single();

    // Increase new option
    await supabase
      .from("poll_options")
      .update({
        votes: (newOption?.votes || 0) + 1,
      })
      .eq("id", optionId);

    // Update stored vote
    await supabase
      .from("poll_votes")
      .update({ option_id: optionId })
      .eq("poll_id", pollId)
      .eq("voter_id", userId);
  } else {
    // First vote

    const { data: option } = await supabase
      .from("poll_options")
      .select("votes")
      .eq("id", optionId)
      .single();

    await supabase
      .from("poll_options")
      .update({
        votes: (option?.votes || 0) + 1,
      })
      .eq("id", optionId);

    /*await supabase.from("votes").insert([
      {
        question_id: pollId,
        voter_id: userId,
        option_id: optionId,
      },
    ]);*/
    const { data, error } = await supabase
      .from("poll_votes")
      .insert([
        {
          poll_id: pollId,
          voter_id: userId,
          option_id: optionId,
        },
      ])
      .select("*");

    console.log("Inserted:", data);
    console.log("Insert Error:", error);
  }

  return Response.json({ success: true });
}