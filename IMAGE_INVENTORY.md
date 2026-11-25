# Production image inventory

Owner-approved reuse from the Routes From Chennai academic project.

| File | Subject | Source | Licensing status | Production usage |
|---|---|---|---|---|
| `public/images/destinations/marina-beach.webp` | Marina Beach, Chennai | Copied from the owner-approved academic project asset `images/marina-beach.webp` | Owner-approved reuse | Homepage featured card, destination explorer, Marina Beach detail page, related destination cards, travel-story imagery |
| `public/images/destinations/meenakshi-temple.webp` | Meenakshi Amman Temple, Madurai | Copied from the owner-approved academic project asset `images/meenakshi-temple.webp` | Owner-approved reuse | Homepage featured card, destination explorer, Meenakshi detail page, related destination cards, travel-story imagery |
| `public/images/destinations/brihadeeswarar-temple.webp` | Brihadeeswarar Temple, Thanjavur | Copied from the owner-approved academic project asset `images/brihadeeswarar-temple.webp` | Owner-approved reuse | Homepage featured card, destination explorer, Brihadeeswarar detail page, related destination cards, travel-story imagery |

## Implementation notes

- The academic originals were copied, never moved, renamed, edited, or deleted.
- `lib/destination-images.ts` is the local slug-to-asset mapping used by the React pages.
- Each asset is rendered with descriptive alt text, intrinsic dimensions, a responsive 16:9 presentation ratio, and `object-cover` styling.
- No external image provider, paid service, or public Supabase Storage object was introduced.
- Database schema and existing Supabase records were not changed during this asset integration.

## Verification

- File-format verification: each copied file begins with the RIFF/WebP signature and matches the source SHA-256 hash.
- Browser verification: pending local/Vinext preview execution; file existence alone is not treated as proof of browser loading.
