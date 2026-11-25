-- Grant standard PostgREST-facing role privileges.
-- RLS policies restrict WHAT each role can see/do; these GRANTs are the separate,
-- lower-level Postgres permission that must also exist for PostgREST to reach the
-- tables at all. Without this, even service_role (which bypasses RLS) gets a
-- "permission denied" error from PostgREST — discovered via real cloud testing,
-- not assumed. Idempotent: safe to re-run.

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated, service_role;
alter default privileges in schema public grant usage, select on sequences to anon, authenticated, service_role;
