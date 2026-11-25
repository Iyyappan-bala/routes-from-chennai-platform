// Real end-to-end test against the ACTUAL Supabase cloud project (not PGlite).
// Creates one throwaway test user, exercises anon / authenticated-visitor / editor
// permissions over the real REST API, then cleans up everything it created.
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
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const testEmail = `smoke-test-${Date.now()}@example.invalid`;
const testPassword = `Sm0ke-${Math.random().toString(36).slice(2)}!`;

let results = [];
function record(label, pass, detail = "") {
  results.push({ label, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}: ${label}${detail ? " — " + detail : ""}`);
}

async function adminFetch(path, opts = {}) {
  return fetch(`${URL_BASE}${path}`, {
    ...opts,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
}

async function anonFetch(path, opts = {}) {
  return fetch(`${URL_BASE}${path}`, {
    ...opts,
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
}

async function userFetch(path, accessToken, opts = {}) {
  return fetch(`${URL_BASE}${path}`, {
    ...opts,
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
}

let userId, accessToken, regionId, countryId, cityId, draftId, publishedId;

try {
  // 1. Create a real test user via the Auth Admin API (service role)
  const createRes = await adminFetch("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({ email: testEmail, password: testPassword, email_confirm: true }),
  });
  const createBody = await createRes.json();
  userId = createBody.id;
  record("Created real test user via Supabase Auth Admin API", createRes.ok && !!userId, `status ${createRes.status}`);

  // 2. Confirm the handle_new_user() trigger auto-created a profiles row
  const profileCheck = await adminFetch(`/rest/v1/profiles?id=eq.${userId}&select=id,role`);
  const profileRows = await profileCheck.json();
  record(
    "handle_new_user() trigger auto-created a profiles row with role=visitor on the REAL cloud DB",
    profileRows.length === 1 && profileRows[0].role === "visitor",
    JSON.stringify(profileRows)
  );

  // 3. Sign in as the real user to get a real access token
  const signInRes = await fetch(`${URL_BASE}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  const signInBody = await signInRes.json();
  accessToken = signInBody.access_token;
  record("Signed in as the real test user (real Supabase Auth session)", signInRes.ok && !!accessToken);

  // 4. Seed minimal reference + content data as service_role (bypasses RLS, this is setup only)
  const regionRes = await adminFetch("/rest/v1/regions", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ name: "Asia (smoke test)", slug: `asia-smoke-${Date.now()}` }),
  });
  regionId = (await regionRes.json())[0].id;

  const countryRes = await adminFetch("/rest/v1/countries", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ region_id: regionId, name: "India (smoke test)", slug: `india-smoke-${Date.now()}` }),
  });
  countryId = (await countryRes.json())[0].id;

  const cityRes = await adminFetch("/rest/v1/cities", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ country_id: countryId, name: "Chennai (smoke test)", slug: `chennai-smoke-${Date.now()}` }),
  });
  cityId = (await cityRes.json())[0].id;

  const destRes = await adminFetch("/rest/v1/destinations", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify([
      { city_id: cityId, name: "Draft Beach", slug: `draft-beach-${Date.now()}`, status: "draft", created_by: userId },
      { city_id: cityId, name: "Published Beach", slug: `published-beach-${Date.now()}`, status: "published", created_by: userId },
    ]),
  });
  const destRows = await destRes.json();
  draftId = destRows.find((d) => d.status === "draft")?.id;
  publishedId = destRows.find((d) => d.status === "published")?.id;

  // 5. ANONYMOUS: can read published, cannot read draft, cannot write
  const anonRead = await anonFetch(`/rest/v1/destinations?select=name,status&city_id=eq.${cityId}`);
  const anonRows = await anonRead.json();
  record(
    "Anonymous session sees only the published destination, not the draft",
    anonRows.length === 1 && anonRows[0].status === "published",
    JSON.stringify(anonRows)
  );

  const anonWrite = await anonFetch("/rest/v1/destinations", {
    method: "POST",
    body: JSON.stringify({ city_id: cityId, name: "Anon-created", slug: `anon-created-${Date.now()}`, status: "published" }),
  });
  record("Anonymous write attempt is rejected by RLS", !anonWrite.ok, `status ${anonWrite.status}`);

  // 6. AUTHENTICATED VISITOR (real logged-in user, role still 'visitor'): same restrictions
  const visitorRead = await userFetch(`/rest/v1/destinations?select=name,status&city_id=eq.${cityId}`, accessToken);
  const visitorRows = await visitorRead.json();
  record(
    "Authenticated visitor still sees only the published destination, not the draft",
    visitorRows.length === 1 && visitorRows[0].status === "published",
    JSON.stringify(visitorRows)
  );

  const visitorWrite = await userFetch("/rest/v1/destinations", accessToken, {
    method: "POST",
    body: JSON.stringify({ city_id: cityId, name: "Visitor-created", slug: `visitor-created-${Date.now()}`, status: "published" }),
  });
  record("Authenticated visitor write attempt is rejected by RLS", !visitorWrite.ok, `status ${visitorWrite.status}`);

  // 7. Promote this same real user to editor (admin action, via service_role)
  const promoteRes = await adminFetch(`/rest/v1/profiles?id=eq.${userId}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ role: "editor" }),
  });
  const promoted = await promoteRes.json();
  record("Promoted the real user to editor via service_role", promoted[0]?.role === "editor");

  // 8. Same access token, now editor: should see drafts and be able to write
  const editorRead = await userFetch(`/rest/v1/destinations?select=name,status&city_id=eq.${cityId}`, accessToken);
  const editorRows = await editorRead.json();
  record(
    "The SAME session, now promoted to editor, sees both draft and published destinations",
    editorRows.length === 2,
    JSON.stringify(editorRows)
  );

  const editorWrite = await userFetch("/rest/v1/destinations", accessToken, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ city_id: cityId, name: "Editor-created", slug: `editor-created-${Date.now()}`, status: "published" }),
  });
  const editorWriteBody = editorWrite.ok ? await editorWrite.json() : null;
  record("Editor write attempt succeeds", editorWrite.ok, `status ${editorWrite.status}`);
  if (editorWriteBody?.[0]?.id) {
    await adminFetch(`/rest/v1/destinations?id=eq.${editorWriteBody[0].id}`, { method: "DELETE" });
  }
} finally {
  // Cleanup everything created by this test, regardless of pass/fail
  if (cityId) await adminFetch(`/rest/v1/destinations?city_id=eq.${cityId}`, { method: "DELETE" });
  if (cityId) await adminFetch(`/rest/v1/cities?id=eq.${cityId}`, { method: "DELETE" });
  if (countryId) await adminFetch(`/rest/v1/countries?id=eq.${countryId}`, { method: "DELETE" });
  if (regionId) await adminFetch(`/rest/v1/regions?id=eq.${regionId}`, { method: "DELETE" });
  if (userId) await adminFetch(`/auth/v1/admin/users/${userId}`, { method: "DELETE" });
  console.log("\nCleanup complete — test user and all test rows removed from production DB.");

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} tests passed.`);
  if (failed.length) {
    console.log("FAILED:", failed.map((f) => f.label).join("; "));
    process.exit(1);
  }
}
