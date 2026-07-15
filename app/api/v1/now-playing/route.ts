import { getCatalog, getStation } from "@/lib/catalog";
import { jsonResponse, optionsResponse } from "@/lib/http";
import { calculateNowPlaying } from "@/lib/radio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(): Response {
  try {
    const state = calculateNowPlaying(getCatalog(), getStation(), new Date());
    return jsonResponse(state, {
      cacheControl: "public, s-maxage=2, stale-while-revalidate=5",
    });
  } catch (error) {
    return jsonResponse(
      {
        error: "station_unavailable",
        message: error instanceof Error ? error.message : "Unknown station error",
      },
      { status: 500, cacheControl: "no-store" },
    );
  }
}

export function OPTIONS(): Response {
  return optionsResponse();
}
