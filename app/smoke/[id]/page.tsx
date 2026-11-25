import { connection } from "next/server";

export const instant = false;

export default async function SmokeDynamicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>M0 Smoke Test — Dynamic Route</h1>
      <p>Requested id: {id}</p>
      <p>Server timestamp at render: {new Date().toISOString()}</p>
      <p>
        If this timestamp changes on every reload, SSR is actually executing per-request, not
        serving a cached static page.
      </p>
    </main>
  );
}
