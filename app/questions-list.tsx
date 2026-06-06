"use client";

import { getVoterId } from "@/lib/voter";
import { useState, useEffect, useRef } from "react";
type Question = {
  id: string;
  body: string;
  author: string | null;
  votes: number;
  created_at: string;
   attachment_url?: string | null;
};

export default function QuestionsList({
  initialQuestions,
  initialHasMore,
}: {
  initialQuestions: Question[];
  initialHasMore: boolean;
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
const [sortBy, setSortBy] = useState("top");
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // Debounced search: wait 300ms after typing stops; each keystroke cancels
  // the previous timer, so "deploying" fires one request, not nine.
  useEffect(() => {
    const id = setTimeout(async () => {
      const url = query
        ? `/api/questions?q=${encodeURIComponent(query)}`
        : `/api/questions`;
      const res = await fetch(url);
      const data = await res.json();
      setQuestions(data.questions);
      setHasMore(data.hasMore);
    }, 300);

    return () => clearTimeout(id); // cancel the pending timer on each keystroke
  }, [query]);

  async function submit() {
    if (!draft.trim()) return;
   /* let attachmentUrl = null;

if (file) {
  const filename = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("question-attachments")
    .upload(filename, file);

  if (!error) {
    const { data } = supabase.storage
      .from("question-attachments")
      .getPublicUrl(filename);

    attachmentUrl = data.publicUrl;
  }
}*/
let attachmentUrl = null;

if (file) {
  const formData = new FormData();

  formData.append("file", file);

  const uploadRes = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (uploadRes.ok) {
    const uploaded = await uploadRes.json();
    attachmentUrl = uploaded.url;
  }
}
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      
      body: JSON.stringify({
  body: draft,
  author: "Anonymous",
  attachment_url: attachmentUrl,
}),
    });
    //const created = await res.json();
    const text = await res.text();
console.log("API RESPONSE:", text);

if (!res.ok) {
  alert(text);
  return;
}

const created = JSON.parse(text);

    setQuestions((qs) => [{ ...created, votes: 0 }, ...qs]);
    setDraft("");
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function upvote(id: string) {
    // optimistic: assume success, update the UI now
    /*setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...q, votes: q.votes + 1 } : q))
    );*/
    setQuestions((qs) =>
  qs
    .map((q) =>
      q.id === id ? { ...q, votes: q.votes + 1 } : q
    )
    .sort((a, b) => b.votes - a.votes)
);

    const res = await fetch(`/api/questions/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voterId: getVoterId() }),
    });

    // server said no (already voted) — roll back
    if (!res.ok) {
      setQuestions((qs) =>
        qs.map((q) => (q.id === id ? { ...q, votes: q.votes - 1 } : q))
      );
    }
  }
  async function downvote(id: string) {
  setQuestions((qs) =>
    qs
      .map((q) =>
        q.id === id
          ? { ...q, votes: Math.max(0, q.votes - 1) }
          : q
      )
      .sort((a, b) => b.votes - a.votes)
  );

  const res = await fetch(`/api/questions/${id}/unvote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      voterId: getVoterId(),
    }),
  });

  if (!res.ok) {
    location.reload();
  }
}

  async function loadMore() {
    setLoading(true);
    const res = await fetch(`/api/questions?offset=${questions.length}`);
    const data = await res.json();
    setQuestions((qs) => [...qs, ...data.questions]);
    setHasMore(data.hasMore);
    setLoading(false);
  }
