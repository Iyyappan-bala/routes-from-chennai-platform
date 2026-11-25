"use client";

import { useEffect, useRef } from "react";
import { Map as MapLibreMap, Marker, Popup, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export function DestinationMap({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new MapLibreMap({
      container: containerRef.current,
      style: "https://tiles.stadiamaps.com/styles/alidade_smooth.json",
      center: [lng, lat],
      zoom: 12,
    });
    new Marker({ color: "#C1603A" })
      .setLngLat([lng, lat])
      .setPopup(new Popup().setText(name))
      .addTo(map);
    map.addControl(new NavigationControl(), "top-right");
    return () => map.remove();
  }, [lat, lng, name]);

  return (
    <div
      ref={containerRef}
      className="h-80 w-full rounded-lg border border-[color:var(--color-sandstone)]"
      role="img"
      aria-label={`Map showing the location of ${name}`}
    />
  );
}
