import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 bg-[color:var(--color-navy)] text-[color:var(--color-ivory)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div>
          <p className="m-0 text-[0.7rem] uppercase tracking-[0.2em] text-[color:var(--color-sandstone)]">
            Travel &amp; Heritage
          </p>
          <Link href="/" className="!text-[color:var(--color-ivory)] no-underline">
            <span className="font-[family-name:var(--font-display)] text-2xl font-semibold">
              Routes From Chennai
            </span>
          </Link>
        </div>
        <nav aria-label="Primary">
          <ul className="m-0 flex list-none flex-wrap gap-6 p-0 text-sm">
            <li><Link href="/" className="!text-[color:var(--color-ivory)] no-underline hover:!text-[color:var(--color-terracotta)]">Home</Link></li>
            <li><Link href="/destinations" className="!text-[color:var(--color-ivory)] no-underline hover:!text-[color:var(--color-terracotta)]">Destinations</Link></li>
            <li><Link href="/stories" className="!text-[color:var(--color-ivory)] no-underline hover:!text-[color:var(--color-terracotta)]">Travel Stories</Link></li>
            <li><Link href="/search" className="!text-[color:var(--color-ivory)] no-underline hover:!text-[color:var(--color-terracotta)]">Search</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
