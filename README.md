# eulr Music Service

Remote music catalog and synchronized radio state for the `eulr` coding agent.

This project does **not** keep a server-side audio process alive. Audio files live in a public Vercel Blob store. The API computes the current track and seek offset from a deterministic station timeline, while playback happens locally in eulr through mpv.

## Endpoints

- `GET /api/v1/catalog`
- `GET /api/v1/now-playing`
- `GET /api/v1/health`

All public endpoints return permissive CORS headers so a terminal client can consume them.

## Local setup

```fish
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import it from the Vercel dashboard.
3. In **Storage**, create a **Public Blob** store and connect it to the project.
4. Redeploy after the Blob store is connected.
5. Set `NEXT_PUBLIC_SERVICE_ORIGIN` to the production origin if you use it from other tooling.

Vercel injects `BLOB_READ_WRITE_TOKEN` when the Blob store is connected to the selected environments.

## Upload a track

Pull deployment environment variables first:

```fish
vercel link
vercel env pull .env.local
```

Load the token into the current fish process:

```fish
set -gx BLOB_READ_WRITE_TOKEN (string replace 'BLOB_READ_WRITE_TOKEN=' '' < .env.local | string trim -c '"')
```

Then upload:

```fish
pnpm upload:track -- \
  --file ./music/calm-currents.mp3 \
  --id calm-currents \
  --title "Calm Currents" \
  --artist "Artist Name" \
  --duration 184 \
  --license-name CC0-1.0 \
  --license-url https://creativecommons.org/publicdomain/zero/1.0/ \
  --source-url https://example.com/original-source
```

The script uploads the audio to Blob, updates `data/catalog.json`, and appends the track to `data/station.json`. Commit both JSON files and push so Vercel redeploys the catalog.

The script intentionally requires explicit license metadata. Only distribute music you are allowed to redistribute and stream.

## Validate and test

```fish
pnpm validate:catalog
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

## Connect eulr

Add a configurable remote source to eulr:

```text
EULR_MUSIC_SERVICE_URL=https://your-project.vercel.app
```

The client should:

1. Fetch `/api/v1/now-playing`.
2. Read `track.audioUrl` and `positionSeconds`.
3. Open the URL in local mpv.
4. Seek to `positionSeconds`.
5. Refresh near `endsAt` or when mpv reports end-of-file.
6. Fall back to local music when the service cannot be reached.

Example response:

```json
{
  "station": { "id": "eulr-focus", "name": "eulr focus radio" },
  "track": {
    "id": "calm-currents",
    "title": "Calm Currents",
    "artist": "Artist Name",
    "durationSeconds": 184,
    "audioUrl": "https://...public.blob.vercel-storage.com/tracks/calm-currents.mp3",
    "license": {
      "name": "CC0-1.0",
      "url": "https://creativecommons.org/publicdomain/zero/1.0/"
    }
  },
  "positionSeconds": 42.8,
  "startedAt": "2026-07-15T05:00:00.000Z",
  "endsAt": "2026-07-15T05:03:04.000Z",
  "nextTrack": null,
  "serverTime": "2026-07-15T05:00:42.800Z"
}
```

## Why the station stays synchronized

The station has an epoch and ordered track IDs. The service calculates:

```text
elapsed = now - epoch
cyclePosition = elapsed mod totalPlaylistDuration
```

That means no Vercel Function needs to stay alive. Every request independently reaches the same current track and offset.

## Current limitations

- Catalog changes require a Git commit and Vercel redeploy.
- Duration is supplied manually during upload.
- No private/admin web dashboard yet.
- Public Blob URLs can be shared by anyone who has the URL.
