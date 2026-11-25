# Codex Rules — Non-Negotiable

These rules apply to all work on this repository, without exception.

1. **Never modify, overwrite, merge, migrate, or redeploy the separate CS2205 academic website.**
   Repo: `https://github.com/Iyyappan-bala/routes-from-chennai`. Deployment:
   `https://routes-from-chennai.pages.dev`. It is a completely independent project in a different
   local directory (`D:\College assignment 2026 Nov\Web Programing 1`). Do not open, edit, commit
   to, or deploy from that directory or repository under any circumstance while working on this one.

2. **Never reset, recreate, or destroy the existing Supabase database.**
   Project `routes-from-chennai` (`rpnaorbfcnnxdbmfchey`) already has real schema and seeded
   content applied. New migrations are additive (new files, e.g. `0003_...sql`) — never edit
   `0001_init.sql` or `0002_grants.sql` after the fact, and never run any destructive reset command
   against the linked remote project.

3. **Never weaken or disable RLS policies to make functionality work.**
   If something is blocked by RLS, the fix is to grant the correct role the correct access via a
   new, scoped policy or a GRANT (as `0002_grants.sql` did) — never to disable RLS on a table or
   write an overly permissive `USING (true)` policy as a shortcut.

4. **Never expose credentials, tokens, or secrets** — not in code, not in commit messages, not in
   chat/output, not in logs.

5. **Never commit `.env` files or credentials.** `.env.local` already exists locally with real
   values and is gitignored — verify `git status` shows it untracked before every commit, don't
   assume.

6. **Never force-push or rewrite Git history.** No `git push --force`, no `git rebase` on pushed
   commits, no `git commit --amend` on anything already pushed to `origin/master`.

7. **Never purchase paid services or create paid subscriptions without explicit approval** from
   the project owner — this includes upgrading Supabase tier, buying a domain, or any paid
   Cloudflare feature.

8. **Preserve existing working functionality.** Every feature listed as "Completed and verified
   working" in `CODEX_HANDOVER.md` must still work after your changes — re-test it, don't assume
   your change was isolated.

9. **Test before committing and deploying.** Run `npm run build` and `npm run build:vinext`
   locally and confirm they succeed before committing. Open the actual running app (dev server or
   `start:vinext` preview) and check the real browser console for errors before calling anything
   done — a successful build is not the same as a working feature.

10. **Make incremental, understandable changes.** Small, reviewable commits with clear messages
    describing what changed and why — not large, unreviewable rewrites.
