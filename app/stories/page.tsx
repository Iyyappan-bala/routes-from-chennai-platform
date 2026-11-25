import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import Image from "next/image";
import { getDestinationImage } from "@/lib/destination-images";

export const instant = false;

type SearchParams = Promise<{ q?: string }>;

export const metadata = { title: "Travel Stories" };

export default async function StoriesPage({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams;
  const supabase = getSupabase();

  let query = supabase
    .from("stories")
    .select("id,title,slug,body,published_at,destination_stories(destinations(name,slug))")
    .eq("status", "published");

  if (q) query = query.ilike("title", `%${q}%`);

  const { data: stories, error } = await query.order("published_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl text-[color:var(--color-navy)]">Travel Stories</h1>
      <p className="mt-2 opacity-80">Editorial stories from the Routes From Chennai journey.</p>

      <form method="get" className="mt-6 flex gap-2">
        <label htmlFor="story-q" className="sr-only">
          Search stories
        </label>
        <input
          id="story-q"
          name="q"
          type="text"
          defaultValue={q ?? ""}
          placeholder="Search stories by title"
          className="flex-1 rounded border border-[color:var(--color-sandstone)] px-3 py-2"
        />
        <button
          type="submit"
          className="rounded bg-[color:var(--color-navy)] px-5 py-2 text-sm font-semibold text-[color:var(--color-ivory)]"
        >
          Search
        </button>
      </form>

      {error && (
        <p className="mt-8 rounded border border-red-300 bg-red-50 p-4 text-red-700">
          Could not load travel stories right now.
        </p>
      )}

      <div className="mt-8 flex flex-col gap-6">
        {(stories ?? []).map((s) => (
          <Link
            key={s.id}
            href={`/stories/${s.slug}`}
            className="block rounded-lg border border-[color:var(--color-sandstone)] bg-white p-6 no-underline"
          >
            {(() => {
              const firstDestination = (s.destination_stories as { destinations: { name: string; slug: string }[] }[] | null)
                ?.flatMap((link) => link.destinations ?? [])
                .at(0);
              const image = firstDestination ? getDestinationImage(firstDestination.slug) : null;
              return image ? (
                <Image
                  src={image.src}
                  alt={`${image.alt} — featured in this travel story`}
                  width={image.width}
                  height={image.height}
                  className="mb-5 aspect-[16/9] w-full rounded-md object-cover"
                />
              ) : null;
            })()}
            <h2 className="text-2xl text-[color:var(--color-navy)]">{s.title}</h2>
            <p className="mt-2 opacity-80">{s.body.slice(0, 220)}&hellip;</p>
          </Link>
        ))}
      </div>

      {!error && (!stories || stories.length === 0) && (
        <p className="mt-10 rounded border border-[color:var(--color-sandstone)] bg-white p-8 text-center opacity-70">
          No stories match this search yet.
        </p>
      )}
    </div>
  );
}
