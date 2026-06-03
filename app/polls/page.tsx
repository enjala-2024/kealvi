"use client";

import { useState, useEffect } from "react";

export default function PollsPage() {
  const [polls, setPolls] = useState([]);
  
const [question, setQuestion] = useState("");
const [option1, setOption1] = useState("");
const [option2, setOption2] = useState("");
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
}),
    });

    
    setQuestion("");
setOption1("");
setOption2("");
    loadPolls();
  }

  useEffect(() => {
    loadPolls();
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
            className="rounded border p-4"
          >
            <h2 className="font-semibold">
              {poll.question}
            </h2>
            <div className="space-y-2">
  {poll.poll_options?.map((option: any) => (
  <div
    key={option.id}
    className="flex items-center justify-between rounded border p-2"
  >
    <div>
      <p>{option.option_text}</p>
      <p className="text-sm text-gray-500">
        {option.votes} votes
      </p>
    </div>

    <button
      onClick={async () => {
        await fetch(`/api/polls/${option.id}/vote`, {
          method: "POST",
        });

        loadPolls();
      }}
      className="rounded bg-blue-600 px-3 py-1 text-white"
    >
      Vote
    </button>
  </div>
))}
</div>
          </div>
        ))}
      </div>
    </main>
  );
}