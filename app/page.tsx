import Link from "next/link";
import Image from "next/image";
import { getSupabase } from "@/lib/supabase";
import { getDestinationImage } from "@/lib/destination-images";

export const instant = false;

export default async function HomePage() {
  const supabase = getSupabase();

  const { data: destinations } = await supabase
    .from("destinations")
    .select("id,name,slug,description,cities(name,countries(name))")
    .eq("status", "published")
    .limit(3);

  const { data: stories } = await supabase
    .from("stories")
    .select("id,title,slug,body")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(3);

  const { data: regions } = await supabase
    .from("regions")
    .select("id,name,slug")
    .order("name");

  return (
    <div>
      <section className="border-b border-[color:var(--color-sandstone)] px-6 py-20 text-center">
        {getDestinationImage("marina-beach") && (
          <Image
            src={getDestinationImage("marina-beach")!.src}
            alt="Marina Beach along Chennai's Bay of Bengal coastline"
            width={getDestinationImage("marina-beach")!.width}
            height={getDestinationImage("marina-beach")!.height}
            priority
            className="mx-auto mb-8 aspect-[16/7] w-full max-w-5xl rounded-lg object-cover"
          />
        )}
        <p className="m-0 mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-terracotta)]">
          A Travel Discovery &amp; Editorial Platform
        </p>
        <h1 className="mx-auto max-w-3xl font-[family-name:var(--font-display)] text-5xl font-semibold text-[color:var(--color-navy)]">
          Routes From Chennai
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg opacity-80">
          Discover destinations, explore heritage, and read travel stories — beginning with the
          coastline of Chennai, the temple city of Madurai, and the Chola heritage of Thanjavur.
        </p>
        <Link
          href="/destinations"
          className="mt-6 inline-block rounded-full bg-[color:var(--color-navy)] px-6 py-3 text-sm font-semibold !text-[color:var(--color-ivory)] no-underline"
        >
          Explore destinations
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl text-[color:var(--color-navy)]">Featured Destinations</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {(destinations ?? []).map((d) => (
            <Link
              key={d.id}
              href={`/destinations/detail/${d.slug}`}
              className="block rounded-lg border border-[color:var(--color-sandstone)] bg-white p-6 no-underline transition-transform hover:-translate-y-1"
            >
              {getDestinationImage(d.slug) && (
                <Image
                  src={getDestinationImage(d.slug)!.src}
                  alt={getDestinationImage(d.slug)!.alt}
                  width={getDestinationImage(d.slug)!.width}
                  height={getDestinationImage(d.slug)!.height}
                  className="mb-5 aspect-[16/9] w-full rounded-md object-cover"
                />
              )}
              <h3 className="text-xl text-[color:var(--color-navy)]">{d.name}</h3>
              <p className="text-sm opacity-70">
                {(d.cities as unknown as { name: string; countries: { name: string } } | null)?.name}
                {", "}
                {(d.cities as unknown as { countries: { name: string } } | null)?.countries?.name}
              </p>
              <p className="mt-2 text-sm text-[color:var(--color-navy)] opacity-80 line-clamp-3">
                {d.description}
              </p>
            </Link>
          ))}
          {(!destinations || destinations.length === 0) && (
            <p className="opacity-70">No published destinations yet.</p>
          )}
        </div>
      </section>

      <section className="border-y border-[color:var(--color-sandstone)] bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl text-[color:var(--color-navy)]">Explore by Region</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {(regions ?? []).map((r) => (
              <Link
                key={r.id}
                href={`/destinations?region=${r.slug}`}
                className="rounded-full bg-[color:var(--color-sandstone)] px-4 py-2 text-sm !text-[color:var(--color-navy)] no-underline hover:bg-[color:var(--color-terracotta)] hover:!text-white"
              >
                {r.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl text-[color:var(--color-navy)]">Trending Travel Stories</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {(stories ?? []).map((s) => (
            <Link
              key={s.id}
              href={`/stories/${s.slug}`}
              className="block rounded-lg border border-[color:var(--color-sandstone)] bg-white p-6 no-underline"
            >
              <h3 className="text-xl text-[color:var(--color-navy)]">{s.title}</h3>
              <p className="mt-2 text-sm opacity-80 line-clamp-3">{s.body}</p>
            </Link>
          ))}
          {(!stories || stories.length === 0) && (
            <p className="opacity-70">No published stories yet.</p>
          )}
        </div>
      </section>

      <section className="border-t border-[color:var(--color-sandstone)] bg-[color:var(--color-ivory-dim)] px-6 py-16 text-center">
        <h2 className="text-2xl text-[color:var(--color-navy)]">Stay Updated</h2>
        <p className="mx-auto mt-2 max-w-md opacity-80">
          A newsletter is planned for a future release. This preview does not collect or store any
          email address yet.
        </p>
        <form className="mx-auto mt-4 flex max-w-sm gap-2">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            disabled
            placeholder="Newsletter signup coming soon"
            className="flex-1 rounded border border-[color:var(--color-sandstone)] bg-white px-3 py-2 text-sm disabled:opacity-60"
          />
          <button
            type="submit"
            disabled
            className="rounded bg-[color:var(--color-navy)] px-4 py-2 text-sm font-semibold text-[color:var(--color-ivory)] disabled:opacity-60"
          >
            Notify me
          </button>
        </form>
      </section>
    </div>
  );
}
