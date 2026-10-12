import { NextResponse } from "next/server";
import listeningHistory from "@/lib/music/listening-history.json";

export function GET() {
  return NextResponse.json(listeningHistory, {
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  });
}
