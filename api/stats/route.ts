import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
export async function GET() {
  const db = supabaseAdmin();
  const { data: videos, error } = await db.from("videos").select("video_id,username,description,published_at,video_url,video_hashtags(hashtag),metric_snapshots(views,likes,comments,shares,collected_at)").order("published_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const latest = (videos ?? []).map((v: any) => {
    const snaps = [...(v.metric_snapshots ?? [])].sort((a: any,b: any) => b.collected_at.localeCompare(a.collected_at));
    return {...v, hashtags: (v.video_hashtags ?? []).map((h: any) => h.hashtag), metrics: snaps[0] ?? {views:0,likes:0,comments:0,shares:0}};
  });
  const tags = ["nzao","nzao10k"];
  const summary = Object.fromEntries(tags.map(tag => {
    const list = latest.filter((v: any) => v.hashtags.includes(tag));
    return [tag, { videos: list.length, views: list.reduce((s:number,v:any)=>s+v.metrics.views,0), likes:list.reduce((s:number,v:any)=>s+v.metrics.likes,0), comments:list.reduce((s:number,v:any)=>s+v.metrics.comments,0), shares:list.reduce((s:number,v:any)=>s+v.metrics.shares,0) }];
  }));
  const unique = new Map(latest.map((v:any)=>[v.video_id,v]));
  const all = [...unique.values()];
  return NextResponse.json({summary, total_unique_videos:all.length, totals: {
    views:all.reduce((s:number,v:any)=>s+v.metrics.views,0), likes:all.reduce((s:number,v:any)=>s+v.metrics.likes,0),
    comments:all.reduce((s:number,v:any)=>s+v.metrics.comments,0), shares:all.reduce((s:number,v:any)=>s+v.metrics.shares,0)
  }, videos:all.sort((a:any,b:any)=>b.metrics.views-a.metrics.views)});
}