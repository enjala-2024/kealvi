import { supabase } from "@/lib/supabase";
import { getPolls } from "@/lib/polls";

export async function GET() {
  try {
    const polls = await getPolls();
    return Response.json({ polls });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

//export async function POST(req: Request) {
  //const { question } = await req.json();

  //const { data, error } = await supabase
    //*/.from("polls")
    //.insert({ question })
    //.select()
    //.single();

  //if (error) {
    //return Response.json({ error: error.message }, { status: 500 });
  //}

  //return Response.json(data);
export async function POST(req: Request) {
  const { question, options } = await req.json();

  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .insert({ question })
    .select()
    .single();

  if (pollError) {
    return Response.json(
      { error: pollError.message },
      { status: 500 }
    );
  }

  const optionRows = options
    .filter((opt: string) => opt.trim())
    .map((opt: string) => ({
      poll_id: poll.id,
      option_text: opt,
    }));

  const { error: optionError } = await supabase
    .from("poll_options")
    .insert(optionRows);

  if (optionError) {
    return Response.json(
      { error: optionError.message },
      { status: 500 }
    );
  }

  return Response.json(poll);
}