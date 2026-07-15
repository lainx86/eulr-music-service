import type { Catalog, NowPlaying, Station, Track } from "@/lib/types";

interface TimelineEntry {
  track: Track;
  startsAtCycleSecond: number;
  endsAtCycleSecond: number;
}

export function buildTimeline(catalog: Catalog, station: Station): TimelineEntry[] {
  const tracksById = new Map(catalog.tracks.map((track) => [track.id, track]));
  let cursor = 0;

  return station.trackIds.map((trackId) => {
    const track = tracksById.get(trackId);
    if (!track) {
      throw new Error(`Station references unknown track: ${trackId}`);
    }

    const entry = {
      track,
      startsAtCycleSecond: cursor,
      endsAtCycleSecond: cursor + track.durationSeconds,
    };
    cursor = entry.endsAtCycleSecond;
    return entry;
  });
}

export function calculateNowPlaying(
  catalog: Catalog,
  station: Station,
  now = new Date(),
): NowPlaying {
  const serverTime = now.toISOString();
  const timeline = buildTimeline(catalog, station);

  if (timeline.length === 0) {
    return {
      station: { id: station.id, name: station.name },
      track: null,
      positionSeconds: 0,
      startedAt: null,
      endsAt: null,
      nextTrack: null,
      serverTime,
    };
  }

  const cycleDuration = timeline.at(-1)?.endsAtCycleSecond ?? 0;
  const epochMs = new Date(station.epoch).getTime();
  const elapsedSeconds = Math.max(0, (now.getTime() - epochMs) / 1000);
  const cycleSecond = elapsedSeconds % cycleDuration;
  const index = timeline.findIndex(
    (entry) => cycleSecond >= entry.startsAtCycleSecond && cycleSecond < entry.endsAtCycleSecond,
  );
  const activeIndex = index === -1 ? 0 : index;
  const active = timeline[activeIndex];
  const positionSeconds = cycleSecond - active.startsAtCycleSecond;
  const startedAt = new Date(now.getTime() - positionSeconds * 1000);
  const endsAt = new Date(
    startedAt.getTime() + active.track.durationSeconds * 1000,
  );
  const nextTrack = timeline[(activeIndex + 1) % timeline.length]?.track ?? null;

  return {
    station: { id: station.id, name: station.name },
    track: active.track,
    positionSeconds,
    startedAt: startedAt.toISOString(),
    endsAt: endsAt.toISOString(),
    nextTrack,
    serverTime,
  };
}
