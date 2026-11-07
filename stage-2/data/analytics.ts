import { trendingPost } from "./trendingPost";

export type TimeRange = "live" | "7d" | "14d" | "30d" | "all";

export type RangeMetric = {
  value: string;
  delta?: string;
};

export type SeriesPoint = {
  date: string;
  views: number;
  posts: number;
};

export type RangeData = {
  label: string;
  viewsLabel: string;
  comparison: string;
  lift?: string;
  maxAgeDays: number;
  metrics: {
    engagementRate: RangeMetric;
    watchTime: RangeMetric;
    viewsPerPost: RangeMetric;
  };
  series: SeriesPoint[];
};

export type PostRow = {
  id: string;
  title: string;
  platform: "TikTok" | "YouTube" | "Instagram" | "LinkedIn";
  handle: string;
  date: string;
  ageDays: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  typicalViews: number;
  trending?: boolean;
};

export const timeRanges: { id: TimeRange; label: string }[] = [
  { id: "live", label: "LIVE" },
  { id: "7d", label: "7d" },
  { id: "14d", label: "14d" },
  { id: "30d", label: "30d" },
  { id: "all", label: "All Time" }
];

function daily(start: { month: string; day: number }, views: number[], posts: number[]) {
  return views.map((value, index) => ({
    date: `${start.month} ${start.day + index}`,
    views: value,
    posts: posts[index] ?? 0
  }));
}

const liveHours = [
  "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM", "12 AM", "1 AM",
  "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM",
  "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM"
];
const liveViews = [
  9800, 9100, 8400, 7200, 5900, 4600, 3800, 3300, 3100, 3600, 4800, 6900,
  8700, 10200, 11400, 12100, 12800, 13300, 13900, 14600, 15200, 15800, 16300, 16900
];
const livePosts = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0];

const lastSevenDays = daily(
  { month: "May", day: 26 },
  [148200, 162400, 171900, 158300, 183600, 201800],
  [3, 2, 4, 3, 4, 3]
).concat({ date: "Jun 1", views: 214700, posts: 2 });

const priorSevenDays = daily(
  { month: "May", day: 19 },
  [121400, 118900, 132600, 127300, 139800, 144100, 151200],
  [2, 3, 2, 3, 3, 4, 3]
);

const earlierSixteenDays = daily(
  { month: "May", day: 3 },
  [
    88400, 91200, 86700, 95300, 99800, 97100, 104600, 108200,
    102900, 111500, 115800, 113400, 119700, 117200, 124900, 122300
  ],
  [2, 2, 1, 3, 2, 2, 3, 2, 2, 3, 2, 3, 2, 3, 3, 2]
);

const monthly: SeriesPoint[] = [
  { date: "Jun '25", views: 180000, posts: 9 },
  { date: "Jul", views: 240000, posts: 12 },
  { date: "Aug", views: 310000, posts: 14 },
  { date: "Sep", views: 395000, posts: 15 },
  { date: "Oct", views: 470000, posts: 18 },
  { date: "Nov", views: 560000, posts: 20 },
  { date: "Dec", views: 690000, posts: 22 },
  { date: "Jan '26", views: 820000, posts: 24 },
  { date: "Feb", views: 1020000, posts: 28 },
  { date: "Mar", views: 1310000, posts: 31 },
  { date: "Apr", views: 2050000, posts: 36 },
  { date: "May", views: 3620000, posts: 42 }
];

export const rangeData: Record<TimeRange, RangeData> = {
  live: {
    label: "Last 24 hours",
    viewsLabel: "Views · last 24 hours",
    comparison: "vs previous 24 hours",
    lift: "+6.4%",
    maxAgeDays: 1,
    metrics: {
      engagementRate: { value: "8.4%", delta: "+0.6 pts" },
      watchTime: { value: "0:44", delta: "+2.3%" },
      viewsPerPost: { value: "34.2k", delta: "+6.1%" }
    },
    series: liveHours.map((hour, index) => ({
      date: hour,
      views: liveViews[index],
      posts: livePosts[index]
    }))
  },
  "7d": {
    label: "Last 7 days",
    viewsLabel: "Views · last 7 days",
    comparison: "vs previous 7 days",
    lift: "+18.6%",
    maxAgeDays: 7,
    metrics: {
      engagementRate: { value: "7.8%", delta: "+1.4 pts" },
      watchTime: { value: "0:43", delta: "+8.2%" },
      viewsPerPost: { value: "31.6k", delta: "+12.7%" }
    },
    series: lastSevenDays
  },
  "14d": {
    label: "Last 14 days",
    viewsLabel: "Views · last 14 days",
    comparison: "vs previous 14 days",
    lift: "+14.2%",
    maxAgeDays: 14,
    metrics: {
      engagementRate: { value: "7.3%", delta: "+0.9 pts" },
      watchTime: { value: "0:42", delta: "+5.1%" },
      viewsPerPost: { value: "29.8k", delta: "+9.4%" }
    },
    series: [...priorSevenDays, ...lastSevenDays]
  },
  "30d": {
    label: "Last 30 days",
    viewsLabel: "Views · last 30 days",
    comparison: "vs previous 30 days",
    lift: "+22.1%",
    maxAgeDays: 30,
    metrics: {
      engagementRate: { value: "6.9%", delta: "+0.6 pts" },
      watchTime: { value: "0:40", delta: "+3.8%" },
      viewsPerPost: { value: "27.2k", delta: "+11.3%" }
    },
    series: [...earlierSixteenDays, ...priorSevenDays, ...lastSevenDays]
  },
  all: {
    label: "All time",
    viewsLabel: "All time views",
    comparison: "Lifetime average · 271 posts",
    maxAgeDays: Number.POSITIVE_INFINITY,
    metrics: {
      engagementRate: { value: "6.1%" },
      watchTime: { value: "0:37" },
      viewsPerPost: { value: "22.4k" }
    },
    series: monthly
  }
};

