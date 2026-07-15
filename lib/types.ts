import { z } from "zod";

export const TrackSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  title: z.string().min(1),
  artist: z.string().min(1),
  album: z.string().min(1).optional(),
  durationSeconds: z.number().positive(),
  audioUrl: z.string().url(),
  coverUrl: z.string().url().optional(),
  license: z.object({
    name: z.string().min(1),
    url: z.string().url(),
    sourceUrl: z.string().url().optional(),
  }),
});

export const CatalogSchema = z.object({
  version: z.number().int().positive(),
  updatedAt: z.string().datetime(),
  tracks: z.array(TrackSchema),
});

export const StationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  epoch: z.string().datetime(),
  trackIds: z.array(z.string()).min(1).or(z.tuple([])),
});

export type Track = z.infer<typeof TrackSchema>;
export type Catalog = z.infer<typeof CatalogSchema>;
export type Station = z.infer<typeof StationSchema>;

export interface NowPlaying {
  station: Pick<Station, "id" | "name">;
  track: Track | null;
  positionSeconds: number;
  startedAt: string | null;
  endsAt: string | null;
  nextTrack: Track | null;
  serverTime: string;
}
