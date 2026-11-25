export function SiteFooter() {
  return (
    <footer className="bg-[color:var(--color-navy)] text-[color:var(--color-sandstone)] py-16 text-center">
      <div className="mx-auto max-w-sm px-6">
        <p className="m-0 mb-2 font-[family-name:var(--font-display)] text-xl text-[color:var(--color-ivory)]">
          Routes From Chennai
        </p>
        <p className="m-0 mb-6 italic">
          Discover destinations. Explore heritage. Experience stories.
        </p>
        <p className="m-0 mb-1 text-xs opacity-80">
          Built with Next.js, Supabase and Cloudflare Workers.
        </p>
        <p className="m-0 text-xs opacity-80">
          &copy; 2026 Routes From Chennai. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