console.log(questions);
const sortedQuestions = [...questions].sort((a, b) => {
  if (sortBy === "top") {
    return b.votes - a.votes;
  }

  return (
    new Date(b.created_at).getTime() -
    new Date(a.created_at).getTime()
  );
});
  return (
    <div className="space-y-5">
      {/* Ask box */}
      <div className="rounded-2xl border bg-surface p-4 shadow-sm">
        <div className="flex gap-2">
          {/*<input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            <input
              type="file"
                   onChange={(e) => setFile(e.target.files?.[0] || null)}
                   className="text-sm"
                      />
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Ask a question…"
            className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm outline-none placeholder:text-muted focus:border-brand"
          />*/}
          <div className="flex flex-col gap-2 flex-1">
  <input
    value={draft}
    onChange={(e) => setDraft(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && submit()}
    placeholder="Ask a question…"
    className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm outline-none placeholder:text-muted focus:border-brand"
  />
{/*<input
    type="file"
    accept="image/*,.pdf"
    onChange={(e) => setFile(e.target.files?.[0] || null)}
    className="text-sm"
  />*/}
  {/*<input
    type="file"
    onChange={(e) => setFile(e.target.files?.[0] || null)}
    className="text-sm"
  />*/}
  <div>
  <label
    htmlFor="file-upload"
    className="inline-block cursor-pointer rounded-xl border px-4 py-2 text-sm hover:bg-gray-100"
  >
    📎 Attach File
  </label>

  <input
  ref={fileInputRef}
    id="file-upload"
    type="file"
    accept="image/*,.pdf"
    onChange={(e) => setFile(e.target.files?.[0] || null)}
     className="hidden"
  />

  {file && (
    <p className="mt-1 text-xs text-muted">
      Selected: {file.name}
    </p>
  )}
</div>
</div>
          <button
            onClick={submit}
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
          >
            Ask
          </button>
        </div>
      </div>

      {/* Search + hydration status */}
      {/* <div className="flex items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions…"*/}
          <div className="flex items-center gap-3">
  <input
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Search questions…"
    className="w-full flex-1 rounded-xl border bg-surface px-4 py-2.5 text-sm outline-none placeholder:text-muted focus:border-brand"
  />

  <select
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
    className="rounded-xl border bg-surface px-3 py-2 text-sm"
  >
    <option value="top">🔥 Top Questions</option>
    <option value="newest">🕒 Newest</option>
  </select>

  <span className="shrink-0 text-xs text-muted">
    {hydrated ? "Interactive ✓" : "Loading interactivity…"}
  </span>
</div>
         {/* className="w-full flex-1 rounded-xl border bg-surface px-4 py-2.5 text-sm outline-none placeholder:text-muted focus:border-brand"
        />
        <span className="shrink-0 text-xs text-muted">
          {hydrated ? "Interactive ✓" : "Loading interactivity…"}
        </span>
      </div>*/}

      {/* Questions */}
      <ul className="space-y-3">
        {/*questions.map((q) => (*/}
        {sortedQuestions.map((q) => (
          <li
            key={q.id}
            className="flex items-start gap-3 rounded-2xl border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
          >
           {/*} <button
              onClick={() => upvote(q.id)}
              className="flex shrink-0 flex-col items-center gap-0.5 rounded-xl border px-3.5 py-2 text-brand transition-colors hover:border-brand hover:bg-brand-soft"
            >
              <span className="text-xs leading-none">▲</span>
              <span className="text-sm font-semibold leading-none tabular-nums">
                {q.votes}
              </span>
            </button>*/}
            <div className="flex shrink-0 flex-col items-center gap-1 rounded-xl border px-3 py-2">
  <button
    onClick={() => upvote(q.id)}
    className="text-brand hover:scale-110"
  >
    ▲
  </button>

  <span className="text-sm font-semibold tabular-nums">
    {q.votes}
  </span>

  <button
    onClick={() => downvote(q.id)}
    className="text-brand hover:scale-110"
  >
    ▼
  </button>
</div>
            <div className="min-w-0 flex-1 pt-0.5">
             {/* <p className="leading-snug">{q.body}</p>
              q.attachment_url && (
  <a
    href={q.attachment_url}
    target="_blank"
    rel="noopener noreferrer"
    className="mt-2 block text-sm text-blue-600 underline"
  >
    View Attachment
  </a>
)}*/}
<p className="leading-snug">{q.body}</p>

{q.attachment_url && (
  <>
    {q.attachment_url.toLowerCase().includes(".pdf") ? (
      <a
        href={q.attachment_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block text-blue-600 underline"
      >
        📄 View PDF
      </a>
    ) : (
      <img
        src={q.attachment_url}
        alt="attachment"
        className="mt-2 max-h-64 rounded-lg border"
      />
    )}
  </>
)}

{/*{q.author && (
  <p className="mt-1.5 text-xs text-muted">{q.author}</p>
)}*/}

              {q.author && (
                <p className="mt-1.5 text-xs text-muted">{q.author}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {questions.length === 0 && (
        <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted">
          No questions yet — be the first to ask.
        </p>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-xl border bg-surface px-5 py-2.5 text-sm font-medium transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
