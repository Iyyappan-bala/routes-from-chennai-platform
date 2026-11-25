import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

export const instant = false;
export const metadata = { title: "Search" };

type SearchParams = Promise<{ q?: string }>;

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams;
  const supabase = getSupabase();

  let destinations: { id: string; name: string; slug: string }[] = [];
  let stories: { id: string; title: string; slug: string }[] = [];

  if (q && q.trim().length > 0) {
    const [destRes, storyRes] = await Promise.all([
      supabase
        .from("destinations")
        .select("id,name,slug")
        .eq("status", "published")
        .ilike("name", `%${q}%`),
      supabase
        .from("stories")
        .select("id,title,slug")
        .eq("status", "published")
        .ilike("title", `%${q}%`),
    ]);
    destinations = destRes.data ?? [];
    stories = storyRes.data ?? [];
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-4xl text-[color:var(--color-navy)]">Search</h1>
      <form method="get" className="mt-6 flex gap-2">
        <label htmlFor="search-q" className="sr-only">
          Search destinations and stories
        </label>
        <input
          id="search-q"
          name="q"
          type="text"
          defaultValue={q ?? ""}
          placeholder="Search destinations and stories"
          className="flex-1 rounded border border-[color:var(--color-sandstone)] px-3 py-2"
          autoFocus
        />
        <button
          type="submit"
          className="rounded bg-[color:var(--color-navy)] px-5 py-2 text-sm font-semibold text-[color:var(--color-ivory)]"
        >
          Search
        </button>
      </form>

      {!q && <p className="mt-8 opacity-70">Enter a search term above.</p>}

      {q && (
        <div className="mt-8 space-y-8">
          <div>
            <h2 className="text-xl text-[color:var(--color-navy)]">
              Destinations ({destinations.length})
            </h2>
            {destinations.length === 0 ? (
              <p className="opacity-70">No matching destinations.</p>
            ) : (
              <ul className="mt-2 list-disc pl-5">
                {destinations.map((d) => (
                  <li key={d.id}>
                    <Link href={`/destinations/detail/${d.slug}`}>{d.name}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="text-xl text-[color:var(--color-navy)]">Stories ({stories.length})</h2>
            {stories.length === 0 ? (
              <p className="opacity-70">No matching stories.</p>
            ) : (
              <ul className="mt-2 list-disc pl-5">
                {stories.map((s) => (
                  <li key={s.id}>
                    <Link href={`/stories/${s.slug}`}>{s.title}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
