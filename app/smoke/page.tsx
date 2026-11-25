import Image from "next/image";
import Link from "next/link";
import { smokeServerAction } from "./action";

export default function SmokePage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>M0 Smoke Test</h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2>1. Dynamic route</h2>
        <p>
          <Link href="/smoke/test-destination-123">Go to /smoke/test-destination-123 &rarr;</Link>
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>2. Server action</h2>
        <form action={smokeServerAction}>
          <input name="name" defaultValue="smoke-test-value" />
          <button type="submit">Submit to server action</button>
        </form>
        <p>Check server logs / deployment logs for the "[smoke-action] received:" line.</p>
      </section>

      <section>
        <h2>3. Image optimization</h2>
        <Image src="/next.svg" alt="Next.js logo (image optimization smoke test)" width={120} height={24} />
      </section>
    </main>
  );
}
