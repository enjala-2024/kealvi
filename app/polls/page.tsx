"use client";



import { getUserId } from "@/lib/getUserId";
import { useState, useEffect } from "react";

export default function PollsPage() {
  const [polls, setPolls] = useState<any[]>([]);
  const [userId, setUserId] = useState("");

useEffect(() => {
  setUserId(getUserId());
}, []);
const [question, setQuestion] = useState("");
const [option1, setOption1] = useState("");
const [option2, setOption2] = useState("");
const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  async function loadPolls() {
    const res = await fetch("/api/polls");
    const data = await res.json();
    setPolls(data.polls || []);
  }

  async function createPoll() {
    if (!question.trim()) return;

    await fetch("/api/polls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  question,
  options: [option1, option2],
  creator_id: getUserId(),
}),
    });

    
    setQuestion("");
setOption1("");
setOption2("");
    loadPolls();
  }
  /*const handleVote = async (optionId: string, pollId: string) => {
  await fetch(`/api/polls/${pollId}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      optionId,
      voterId: getUserId(),
    }),
  });

  loadPolls();
};*/
const handleVote = async (optionId: string, pollId: string) => {
  setUserVotes((prev) => ({
    ...prev,
    [pollId]: optionId,
  }));
await fetch(`/api/polls/${pollId}/vote`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    optionId: optionId,
    userId: getUserId(),
  }),
});
 /* await fetch(`/api/polls/${pollId}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      optionId,
      voterId: getUserId(),
    }),
  });*/

  loadPolls();
};
/*import { supabase } from "@/lib/supabase";*/

/*async function DELETE(
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
}*/
async function deletePoll(id: string) {
  const res = await fetch(`/api/polls/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      creator_id: getUserId(),
    }),
  });

  if (res.ok) {
    setPolls((polls) =>
      polls.filter((p) => p.id !== id)
    );
  }
}
async function loadUserVotes() {
  const voterId = getUserId();

  const res = await fetch(`/api/user-votes?voterId=${voterId}`);
  const data = await res.json();

  // convert to map: { pollId: optionId }
  const map: Record<string, string> = {};

  data.votes.forEach((v: any) => {
    map[v.question_id] = v.option_id;
  });

  setUserVotes(map);
}
  useEffect(() => {
    loadPolls();
    loadUserVotes();
  }, []);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Polls
      </h1>
<a
  href="/"
  className="inline-block mb-4 rounded bg-blue-600 px-4 py-2 text-white"
>
  ← Back to Live Q&A
</a>
      <div className="mb-6 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter poll question"
          className="flex-1 rounded border p-2"
        />
        <input
  value={option1}
  onChange={(e) => setOption1(e.target.value)}
  placeholder="Option 1"
  className="flex-1 rounded border p-2"
/>

<input
  value={option2}
  onChange={(e) => setOption2(e.target.value)}
  placeholder="Option 2"
  className="flex-1 rounded border p-2"
/>

        <button
          onClick={createPoll}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Create Poll
        </button>
      </div>

      <div className="space-y-3">
        {polls.map((poll: any) => (
          <div
            key={poll.id}
            //className="rounded border p-4"
            className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white hover:shadow-md transition"
          >
            <h2 className="font-semibold">
              {poll.question}
            </h2>
            <div className="space-y-2">
               {poll.poll_options?.map((option: any) => {
  const isSelected = userVotes?.[poll.id] === option.id;

  const totalVotes = poll.poll_options.reduce(
    (sum: number, opt: any) => sum + (opt.votes || 0),
    0
  );

  const percent = totalVotes
    ? Math.round((option.votes / totalVotes) * 100)
    : 0;

  return (
    <div
      key={option.id}
      onClick={() => handleVote(option.id, poll.id)}
      className={`relative cursor-pointer overflow-hidden rounded-xl border p-3 transition ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:bg-gray-50"
      }`}
    >
      {/* 🔵 progress background */}
      <div
        className="absolute left-0 top-0 h-full bg-blue-100 transition-all"
        style={{ width: `${percent}%` }}
      />

      {/* content */}
      <div className="relative flex justify-between items-center">
        <div>
          <p className="font-medium">{option.option_text}</p>
          <p className="text-sm text-gray-500">{option.votes} votes</p>
        </div>

        <span className="text-sm font-semibold text-gray-600">
          {percent}%
        </span>
      </div>
    </div>
  );
})}

         </div>
         {poll.creator_id === getUserId() && (
  <button
    onClick={() => deletePoll(poll.id)}
    className="mt-3 text-sm text-red-600 hover:underline"
  >
    🗑 Delete Poll
  </button>
)}

    </div>
  ))}
</div>
    </main>
  );
}    