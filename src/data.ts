export const SNAPSHOT_DATE = "2026-11-03";
export const SNAPSHOT_LABEL = "3 Nov 2026";
export const topics = [
  "All posts",
  "Building",
  "Community",
  "AI agents",
] as const;
export type Topic = (typeof topics)[number];
export type FeedView = "top" | "latest" | "saved";
export type Period = "all" | "week";

export interface Post {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  date: string;
  text: string;
  excerpt: boolean;
  topic: Exclude<Topic, "All posts">;
  likes: number;
  reposts: number;
  replies: number;
  views: number;
  source: string;
}

// Exact short quotations from the linked public post pages, accessed 3 Nov 2026.
// Metrics are observed mirror snapshots, not current X API counts. See docs/SOURCES.md.
export const posts: Post[] = [
  {
    id: "2117065610790379903",
    name: "Adam",
    handle: "surfcoderepeat",
    avatar: "adam",
    date: "2026-11-02T01:25:00Z",
    topic: "Building",
    text: "There are more apps and projects being developed on top of imd (that are coming soon) then on most chains",
    excerpt: false,
    likes: 109,
    reposts: 21,
    replies: 2,
    views: 3985,
    source: "https://teapawt.org/surfcoderepeat/status/2117065610790379903",
  },
  {
    id: "2113661096481390726",
    name: "IMD Radar",
    handle: "imdradar",
    avatar: "radar",
    date: "2026-10-23T15:57:00Z",
    topic: "Community",
    text: "entries for the IMD hackathon are closed, and it went way beyond what we expected 78 projects entered.",
    excerpt: true,
    likes: 79,
    reposts: 14,
    replies: 16,
    views: 2018,
    source: "https://teapawt.org/imdradar/status/2113661096481390726",
  },
  {
    id: "2115508430186348696",
    name: "Damián Et",
    handle: "damian_et",
    avatar: "damian",
    date: "2026-10-28T18:18:00Z",
    topic: "Community",
    text: "The 15 winners of the 1st Identity MD hackathon are here! Funded & organised by the community. Judged by IMD agents.",
    excerpt: true,
    likes: 60,
    reposts: 16,
    replies: 7,
    views: 10965,
    source: "https://teapawt.org/damian_et/status/2115508430186348696",
  },
  {
    id: "2116740039669428430",
    name: "Infer Protocol",
    handle: "imdusd",
    avatar: "infer",
    date: "2026-11-01T03:52:00Z",
    topic: "AI agents",
    text: "i built imdusd with the swarm itself and tbh i dont think it wouldve been possible without it",
    excerpt: true,
    likes: 52,
    reposts: 11,
    replies: 1,
    views: 2938,
    source: "https://teapawt.org/imdusd/status/2116740039669428430",
  },
  {
    id: "2117000190552854544",
    name: "Infer Protocol",
    handle: "imdusd",
    avatar: "infer",
    date: "2026-11-01T21:05:00Z",
    topic: "AI agents",
    text: "Our first INFER product: the Box 📦🥕\nIt's built to make anyone a better user of the swarm.",
    excerpt: true,
    likes: 45,
    reposts: 16,
    replies: 1,
    views: 3187,
    source: "https://teapawt.org/imdusd/status/2117000190552854544",
  },
  {
    id: "2116986865442300030",
    name: "Nitro Slav",
    handle: "nitroslaveth",
    avatar: "nitro",
    date: "2026-11-01T20:12:00Z",
    topic: "Building",
    text: "Introducing IMDuel, a Uniswap v4 hook that plays chess. Each pool is a duel between its two tokens.",
    excerpt: true,
    likes: 24,
    reposts: 5,
    replies: 5,
    views: 1612,
    source: "https://teapawt.org/nitroslaveth/status/2116986865442300030",
  },
  {
    id: "2116586766589427928",
    name: "miyagod",
    handle: "yadfarms",
    avatar: "miyagod",
    date: "2026-10-31T17:43:00Z",
    topic: "Building",
    text: "added a check to all imdUSD and infer websites that watches deployed code changes and alerts for any suspicious activity.",
    excerpt: false,
    likes: 21,
    reposts: 3,
    replies: 1,
    views: 665,
    source: "https://teapawt.org/yadfarms/status/2116586766589427928",
  },
  {
    id: "2116260940127617506",
    name: "Infer Protocol",
    handle: "imdusd",
    avatar: "infer",
    date: "2026-10-30T20:08:00Z",
    topic: "AI agents",
    text: "A swarm of AI agents priced imdUSD 59 times this week, each answer signed and checked on chain.",
    excerpt: true,
    likes: 19,
    reposts: 4,
    replies: 1,
    views: 623,
    source: "https://teapawt.org/imdusd/status/2116260940127617506",
  },
];

export const postUrl = (post: Post) =>
  `https://x.com/${post.handle}/status/${post.id}`;

export function selectPosts(
  query: string,
  topic: Topic,
  view: FeedView,
  period: Period,
  saved: string[],
) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const cutoff = Date.parse(`${SNAPSHOT_DATE}T23:59:59Z`) - 7 * 86_400_000;
  return posts
    .filter(
      (post) =>
        (topic === "All posts" || post.topic === topic) &&
        (view !== "saved" || saved.includes(post.id)) &&
        (period === "all" || Date.parse(post.date) >= cutoff) &&
        words.every((word) =>
          `${post.name} ${post.handle} ${post.text} ${post.topic}`
            .toLocaleLowerCase()
            .includes(word),
        ),
    )
    .sort((a, b) =>
      view === "latest"
        ? Date.parse(b.date) - Date.parse(a.date)
        : b.likes - a.likes || Date.parse(b.date) - Date.parse(a.date),
    );
}
