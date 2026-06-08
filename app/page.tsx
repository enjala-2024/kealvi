import QuestionsList from "./questions-list";
import { getQuestionsPage } from "@/lib/questions";

// Render on every request (don't cache/prerender) so new questions show up.
export const dynamic = "force-dynamic";
/*const [userId, setUserId] = useState("");

useEffect(() => {
  setUserId(getUserId());
}, []);*/
const PAGE_SIZE = 10;

// Server component — runs only on the server, awaits the data, renders to HTML.
export default async function Page() {
  const { questions, hasMore } = await getQuestionsPage(0, PAGE_SIZE);

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-10 sm:py-14">
      <header className="mb-7">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          Live now
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Live Q&amp;A</h1>
        <p className="mt-1.5 text-sm text-muted">
          Ask a question, upvote the ones you want answered.
        </p>
      </header>
      <QuestionsList
        initialQuestions={questions.map((q: any) => ({
          ...q,
          // ensure Question.creator_id exists (use author.id if available)
          creator_id: q.creator_id ?? q.author?.id ?? "",
        }))}
        initialHasMore={hasMore}
      />
      <div className="mt-8">
  <a
    href="/polls"
    className="rounded-xl bg-brand px-4 py-2 text-white"
  >
    Open Polls
  </a>
</div>
    </main>
  );
}
