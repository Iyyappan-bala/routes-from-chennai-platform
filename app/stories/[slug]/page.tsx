import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";

export const instant = false;

type Params = Promise<{ slug: string }>;

async function getStory(slug: string) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("stories")
    .select("id,title,slug,body,published_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStory(slug);
  if (!story) return { title: "Story not found" };
  return { title: story.title, description: story.body.slice(0, 160) };
}

export default async function StoryDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const story = await getStory(slug);
  if (!story) notFound();

  const supabase = getSupabase();
  const { data: linkedDestinations } = await supabase
    .from("destination_stories")
    .select("destinations(id,name,slug)")
    .eq("story_id", story.id);

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/stories" className="text-sm no-underline">
        &larr; All stories
      </Link>
      <h1 className="mt-4 text-4xl text-[color:var(--color-navy)]">{story.title}</h1>
      {story.published_at && (
        <p className="mt-1 text-sm opacity-60">
          Published {new Date(story.published_at).toLocaleDateString()}
        </p>
      )}
      <p className="mt-6 text-lg leading-relaxed whitespace-pre-line">{story.body}</p>

      {linkedDestinations && linkedDestinations.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl text-[color:var(--color-navy)]">Destinations in this story</h2>
          <ul className="mt-3 flex flex-wrap gap-3">
            {linkedDestinations.map((link) => {
              const d = link.destinations as unknown as { id: string; name: string; slug: string } | null;
              if (!d) return null;
              return (
                <li key={d.id}>
                  <Link
                    href={`/destinations/detail/${d.slug}`}
                    className="rounded-full border border-[color:var(--color-sandstone)] px-4 py-2 text-sm no-underline"
                  >
                    {d.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </article>
  );
}
