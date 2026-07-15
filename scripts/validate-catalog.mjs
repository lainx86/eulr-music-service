import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const catalogPath = resolve("data/catalog.json");
const stationPath = resolve("data/station.json");
const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
const station = JSON.parse(await readFile(stationPath, "utf8"));

if (!Number.isInteger(catalog.version) || catalog.version < 1) {
  throw new Error("catalog.version must be a positive integer");
}
if (!Array.isArray(catalog.tracks)) throw new Error("catalog.tracks must be an array");
if (!Array.isArray(station.trackIds)) throw new Error("station.trackIds must be an array");

const seen = new Set();
for (const track of catalog.tracks) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(track.id)) throw new Error(`Invalid track id: ${track.id}`);
  if (seen.has(track.id)) throw new Error(`Duplicate track id: ${track.id}`);
  seen.add(track.id);
  if (!(track.durationSeconds > 0)) throw new Error(`Invalid duration for: ${track.id}`);
  new URL(track.audioUrl);
  new URL(track.license.url);
}

for (const id of station.trackIds) {
  if (!seen.has(id)) throw new Error(`Station references unknown track: ${id}`);
}

console.log(`Catalog valid: ${catalog.tracks.length} tracks, ${station.trackIds.length} scheduled.`);
