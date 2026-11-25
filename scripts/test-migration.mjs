// Real local test of 0001_init.sql against an actual Postgres engine (PGlite, WASM, no Docker).
// Stubs Supabase's auth.users/auth.uid() since PGlite isn't a Supabase instance, then runs the
// exact migration file and exercises the RLS policies as different simulated users.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";

const db = new PGlite();
const migration = readFileSync(
  new URL("../supabase/migrations/0001_init.sql", import.meta.url),
  "utf8"
);

function assert(cond, label) {
  if (!cond) throw new Error(`FAIL: ${label}`);
  console.log(`PASS: ${label}`);
}

async function main() {
  // --- Stub Supabase's auth schema (just enough for the migration + RLS to work) ---
  await db.exec(`
    create schema auth;
    create table auth.users (
      id uuid primary key default gen_random_uuid(),
      raw_user_meta_data jsonb default '{}'::jsonb
    );
    create function auth.uid() returns uuid as $$
      select nullif(current_setting('app.current_user_id', true), '')::uuid
    $$ language sql stable;
  `);

  // --- Run the REAL migration file, unmodified ---
  await db.exec(migration);
  console.log("Migration applied without error.\n");

  // --- Create a non-superuser role so RLS actually applies (PGlite's default user bypasses RLS) ---
  await db.exec(`
    create role app_user nologin;
    grant usage on schema public to app_user;
    grant select, insert, update, delete on all tables in schema public to app_user;
    alter table profiles force row level security;
    alter table destinations force row level security;
    alter table stories force row level security;
  `);

  // --- Seed reference + test data as the privileged setup user ---
  const editorId = "11111111-1111-1111-1111-111111111111";
  const visitorId = "22222222-2222-2222-2222-222222222222";
  await db.exec(`
    insert into auth.users (id) values ('${editorId}'), ('${visitorId}');
  `);

  const autoCreatedProfiles = await db.query(
    `select id, role from profiles where id in ('${editorId}', '${visitorId}') order by id`
  );
  assert(
    autoCreatedProfiles.rows.length === 2 &&
      autoCreatedProfiles.rows.every((r) => r.role === "visitor"),
    "handle_new_user() trigger auto-created both profile rows as 'visitor' on auth.users insert"
  );

  await db.exec(`
    update profiles set role = 'editor' where id = '${editorId}';
    insert into regions (name, slug) values ('Asia', 'asia');
    insert into countries (region_id, name, slug)
      select id, 'India', 'india' from regions where slug = 'asia';
    insert into cities (country_id, name, slug)
      select id, 'Chennai', 'chennai' from countries where slug = 'india';
    insert into destinations (city_id, name, slug, status, created_by)
      select id, 'Marina Beach (draft)', 'marina-beach-draft', 'draft', '${editorId}'
      from cities where slug = 'chennai';
    insert into destinations (city_id, name, slug, status, created_by)
      select id, 'Marina Beach (published)', 'marina-beach-published', 'published', '${editorId}'
      from cities where slug = 'chennai';
  `);

  // --- Test as VISITOR (non-editor) ---
  await db.exec(`set role app_user; set app.current_user_id = '${visitorId}';`);

  const visitorSeesPublishedOnly = await db.query(
    `select name, status from destinations order by name`
  );
  assert(
    visitorSeesPublishedOnly.rows.length === 1 &&
      visitorSeesPublishedOnly.rows[0].status === "published",
    "Visitor sees only the published destination, not the draft (RLS SELECT policy)"
  );

  let visitorInsertBlocked = false;
  try {
    await db.query(
      `insert into destinations (city_id, name, slug, status, created_by)
       select id, 'Visitor-created', 'visitor-created', 'published', '${visitorId}' from cities limit 1`
    );
  } catch {
    visitorInsertBlocked = true;
  }
  assert(visitorInsertBlocked, "Visitor cannot INSERT a destination (RLS write policy)");

  let visitorCannotReadOthersProfile = false;
  const otherProfileRead = await db.query(
    `select id from profiles where id = '${editorId}'`
  );
  visitorCannotReadOthersProfile = otherProfileRead.rows.length === 0;
  assert(
    visitorCannotReadOthersProfile,
    "Visitor cannot read another user's profile row (RLS on profiles)"
  );

  // --- Test as EDITOR ---
  await db.exec(`set app.current_user_id = '${editorId}';`);

  const editorSeesBoth = await db.query(`select name from destinations`);
  assert(
    editorSeesBoth.rows.length === 2,
    "Editor sees both draft and published destinations"
  );

  let editorInsertWorked = false;
  try {
    await db.query(
      `insert into destinations (city_id, name, slug, status, created_by)
       select id, 'Editor-created', 'editor-created', 'published', '${editorId}' from cities limit 1`
    );
    editorInsertWorked = true;
  } catch (e) {
    console.error("Editor insert failed unexpectedly:", e.message);
  }
  assert(editorInsertWorked, "Editor CAN insert a destination (RLS allows editor/admin writes)");

  console.log("\nAll migration + RLS tests passed against a real Postgres engine (PGlite).");
}

main().catch((err) => {
  console.error("\nTEST SUITE FAILED:", err.message);
  process.exit(1);
});
