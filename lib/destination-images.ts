export type DestinationImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

const destinationImages: Record<string, DestinationImage> = {
  "marina-beach": {
    src: "/images/destinations/marina-beach.webp",
    alt: "Marina Beach along Chennai's Bay of Bengal coastline",
    width: 1672,
    height: 941,
  },
  "meenakshi-amman-temple": {
    src: "/images/destinations/meenakshi-temple.webp",
    alt: "The colourful sculpted gopuram towers of Meenakshi Amman Temple in Madurai",
    width: 1672,
    height: 941,
  },
  "brihadeeswarar-temple": {
    src: "/images/destinations/brihadeeswarar-temple.webp",
    alt: "The granite vimana tower of Brihadeeswarar Temple in Thanjavur",
    width: 1672,
    height: 941,
  },
};

export function getDestinationImage(slug: string): DestinationImage | null {
  return destinationImages[slug] ?? null;
}

export const imageAttribution = "Owner-approved reuse from the Routes From Chennai academic project.";
