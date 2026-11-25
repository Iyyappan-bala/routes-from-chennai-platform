import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";
import { DestinationMap } from "@/components/DestinationMap";
import Image from "next/image";
import { getDestinationImage } from "@/lib/destination-images";

export const instant = false;

type Params = Promise<{ slug: string }>;

async function getDestination(slug: string) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("destinations")
    .select(
      "id,name,slug,description,lat,lng,status,cities(name,countries(name,regions(name,slug))),destination_categories(categories(name,slug))"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data as unknown as {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    lat: number | null;
    lng: number | null;
    cities: { name: string; countries: { name: string; regions: { name: string; slug: string } } } | null;
    destination_categories: { categories: { name: string; slug: string } }[];
  } | null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const destination = await getDestination(slug);
  if (!destination) return { title: "Destination not found" };
  return {
    title: destination.name,
    description: destination.description ?? undefined,
    openGraph: {
      title: destination.name,
      description: destination.description ?? undefined,
      type: "article",
    },
  };
}

export default async function DestinationDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const destination = await getDestination(slug);
  if (!destination) notFound();

  const supabase = getSupabase();
  const { data: related } = await supabase
    .from("destinations")
    .select("id,name,slug")
    .eq("status", "published")
    .neq("id", destination.id)
    .limit(3);

  const { data: relatedStoryLinks } = await supabase
    .from("destination_stories")
    .select("stories(id,title,slug)")
    .eq("destination_id", destination.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: destination.name,
    description: destination.description ?? undefined,
    ...(destination.lat && destination.lng
      ? { geo: { "@type": "GeoCoordinates", latitude: destination.lat, longitude: destination.lng } }
      : {}),
  };
  const destinationImage = getDestinationImage(destination.slug);

  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm opacity-70">
        <Link href="/destinations" className="no-underline">
          Destinations
        </Link>
        {" / "}
        {destination.cities?.countries?.regions?.name}
        {" / "}
        {destination.cities?.countries?.name}
        {" / "}
        {destination.cities?.name}
      </nav>

      <h1 className="mt-4 text-4xl text-[color:var(--color-navy)]">{destination.name}</h1>
      <p className="mt-1 opacity-70">
        {destination.cities?.name}, {destination.cities?.countries?.name}
      </p>

      {destinationImage && (
        <Image
          src={destinationImage.src}
          alt={destinationImage.alt}
          width={destinationImage.width}
          height={destinationImage.height}
          priority
          className="mt-6 aspect-[16/9] w-full rounded-lg object-cover"
        />
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {destination.destination_categories?.map((dc) => (
          <span
            key={dc.categories.slug}
            className="rounded-full bg-[color:var(--color-sandstone)] px-3 py-1 text-xs"
          >
            {dc.categories.name}
          </span>
        ))}
      </div>

      <p className="mt-6 text-lg leading-relaxed">{destination.description}</p>

      {destination.lat && destination.lng && (
        <div className="mt-8">
          <h2 className="text-xl text-[color:var(--color-navy)]">Location</h2>
          <DestinationMap lat={destination.lat} lng={destination.lng} name={destination.name} />
        </div>
      )}

      {relatedStoryLinks && relatedStoryLinks.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl text-[color:var(--color-navy)]">Related Travel Stories</h2>
          <ul className="mt-3 list-disc pl-5">
            {relatedStoryLinks.map((link) => {
              const story = link.stories as unknown as { id: string; title: string; slug: string } | null;
              if (!story) return null;
              return (
                <li key={story.id}>
                  <Link href={`/stories/${story.slug}`}>{story.title}</Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {related && related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl text-[color:var(--color-navy)]">Related Destinations</h2>
          <ul className="mt-3 flex flex-wrap gap-3">
            {related.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/destinations/detail/${r.slug}`}
                  className="rounded-full border border-[color:var(--color-sandstone)] px-4 py-2 text-sm no-underline"
                >
                  {getDestinationImage(r.slug) && (
                    <Image
                      src={getDestinationImage(r.slug)!.src}
                      alt={getDestinationImage(r.slug)!.alt}
                      width={getDestinationImage(r.slug)!.width}
                      height={getDestinationImage(r.slug)!.height}
                      className="mb-2 h-20 w-32 rounded object-cover"
                    />
                  )}
                  {r.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
