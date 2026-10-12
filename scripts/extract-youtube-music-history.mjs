import { readFile, writeFile } from "node:fs/promises";

const [inputPath, outputPath = "lib/music/listening-history.json"] = process.argv.slice(2);

if (!inputPath) {
  throw new Error("Usage: node scripts/extract-youtube-music-history.mjs <watch-history.json> [output.json]");
}

const events = JSON.parse(await readFile(inputPath, "utf8"));
const tracks = new Map();

for (const event of events) {
  if (event.header !== "YouTube Music" || !event.titleUrl) continue;

  const videoId = new URL(event.titleUrl).searchParams.get("v");
  if (!videoId) continue;

  const existing = tracks.get(videoId);
  const playedAt = event.time;

  if (existing) {
    existing.playCount += 1;
    if (playedAt < existing.firstPlayed) existing.firstPlayed = playedAt;
    if (playedAt > existing.lastPlayed) existing.lastPlayed = playedAt;
    continue;
  }

  tracks.set(videoId, {
    id: videoId,
    title: event.title.replace(/^Watched\s+/, ""),
    artists: [event.subtitles?.[0]?.name?.replace(/\s+- Topic$/, "") ?? "Unknown artist"],
    genres: [],
    playCount: 1,
    firstPlayed: playedAt,
    lastPlayed: playedAt,
    youtubeMusicUrl: `https://music.youtube.com/watch?v=${videoId}`,
  });
}

const sorted = [...tracks.values()].sort(
  (left, right) => right.playCount - left.playCount || right.lastPlayed.localeCompare(left.lastPlayed),
);

await writeFile(outputPath, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`Extracted ${sorted.length} unique YouTube Music tracks to ${outputPath}`);