const trendingTypicalViews = Math.round(
  trendingPost.analytics.views / trendingPost.trending.viewsRatio
);

export const postRows: PostRow[] = [
  {
    id: "trending",
    title: "Colin Cowherd says Wemby is the best player in a Knicks-Spurs Finals",
    platform: "TikTok",
    handle: "@volumebball",
    date: "May 31",
    ageDays: 1,
    views: trendingPost.analytics.views,
    likes: trendingPost.analytics.likes,
    comments: trendingPost.analytics.comments,
    shares: trendingPost.analytics.shares,
    typicalViews: trendingTypicalViews,
    trending: true
  },
  {
    id: "keynote-shorts",
    title: "Repurposing a keynote into a week of Shorts",
    platform: "YouTube",
    handle: "@overlapai",
    date: "Jun 1",
    ageDays: 0,
    views: 23400,
    likes: 1100,
    comments: 96,
    shares: 210,
    typicalViews: 61000
  },
  {
    id: "caption-test",
    title: "Auto captions vs. manual: a side-by-side test",
    platform: "TikTok",
    handle: "@overlapai",
    date: "May 27",
    ageDays: 5,
    views: 118000,
    likes: 9400,
    comments: 702,
    shares: 2600,
    typicalViews: 52000
  },
  {
    id: "webinar-clips",
    title: "How to turn a 45 minute webinar into 12 clips",
    platform: "YouTube",
    handle: "@overlapai",
    date: "May 29",
    ageDays: 3,
    views: 184000,
    likes: 8200,
    comments: 642,
    shares: 1800,
    typicalViews: 61000
  },
  {
    id: "strongest-hook",
    title: "The fastest way to find your strongest hook",
    platform: "TikTok",
    handle: "@overlapai",
    date: "May 24",
    ageDays: 8,
    views: 141000,
    likes: 11500,
    comments: 904,
    shares: 3100,
    typicalViews: 52000
  },
  {
    id: "retention-cleanup",
    title: "Editing before and after: retention cleanup",
    platform: "Instagram",
    handle: "@overlap.ai",
    date: "May 20",
    ageDays: 12,
    views: 96000,
    likes: 5400,
    comments: 318,
    shares: 1200,
    typicalViews: 38000
  },
  {
    id: "demo-reveal",
    title: "Why your product demo should start at the reveal",
    platform: "LinkedIn",
    handle: "Overlap AI",
    date: "May 12",
    ageDays: 20,
    views: 74000,
    likes: 2900,
    comments: 186,
    shares: 624,
    typicalViews: 21000
  },
  {
    id: "podcast-shorts",
    title: "One podcast, nine Shorts, one afternoon",
    platform: "YouTube",
    handle: "@overlapai",
    date: "Apr 18",
    ageDays: 44,
    views: 212000,
    likes: 9800,
    comments: 811,
    shares: 2400,
    typicalViews: 58000
  },
  {
    id: "caption-styles",
    title: "Three caption styles that hold attention",
    platform: "TikTok",
    handle: "@overlapai",
    date: "Mar 3",
    ageDays: 90,
    views: 158000,
    likes: 13200,
    comments: 1020,
    shares: 3600,
    typicalViews: 47000
  }
];

export const platformLogos: Record<PostRow["platform"], string> = {
  TikTok: "/logos/tiktokLogo.png",
  YouTube: "/logos/youtube.png",
  Instagram: "/logos/instagram.webp",
  LinkedIn: "/logos/linkedinLogo.png"
};
