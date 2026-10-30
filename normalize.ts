export type NormalizedVideo = {
  video_id: string; username: string | null; description: string | null;
  published_at: string | null; video_url: string | null;
  views: number; likes: number; comments: number; shares: number;
  hashtags: string[];
};
const n = (v: any) => Number(v ?? 0) || 0;
export function normalizeVideo(x: any): NormalizedVideo | null {
  const id = String(x.id ?? x.videoId ?? x.video_id ?? x.aweme_id ?? "");
  if (!id) return null;
  const rawTags = x.hashtags ?? x.textExtra?.map?.((t: any) => t.hashtagName) ?? [];
  const caption = String(x.text ?? x.desc ?? x.description ?? "");
  const tags = Array.isArray(rawTags) ? rawTags.map((t: any) =>
    String(typeof t === "string" ? t : t.name ?? t.title ?? "").replace(/^#/, "").toLowerCase()
  ).filter(Boolean) : [];
  ["nzao", "nzao10k"].forEach(tag => {
    if (caption.toLowerCase().includes("#" + tag) && !tags.includes(tag)) tags.push(tag);
  });
  return {
    video_id: id,
    username: x.author?.uniqueId ?? x.authorMeta?.name ?? x.username ?? x.author ?? null,
    description: caption || null,
    published_at: x.createTimeISO ?? x.createTime ?? x.create_time ?? x.publishedAt ?? null,
    video_url: x.webVideoUrl ?? x.shareUrl ?? x.url ?? null,
    views: n(x.playCount ?? x.views ?? x.viewCount),
    likes: n(x.diggCount ?? x.likes ?? x.likeCount),
    comments: n(x.commentCount ?? x.comments),
    shares: n(x.shareCount ?? x.shares),
    hashtags: tags
  };
}