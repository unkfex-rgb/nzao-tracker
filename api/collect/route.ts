import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { normalizeVideo } from "@/lib/normalize";

export const maxDuration = 60;
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const token = process.env.APIFY_TOKEN, actor = process.env.APIFY_ACTOR_ID;
  if (!token || !actor) return NextResponse.json({ error: "Configure APIFY_TOKEN e APIFY_ACTOR_ID" }, { status: 500 });

  const input = JSON.parse(process.env.APIFY_INPUT_JSON || '{"hashtags":["nzao","nzao10k"]}');
  const actorPath = actor.replace("/", "~");
  const url = `https://api.apify.com/v2/acts/${encodeURIComponent(actorPath)}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}&format=json&clean=true`;
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: "Falha no Apify", detail: await response.text() }, { status: 502 });
  const rows: any[] = await response.json();
  const db = supabaseAdmin();
  const start = "2026-09-05T00:00:00-03:00", end = "2026-10-06T00:00:00-03:00";
  let saved = 0, snapshots = 0, ignored = 0;

  for (const row of rows) {
    const v = normalizeVideo(row);
    if (!v) { ignored++; continue; }
    const date = v.published_at ? new Date(v.published_at) : null;
    if (!date || isNaN(date.getTime()) || date < new Date(start) || date >= new Date(end)) { ignored++; continue; }
    const matching = v.hashtags.filter(t => ["nzao", "nzao10k"].includes(t));
    if (!matching.length) { ignored++; continue; }

    const { error: videoErr } = await db.from("videos").upsert({
      video_id: v.video_id, username: v.username, description: v.description,
      published_at: date.toISOString(), video_url: v.video_url, last_seen_at: new Date().toISOString()
    }, { onConflict: "video_id" });
    if (videoErr) throw videoErr;

    for (const tag of matching) {
      const { error } = await db.from("video_hashtags").upsert({ video_id: v.video_id, hashtag: tag }, { onConflict: "video_id,hashtag" });
      if (error) throw error;
    }
    const { error: snapErr } = await db.from("metric_snapshots").insert({
      video_id: v.video_id, views: v.views, likes: v.likes, comments: v.comments, shares: v.shares
    });
    if (snapErr) throw snapErr;
    saved++; snapshots++;
  }
  return NextResponse.json({ ok: true, received: rows.length, saved, snapshots, ignored, collected_at: new Date().toISOString() });
}