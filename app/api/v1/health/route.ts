import { getCatalog } from "@/lib/catalog";
import { jsonResponse, optionsResponse } from "@/lib/http";

export function GET(): Response {
  const catalog = getCatalog();
  return jsonResponse(
    {
      ok: true,
      service: "eulr-music-service",
      catalogVersion: catalog.version,
      tracks: catalog.tracks.length,
      time: new Date().toISOString(),
    },
    { cacheControl: "no-store" },
  );
}

export function OPTIONS(): Response {
  return optionsResponse();
}
