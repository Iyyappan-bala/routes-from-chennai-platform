"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

type Row = { id: string; name?: string; title?: string; status: string };

export default function AdminDashboardPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [destinations, setDestinations] = useState<Row[]>([]);
  const [stories, setStories] = useState<Row[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function loadData() {
    const supabase = getSupabaseBrowser();
    const { data: dests } = await supabase
      .from("destinations")
      .select("id,name,status")
      .order("name");
    const { data: stors } = await supabase
      .from("stories")
      .select("id,title,status")
      .order("title");
    setDestinations((dests ?? []) as Row[]);
    setStories((stors ?? []) as Row[]);
  }

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push("/admin/login");
        return;
      }
      setEmail(session.user.email ?? null);
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();
      const r = (profile as { role?: string } | null)?.role ?? "visitor";
      setRole(r);
      if (r !== "editor" && r !== "admin") {
        setChecking(false);
        return;
      }
      await loadData();
      setChecking(false);
    });
  }, [router]);

  async function togglePublish(table: "destinations" | "stories", id: string, current: string) {
    const supabase = getSupabaseBrowser();
    const next = current === "published" ? "draft" : "published";
    const { error } = await supabase
      .from(table)
      .update({ status: next } as never)
      .eq("id", id);
    if (error) {
      setMessage(`Update rejected: ${error.message}`);
      return;
    }
    setMessage(`Updated — ${next}`);
    await loadData();
  }

  async function signOut() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  if (checking) {
    return <p className="mx-auto max-w-4xl px-6 py-12">Checking session&hellip;</p>;
  }

  if (role !== "editor" && role !== "admin") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-3xl text-[color:var(--color-navy)]">Not authorized</h1>
        <p className="mt-4 opacity-80">
          Signed in as {email}, role: <strong>{role ?? "unknown"}</strong>. This account does not
          have editor or admin access. RLS on the database independently enforces this — this page
          is a convenience message, not the actual security boundary.
        </p>
        <button onClick={signOut} className="mt-4 rounded border px-4 py-2 text-sm">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl text-[color:var(--color-navy)]">Admin Dashboard</h1>
        <button onClick={signOut} className="rounded border px-4 py-2 text-sm">
          Sign out
        </button>
      </div>
      <p className="mt-1 opacity-70">
        Signed in as {email} — role: {role}
      </p>
      {message && <p className="mt-3 rounded bg-[color:var(--color-sandstone)] p-3 text-sm">{message}</p>}

      <section className="mt-8">
        <h2 className="text-xl text-[color:var(--color-navy)]">Destinations</h2>
        <table className="mt-3 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[color:var(--color-sandstone)] text-left">
              <th className="py-2">Name</th>
              <th className="py-2">Status</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {destinations.map((d) => (
              <tr key={d.id} className="border-b border-[color:var(--color-sandstone)]">
                <td className="py-2">{d.name}</td>
                <td className="py-2">{d.status}</td>
                <td className="py-2">
                  <button
                    onClick={() => togglePublish("destinations", d.id, d.status)}
                    className="rounded border px-3 py-1"
                  >
                    {d.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8">
        <h2 className="text-xl text-[color:var(--color-navy)]">Travel Stories</h2>
        <table className="mt-3 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[color:var(--color-sandstone)] text-left">
              <th className="py-2">Title</th>
              <th className="py-2">Status</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {stories.map((s) => (
              <tr key={s.id} className="border-b border-[color:var(--color-sandstone)]">
                <td className="py-2">{s.title}</td>
                <td className="py-2">{s.status}</td>
                <td className="py-2">
                  <button
                    onClick={() => togglePublish("stories", s.id, s.status)}
                    className="rounded border px-3 py-1"
                  >
                    {s.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
