import { describe, expect, it } from "vitest";
import { calculateNowPlaying } from "@/lib/radio";
import type { Catalog, Station } from "@/lib/types";

const catalog: Catalog = {
  version: 1,
  updatedAt: "2026-01-01T00:00:00.000Z",
  tracks: [
    {
      id: "one",
      title: "One",
      artist: "eulr",
      durationSeconds: 60,
      audioUrl: "https://example.com/one.mp3",
      license: { name: "CC0", url: "https://example.com/license" },
    },
    {
      id: "two",
      title: "Two",
      artist: "eulr",
      durationSeconds: 120,
      audioUrl: "https://example.com/two.mp3",
      license: { name: "CC0", url: "https://example.com/license" },
    },
  ],
};

const station: Station = {
  id: "focus",
  name: "Focus",
  epoch: "2026-01-01T00:00:00.000Z",
  trackIds: ["one", "two"],
};

describe("calculateNowPlaying", () => {
  it("selects the first track and calculates its offset", () => {
    const result = calculateNowPlaying(catalog, station, new Date("2026-01-01T00:00:30.000Z"));
    expect(result.track?.id).toBe("one");
    expect(result.positionSeconds).toBe(30);
    expect(result.nextTrack?.id).toBe("two");
  });

  it("loops the deterministic schedule", () => {
    const result = calculateNowPlaying(catalog, station, new Date("2026-01-01T00:03:10.000Z"));
    expect(result.track?.id).toBe("one");
    expect(result.positionSeconds).toBe(10);
  });

  it("returns an empty state for an empty station", () => {
    const result = calculateNowPlaying(catalog, { ...station, trackIds: [] }, new Date());
    expect(result.track).toBeNull();
  });
});
