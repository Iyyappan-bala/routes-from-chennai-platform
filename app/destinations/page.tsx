import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import Image from "next/image";
import { getDestinationImage } from "@/lib/destination-images";

export const instant = false;

type SearchParams = Promise<{ region?: string; q?: string; category?: string }>;

export default async function DestinationsPage({ searchParams }: { searchParams: SearchParams }) {
  const { region, q, category } = await searchParams;
  const supabase = getSupabase();

  const { data: regions } = await supabase.from("regions").select("id,name,slug").order("name");
  const { data: categories } = await supabase.from("categories").select("id,name,slug").order("name");

  let query = supabase
    .from("destinations")
    .select(
      "id,name,slug,description,cities(name,countries(name,regions(slug))),destination_categories(categories(slug,name))"
    )
    .eq("status", "published");

  if (q) query = query.ilike("name", `%${q}%`);

  const { data: rawDestinations, error } = await query.order("name");

  type DestRow = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    cities: { name: string; countries: { name: string; regions: { slug: string } } } | null;
    destination_categories: { categories: { slug: string; name: string } }[];
  };

  let destinations = (rawDestinations ?? []) as unknown as DestRow[];

  if (region) {
    destinations = destinations.filter((d) => d.cities?.countries?.regions?.slug === region);
  }
  if (category) {
    destinations = destinations.filter((d) =>
      d.destination_categories?.some((dc) => dc.categories.slug === category)
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-4xl text-[color:var(--color-navy)]">Destination Explorer</h1>
      <p className="mt-2 max-w-2xl opacity-80">
        Browse published destinations. Filter by region or category, or search by name.
      </p>

      <form method="get" className="mt-8 flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="q" className="block text-sm font-semibold">
            Search
          </label>
          <input
            id="q"
            name="q"
            type="text"
            defaultValue={q ?? ""}
            placeholder="Destination name"
            className="mt-1 rounded border border-[color:var(--color-sandstone)] px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="region" className="block text-sm font-semibold">
            Region
          </label>
          <select
            id="region"
            name="region"
            defaultValue={region ?? ""}
            className="mt-1 rounded border border-[color:var(--color-sandstone)] px-3 py-2"
          >
            <option value="">All regions</option>
            {(regions ?? []).map((r) => (
              <option key={r.id} value={r.slug}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-semibold">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={category ?? ""}
            className="mt-1 rounded border border-[color:var(--color-sandstone)] px-3 py-2"
          >
            <option value="">All categories</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded bg-[color:var(--color-navy)] px-5 py-2 text-sm font-semibold text-[color:var(--color-ivory)]"
        >
          Apply filters
        </button>
      </form>

      {error && (
        <p className="mt-8 rounded border border-red-300 bg-red-50 p-4 text-red-700">
          Could not load destinations right now. Please try again shortly.
        </p>
      )}

      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {destinations.map((d) => (
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
            <h2 className="text-xl text-[color:var(--color-navy)]">{d.name}</h2>
            <p className="text-sm opacity-70">
              {d.cities?.name}, {d.cities?.countries?.name}
            </p>
            <p className="mt-2 text-sm opacity-80 line-clamp-3">{d.description}</p>
          </Link>
        ))}
      </div>

      {!error && destinations.length === 0 && (
        <p className="mt-10 rounded border border-[color:var(--color-sandstone)] bg-white p-8 text-center opacity-70">
          No destinations match these filters yet.
        </p>
      )}
    </div>
  );
}
