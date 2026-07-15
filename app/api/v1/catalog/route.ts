import { getCatalog, getStation } from "@/lib/catalog";
import { jsonResponse, optionsResponse } from "@/lib/http";

export const runtime = "nodejs";

export function GET(): Response {
  try {
    const catalog = getCatalog();
    const station = getStation();

    return jsonResponse(
      {
        ...catalog,
        station: {
          id: station.id,
          name: station.name,
          trackIds: station.trackIds,
        },
      },
      { cacheControl: "public, s-maxage=300, stale-while-revalidate=3600" },
    );
  } catch (error) {
    return jsonResponse(
      {
        error: "catalog_unavailable",
        message: error instanceof Error ? error.message : "Unknown catalog error",
      },
      { status: 500, cacheControl: "no-store" },
    );
  }
}

export function OPTIONS(): Response {
  return optionsResponse();
}
