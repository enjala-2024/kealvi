import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return Response.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("question-attachments")
      .upload(fileName, file, {
        upsert: false,
      });

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const { data } = supabase.storage
      .from("question-attachments")
      .getPublicUrl(fileName);

    return Response.json({
      url: data.publicUrl,
    });
  } catch (err) {
    return Response.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}