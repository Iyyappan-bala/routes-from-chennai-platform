// Seeds real reference data and three destinations with factual, previously-researched
// descriptions (matching the academic project's Routes From Chennai content). No invented
// facts, reviews, or statistics. Uses the service-role key - server-side script only.
import { readFileSync } from "node:fs";

function loadEnv() {
  const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  const map = {};
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    map[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return map;
}

const env = loadEnv();
const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function api(path, opts = {}) {
  const res = await fetch(`${URL_BASE}${path}`, {
    ...opts,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${path} -> ${res.status}: ${body}`);
  }
  return res.json();
}

async function upsert(table, rows, onConflict) {
  return api(`/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(rows),
  });
}

async function main() {
  const regions = await upsert(
    "regions",
    [
      { name: "Asia", slug: "asia" },
      { name: "Europe", slug: "europe" },
      { name: "America", slug: "america" },
      { name: "Africa", slug: "africa" },
    ],
    "slug"
  );
  const regionBySlug = Object.fromEntries(regions.map((r) => [r.slug, r.id]));

  const countries = await upsert(
    "countries",
    [
      { region_id: regionBySlug["asia"], name: "India", slug: "india" },
      { region_id: regionBySlug["asia"], name: "Japan", slug: "japan" },
      { region_id: regionBySlug["asia"], name: "China", slug: "china" },
      { region_id: regionBySlug["europe"], name: "France", slug: "france" },
      { region_id: regionBySlug["europe"], name: "Italy", slug: "italy" },
      { region_id: regionBySlug["europe"], name: "Greece", slug: "greece" },
      { region_id: regionBySlug["america"], name: "USA", slug: "usa" },
      { region_id: regionBySlug["america"], name: "Brazil", slug: "brazil" },
      { region_id: regionBySlug["america"], name: "Canada", slug: "canada" },
      { region_id: regionBySlug["africa"], name: "South Africa", slug: "south-africa" },
      { region_id: regionBySlug["africa"], name: "Egypt", slug: "egypt" },
      { region_id: regionBySlug["africa"], name: "Morocco", slug: "morocco" },
    ],
    "slug"
  );
  const countryBySlug = Object.fromEntries(countries.map((c) => [c.slug, c.id]));

  const cities = await upsert(
    "cities",
    [
      { country_id: countryBySlug["india"], name: "Chennai", slug: "chennai", lat: 13.0827, lng: 80.2707 },
      { country_id: countryBySlug["india"], name: "Madurai", slug: "madurai", lat: 9.9252, lng: 78.1198 },
      { country_id: countryBySlug["india"], name: "Thanjavur", slug: "thanjavur", lat: 10.787, lng: 79.1378 },
      { country_id: countryBySlug["india"], name: "New Delhi", slug: "new-delhi", lat: 28.6139, lng: 77.209 },
      { country_id: countryBySlug["india"], name: "Mumbai", slug: "mumbai", lat: 19.076, lng: 72.8777 },
      { country_id: countryBySlug["india"], name: "Jaipur", slug: "jaipur", lat: 26.9124, lng: 75.7873 },
      { country_id: countryBySlug["japan"], name: "Tokyo", slug: "tokyo", lat: null, lng: null },
      { country_id: countryBySlug["japan"], name: "Kyoto", slug: "kyoto", lat: null, lng: null },
      { country_id: countryBySlug["japan"], name: "Osaka", slug: "osaka", lat: null, lng: null },
      { country_id: countryBySlug["france"], name: "Paris", slug: "paris", lat: null, lng: null },
      { country_id: countryBySlug["italy"], name: "Rome", slug: "rome", lat: null, lng: null },
      { country_id: countryBySlug["greece"], name: "Athens", slug: "athens", lat: null, lng: null },
      { country_id: countryBySlug["usa"], name: "New York City", slug: "new-york-city", lat: null, lng: null },
      { country_id: countryBySlug["brazil"], name: "Rio de Janeiro", slug: "rio-de-janeiro", lat: null, lng: null },
      { country_id: countryBySlug["canada"], name: "Toronto", slug: "toronto", lat: null, lng: null },
      { country_id: countryBySlug["south-africa"], name: "Cape Town", slug: "cape-town", lat: null, lng: null },
      { country_id: countryBySlug["egypt"], name: "Cairo", slug: "cairo", lat: null, lng: null },
      { country_id: countryBySlug["morocco"], name: "Marrakech", slug: "marrakech", lat: null, lng: null },
    ],
    "slug"
  );
  const cityBySlug = Object.fromEntries(cities.map((c) => [c.slug, c.id]));

  const categories = await upsert(
    "categories",
    [
      { name: "Coastal", slug: "coastal" },
      { name: "Heritage Architecture", slug: "heritage-architecture" },
      { name: "Temples", slug: "temples" },
    ],
    "slug"
  );
  const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  const destinations = await upsert(
    "destinations",
    [
      {
        city_id: cityBySlug["chennai"],
        name: "Marina Beach",
        slug: "marina-beach",
        description:
          "Marina Beach runs for several kilometres along Chennai's Bay of Bengal coastline and is one of the longest urban beaches in the world. It functions as a working public space: a promenade for evening walkers, fishing boats drawn up on the sand, and a shoreline that anchors the city's identity as a port and administrative capital of Tamil Nadu.",
        lat: 13.0499,
        lng: 80.2824,
        status: "published",
      },
      {
        city_id: cityBySlug["madurai"],
        name: "Meenakshi Amman Temple",
        slug: "meenakshi-amman-temple",
        description:
          "The Meenakshi Amman Temple is a Dravidian-style temple complex at the historic centre of Madurai, known for its sculpted gopuram towers covered in painted figures. Madurai itself is considered one of the oldest continuously inhabited cities in Tamil Nadu, and the temple remains its civic and religious focal point.",
        lat: 9.9195,
        lng: 78.1193,
        status: "published",
      },
      {
        city_id: cityBySlug["thanjavur"],
        name: "Brihadeeswarar Temple",
        slug: "brihadeeswarar-temple",
        description:
          "Built in the early eleventh century under the Chola dynasty, the Brihadeeswarar Temple is recognised by UNESCO as part of the Great Living Chola Temples World Heritage Site. Its granite vimana tower is one of the tallest of its era, reflecting the engineering and artistic reach of Chola-period South Indian architecture.",
        lat: 10.7828,
        lng: 79.1318,
        status: "published",
      },
    ],
    "slug"
  );
  const destinationBySlug = Object.fromEntries(destinations.map((d) => [d.slug, d.id]));

  await upsert(
    "destination_categories",
    [
      { destination_id: destinationBySlug["marina-beach"], category_id: categoryBySlug["coastal"] },
      { destination_id: destinationBySlug["meenakshi-amman-temple"], category_id: categoryBySlug["temples"] },
      { destination_id: destinationBySlug["meenakshi-amman-temple"], category_id: categoryBySlug["heritage-architecture"] },
      { destination_id: destinationBySlug["brihadeeswarar-temple"], category_id: categoryBySlug["heritage-architecture"] },
    ],
    "destination_id,category_id"
  );

  const stories = await upsert(
    "stories",
    [
      {
        title: "Coast, Temple, Chola Heritage",
        slug: "coast-temple-chola-heritage",
        body:
          "Three stops across Tamil Nadu trace a route from the open coastline of the Bay of Bengal to the carved temple towers of the interior: Chennai's Marina Beach, a working city coastline; Madurai's Meenakshi Amman Temple, a centre of Dravidian temple architecture; and Thanjavur's Brihadeeswarar Temple, an eleventh-century Chola monument recognised by UNESCO.",
        status: "published",
        published_at: new Date().toISOString(),
      },
    ],
    "slug"
  );
  const storyBySlug = Object.fromEntries(stories.map((s) => [s.slug, s.id]));

  await upsert(
    "destination_stories",
    [
      { destination_id: destinationBySlug["marina-beach"], story_id: storyBySlug["coast-temple-chola-heritage"] },
      { destination_id: destinationBySlug["meenakshi-amman-temple"], story_id: storyBySlug["coast-temple-chola-heritage"] },
      { destination_id: destinationBySlug["brihadeeswarar-temple"], story_id: storyBySlug["coast-temple-chola-heritage"] },
    ],
    "destination_id,story_id"
  );

  console.log("Seed complete.");
  console.log("Regions:", regions.length, "Countries:", countries.length, "Cities:", cities.length);
  console.log("Destinations (published):", destinations.length, "Stories:", stories.length);
}

main().catch((err) => {
  console.error("SEED FAILED:", err.message);
  process.exit(1);
});
