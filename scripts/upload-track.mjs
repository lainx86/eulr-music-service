#!/usr/bin/env node
import { put } from "@vercel/blob";
import { readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith("--")) continue;
    values[key.slice(2)] = argv[index + 1];
    index += 1;
  }
  return values;
}

function required(args, key) {
  const value = args[key];
  if (!value) throw new Error(`Missing --${key}`);
  return value;
}

if (process.argv.includes("--help")) {
  console.log(`Usage:
  pnpm upload:track -- \\
    --file ./music/track.mp3 \\
    --id calm-currents \\
    --title "Calm Currents" \\
    --artist "Artist" \\
    --duration 184 \\
    --license-name CC0-1.0 \\
    --license-url https://creativecommons.org/publicdomain/zero/1.0/ \\
    --source-url https://example.com/source
`);
  process.exit(0);
}

const blobToken =
  process.env.EULR_MUSIC_READ_WRITE_TOKEN ??
  process.env.BLOB_READ_WRITE_TOKEN;

if (!blobToken) {
  throw new Error(
    "EULR_MUSIC_READ_WRITE_TOKEN or BLOB_READ_WRITE_TOKEN is required.",
  );
}

const args = parseArgs(process.argv.slice(2));
const filePath = resolve(required(args, "file"));
const id = required(args, "id");
if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) throw new Error("--id must be lowercase kebab-case");

const durationSeconds = Number(required(args, "duration"));
if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
  throw new Error("--duration must be a positive number in seconds");
}

const file = await readFile(filePath);
const pathname = `tracks/${id}-${basename(filePath)}`;
const blob = await put(pathname, file, {
  token: blobToken,
  access: "public",
  addRandomSuffix: false,
  contentType: args["content-type"],
});

const catalogPath = resolve("data/catalog.json");
const stationPath = resolve("data/station.json");
const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
const station = JSON.parse(await readFile(stationPath, "utf8"));

if (catalog.tracks.some((track) => track.id === id)) {
  throw new Error(`Track id already exists: ${id}`);
}

catalog.tracks.push({
  id,
  title: required(args, "title"),
  artist: required(args, "artist"),
  ...(args.album ? { album: args.album } : {}),
  durationSeconds,
  audioUrl: blob.url,
  ...(args["cover-url"] ? { coverUrl: args["cover-url"] } : {}),
  license: {
    name: required(args, "license-name"),
    url: required(args, "license-url"),
    ...(args["source-url"] ? { sourceUrl: args["source-url"] } : {}),
  },
});
catalog.version += 1;
catalog.updatedAt = new Date().toISOString();
station.trackIds.push(id);

await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
await writeFile(stationPath, `${JSON.stringify(station, null, 2)}\n`);

console.log(`Uploaded ${id}: ${blob.url}`);
console.log("Catalog and station updated. Commit them and redeploy.");
