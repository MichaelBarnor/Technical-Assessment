"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  XAxis,
  YAxis
} from "recharts";
import {
  ArrowUpRight,
  BarChart3,
  Bot,
  CalendarDays,
  CalendarClock,
  ChartNoAxesCombined,
  Clock3,
  CreditCard,
  Eye,
  Film,
  FolderKanban,
  Home,
  Info,
  Plus,
  Radar,
  Scissors,
  Search,
  Settings,
  Share2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Type,
  UsersRound,
  Workflow,
  type LucideIcon
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "./ui/chart";
import {
  platformLogos,
  postRows,
  rangeData,
  timeRanges,
  type PostRow,
  type RangeData,
  type RangeMetric,
  type SeriesPoint,
  type TimeRange
} from "../data/analytics";
import { trendingPost } from "../data/trendingPost";

type AnalyticsTab = "overview" | "posts";

type PostSort = "views" | "engagement" | "vsTypical";

type HeadlineMetric = {
  label: string;
  metric: RangeMetric;
  icon: LucideIcon;
};

type SidebarItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

const sidebarGroups: SidebarItem[][] = [
  [{ label: "Home", icon: Home }],
  [
    { label: "Workflow", icon: Workflow },
    { label: "Projects", icon: FolderKanban },
    { label: "Editing Agent", icon: Bot }
  ],
  [
    { label: "Social Calendar", icon: CalendarDays },
    { label: "Analytics", icon: BarChart3, active: true },
    { label: "Personas", icon: UsersRound }
  ],
  [
    { label: "Settings", icon: Settings },
    { label: "Billing", icon: CreditCard }
  ]
];

const sourceRows = [
  {
    platform: "Instagram",
    handle: "@overlap.ai",
    followers: "82.4k",
    impressions: "618k",
    engagement: "44.1k",
    connected: true,
    logo: "/logos/instagram.webp"
  },
  {
    platform: "TikTok",
    handle: "@overlapai",
    followers: "128k",
    impressions: "1.2M",
    engagement: "91.3k",
    connected: true,
    logo: "/logos/tiktokLogo.png"
  },
  {
    platform: "YouTube",
    handle: "@overlapai",
    followers: "64.9k",
    impressions: "487k",
    engagement: "27.8k",
    connected: true,
    logo: "/logos/youtube.png"
  },
  {
    platform: "LinkedIn",
    handle: "Overlap AI",
    followers: "39.2k",
    impressions: "214k",
    engagement: "18.4k",
    connected: true,
    logo: "/logos/linkedinLogo.png"
  },
  {
    platform: "Facebook",
    handle: "Not connected",
    followers: "N/A",
    impressions: "N/A",
    engagement: "N/A",
    connected: false,
    logo: "/logos/facebook.png"
  }
];

const sortOptions: { id: PostSort; label: string }[] = [
  { id: "views", label: "Views" },
  { id: "engagement", label: "Engagement rate" },
  { id: "vsTypical", label: "vs. typical" }
];

const seriesConfig = {
  views: {
    label: "Views",
    color: "var(--chart-1)"
  },
  posts: {
    label: "Posts",
    color: "var(--chart-2)"
  }
} satisfies ChartConfig;

const compactNumber = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  notation: "compact"
});

const fullNumber = new Intl.NumberFormat("en-US");

const pacificDateTime = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  timeZone: "America/Los_Angeles"
});

const pacificTime = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Los_Angeles"
});

function engagementRate(post: PostRow) {
  return (post.likes + post.comments + post.shares) / post.views;
}

function vsTypical(post: PostRow) {
  return post.views / post.typicalViews;
}

function sortValue(post: PostRow, sort: PostSort) {
  if (sort === "views") return post.views;
  if (sort === "engagement") return engagementRate(post);
  return vsTypical(post);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatRatio(value: number) {
  return value >= 10 ? `${Math.round(value)}×` : `${value.toFixed(2)}×`;
}

function Separator() {
  return <div className="separator" aria-hidden="true" />;
}

function AppSidebar() {
  return (
    <aside className="app-sidebar" aria-label="Main navigation">
      <div className="sidebar-brand">
        <Image
          src="/logos/overlapLogo.svg"
          alt="Overlap"
          width={32}
          height={32}
          priority
        />
        <span>Overlap</span>
      </div>

      <nav className="sidebar-nav" aria-label="Primary">
        {sidebarGroups.map((group, groupIndex) => (
          <div className="sidebar-group" key={`sidebar-group-${groupIndex}`}>
            {group.map((item) => (
              <div
                aria-current={item.active ? "page" : undefined}
                className={item.active ? "sidebar-item active" : "sidebar-item"}
                key={item.label}
              >
                <item.icon aria-hidden="true" size={17} strokeWidth={2} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer" aria-label="Workspace">
        <span className="sidebar-avatar">OT</span>
        <div>
          <strong>Overlap Team</strong>
          <span>Demo workspace</span>
        </div>
      </div>
    </aside>
  );
}

function RangeToggle({
  range,
  onChange
}: {
  range: TimeRange;
  onChange: (range: TimeRange) => void;
}) {
  return (
    <div className="range-shell" role="group" aria-label="Time range">
      {timeRanges.map((option) => (
        <button
          aria-pressed={option.id === range}
          className={option.id === range ? "range-chip active" : "range-chip"}
          key={option.id}
          onClick={() => onChange(option.id)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function SignalGraph({ series }: { series: SeriesPoint[] }) {
  return (
    <ChartContainer
      aria-label="Views chart"
      className="signal-chart"
      config={seriesConfig}
    >
      <AreaChart
        accessibilityLayer
        data={series}
        margin={{ bottom: 0, left: 8, right: 12, top: 12 }}
      >
        <defs>
          <linearGradient id="views-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="var(--color-views)" stopOpacity={0.32} />
            <stop offset="88%" stopColor="var(--color-views)" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="date"
          interval="preserveStartEnd"
          minTickGap={28}
          tickLine={false}
          tickMargin={12}
        />
        <YAxis
          domain={[
            (dataMin: number) => Math.max(0, dataMin * 0.8),
            (dataMax: number) => dataMax * 1.08
          ]}
          hide
          yAxisId="views"
        />
        <YAxis
          domain={[0, (dataMax: number) => Math.max(4, dataMax * 1.6)]}
          hide
          orientation="right"
          yAxisId="posts"
        />
        <ChartTooltip
          content={<ChartTooltipContent />}
          cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
        />
        <Area
          activeDot={{
            fill: "var(--color-views)",
            r: 4,
            stroke: "var(--background)",
            strokeWidth: 2
          }}
          dataKey="views"
          fill="url(#views-fill)"
          fillOpacity={1}
          stroke="var(--color-views)"
          strokeWidth={2.5}
          type="monotone"
          yAxisId="views"
        />
        <Line
          activeDot={{ fill: "var(--color-posts)", r: 4, strokeWidth: 0 }}
          dataKey="posts"
          dot={{ fill: "var(--color-posts)", r: 3, strokeWidth: 0 }}
          stroke="var(--color-posts)"
          strokeWidth={0}
          type="monotone"
          yAxisId="posts"
        />
      </AreaChart>
    </ChartContainer>
  );
}

function WorkspacePanel({ data }: { data: RangeData }) {
  const totalViews = data.series.reduce((sum, point) => sum + point.views, 0);
  const headlineMetrics: HeadlineMetric[] = [
    { label: "Engagement Rate", metric: data.metrics.engagementRate, icon: ChartNoAxesCombined },
    { label: "Average Watch Time Per Post", metric: data.metrics.watchTime, icon: Clock3 },
    { label: "Average Views Per Post", metric: data.metrics.viewsPerPost, icon: Eye }
  ];

  return (
    <div className="workspace-panel">
      <section className="metric-band">
        {headlineMetrics.map((stat) => (
          <article className="metric-cell" key={stat.label}>
            <div className="metric-symbol">
              <stat.icon aria-hidden="true" size={16} strokeWidth={2} />
            </div>
            <div>
              <p>{stat.label}</p>
              <div className="metric-line">
                <strong>{stat.metric.value}</strong>
                {stat.metric.delta ? <span>{stat.metric.delta}</span> : null}
              </div>
              <small>{data.comparison}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="surface primary-surface">
        <div className="surface-header">
          <div className="surface-title">
            <p className="eyebrow">{data.viewsLabel}</p>
            <div className="headline-row">
              <strong>{fullNumber.format(totalViews)}</strong>
              {data.lift ? <span className="lift-badge">{data.lift}</span> : null}
            </div>
          </div>

          <div className="control-cluster" aria-label="Analytics controls">
            <button className="pill-select" type="button">All Platforms</button>
          </div>
        </div>

        <Separator />

        <div className="surface-grid">
          <div className="visual-pane">
            <div className="legend-strip">
              <span><i />Views</span>
              <span><i className="dot-marker" />Posts</span>
            </div>
            <SignalGraph series={data.series} />
          </div>

          <aside className="side-pane">
            <div className="side-pane-header">
              <div>
                <h2>Social Platforms</h2>
                <p>4 of 9 platforms connected</p>
              </div>
              <button className="ghost-action" type="button">
                <Plus aria-hidden="true" size={14} strokeWidth={2} />
                Connect
              </button>
            </div>
            <Separator />
            <div className="source-grid">
              <div className="source-grid-head">
                <span>Platform</span>
                <span>Followers</span>
                <span>Impr.</span>
                <span>Eng.</span>
              </div>
              {sourceRows.map((row) => (
                <div className={row.connected ? "source-row" : "source-row disconnected"} key={row.platform}>
                  <div className="source-name">
                    <span className="source-mark">
                      <Image
                        src={row.logo}
                        alt={`${row.platform} logo`}
                        width={18}
                        height={18}
                      />
                    </span>
                    <div>
                      <strong>{row.platform}</strong>
                      <small>{row.handle}</small>
                    </div>
                  </div>
                  <span>{row.followers}</span>
                  <span>{row.impressions}</span>
                  <span>{row.engagement}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="side-pane-footer">
              <span>5 platforms not connected</span>
              <button type="button">
                View More
                <ArrowUpRight aria-hidden="true" size={14} strokeWidth={2} />
              </button>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function TrendingBadge() {
  return (
    <span className="trending-badge">
      <TrendingUp aria-hidden="true" size={12} strokeWidth={2.4} />
      Trending
    </span>
  );
}

function PostThumb({ post }: { post: PostRow }) {
  if (post.trending) {
    return (
      <div
        aria-hidden="true"
        className="post-thumb has-image"
        style={{ backgroundImage: `url(${trendingPost.thumbnailUrl})` }}
      />
    );
  }

  return (
    <div aria-hidden="true" className="post-thumb">
      <Image src={platformLogos[post.platform]} alt="" width={20} height={20} />
    </div>
  );
}

function TopPostCard({ post, rank, sort }: { post: PostRow; rank: number; sort: PostSort }) {
  const stats: { id: PostSort; label: string; value: string }[] = [
    { id: "views", label: "Views", value: compactNumber.format(post.views) },
    { id: "engagement", label: "Eng. rate", value: formatPercent(engagementRate(post)) },
    { id: "vsTypical", label: "vs. typical", value: formatRatio(vsTypical(post)) }
  ];

  return (
    <article className={post.trending ? "top-post-card is-trending" : "top-post-card"}>
      <div className="top-post-head">
        <span className="top-post-rank">#{rank}</span>
        {post.trending ? <TrendingBadge /> : null}
      </div>
      <div className="top-post-body">
        <PostThumb post={post} />
        <div className="top-post-title">
          <strong>{post.title}</strong>
          <small>{post.handle} · {post.platform} · {post.date}</small>
        </div>
      </div>
      <div className="top-post-stats">
        {stats.map((stat) => (
          <div className={stat.id === sort ? "top-post-stat active" : "top-post-stat"} key={stat.id}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

function TopPosts({ posts, data }: { posts: PostRow[]; data: RangeData }) {
  const [sort, setSort] = useState<PostSort>("vsTypical");

  const ranked = useMemo(() => {
    const pinned = posts.filter((post) => post.trending);
    const rest = posts
      .filter((post) => !post.trending)
      .sort((a, b) => sortValue(b, sort) - sortValue(a, sort));
    return [...pinned, ...rest].slice(0, 3);
  }, [posts, sort]);

  return (
    <section className="surface posts-section">
      <div className="section-header">
        <div>
          <h2>Top posts</h2>
          <p>
            {data.label} · the trending post is pinned first, the rest are ranked by{" "}
            {sortOptions.find((option) => option.id === sort)?.label.toLowerCase()}
          </p>
        </div>
        <div className="range-shell" role="group" aria-label="Rank top posts by">
          {sortOptions.map((option) => (
            <button
              aria-pressed={option.id === sort}
              className={option.id === sort ? "range-chip active" : "range-chip"}
              key={option.id}
              onClick={() => setSort(option.id)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="top-post-grid">
        {ranked.map((post, index) => (
          <TopPostCard key={post.id} post={post} rank={index + 1} sort={sort} />
        ))}
        {Array.from({ length: 3 - ranked.length }, (_, index) => (
          <div className="top-post-card empty" key={`empty-${index}`}>
            <span>No other posts published in this range</span>
          </div>
        ))}
      </div>
    </section>
  );
}

const captionText = trendingPost.final_post_text.replace(/#\w+/g, "").trim();
const captionTags = trendingPost.final_post_text.match(/#\w+/g) ?? [];

const creationSteps: { icon: LucideIcon; title: string; detail: string }[] = [
  {
    icon: Film,
    title: "Source video",
    detail: "Long-form sports talk segment uploaded to Overlap"
  },
  {
    icon: Scissors,
    title: "Clip found and edited",
    detail: "Editing Agent cut the Wemby vs. Knicks take into a vertical clip with captions"
  },
  {
    icon: Type,
    title: "Caption written",
    detail: "Hook, debate question and hashtags generated for TikTok"
  },
  {
    icon: CalendarClock,
    title: "Scheduled and published",
    detail: `Posted to TikTok · ${pacificDateTime.format(new Date(trendingPost.createdAt))}`
  },
  {
    icon: Radar,
    title: "Breakout detected",
    detail: `Flagged ${pacificDateTime.format(new Date(trendingPost.trendingSignals.updatedAt))} · ${formatRatio(trendingPost.trending.viewsRatio)} typical views`
  }
];

const ratioScale = { min: -1, max: 3 };
const ratioTicks = [0.1, 1, 10, 100, 1000];

function ratioPosition(value: number) {
  const log = Math.log10(value);
  const clamped = Math.min(ratioScale.max, Math.max(ratioScale.min, log));
  return ((clamped - ratioScale.min) / (ratioScale.max - ratioScale.min)) * 100;
}

const typicalViews = Math.round(trendingPost.analytics.views / trendingPost.trending.viewsRatio);

const signalRatios = [
  {
    label: "Views",
    value: trendingPost.trending.viewsRatio,
    detail: `${fullNumber.format(trendingPost.analytics.views)} vs. a typical ${typicalViews}`
  },
  {
    label: "View velocity",
    value: trendingPost.trending.velocityRatio,
    detail: "How fast new views are arriving"
  },
  {
    label: "Engagement rate",
    value: trendingPost.trending.engagementRateRatio,
    detail: "Likes, comments and shares per view"
  },
  {
    label: "Share rate",
    value: trendingPost.trending.shareRateRatio,
    detail: `${trendingPost.analytics.shares} shares on ${fullNumber.format(trendingPost.analytics.views)} views`
  }
];

function SignalBreakdown() {
  const baseline = ratioPosition(1);

  return (
    <div className="signal-breakdown">
      <div className="spotlight-subhead">
        <h3>Signal vs. your typical post</h3>
        <p>
          Compared with the last {trendingPost.trending.baselineSampleSize} TikTok posts on{" "}
          this account · log scale
        </p>
      </div>

      <div className="ratio-chart" role="list">
        {signalRatios.map((ratio) => {
          const position = ratioPosition(ratio.value);
          const isWeak = ratio.value < 1;
          return (
            <div className={isWeak ? "ratio-row weak" : "ratio-row"} key={ratio.label} role="listitem">
              <div className="ratio-label">
                <strong>
                  {ratio.label}
                  {isWeak ? <span className="weak-tag">Weak point</span> : null}
                </strong>
                <small>{ratio.detail}</small>
              </div>
              <div className="ratio-track" aria-label={`${ratio.label}: ${formatRatio(ratio.value)} typical`}>
                <span className="ratio-baseline" style={{ left: `${baseline}%` }} />
                <span
                  className="ratio-bar"
                  style={{
                    left: `${Math.min(position, baseline)}%`,
                    width: `${Math.abs(position - baseline)}%`
                  }}
                />
              </div>
              <span className="ratio-value">{formatRatio(ratio.value)}</span>
            </div>
          );
        })}
        <div className="ratio-row ratio-axis" aria-hidden="true">
          <span />
          <div className="ratio-track">
            {ratioTicks.map((tick) => (
              <span className="ratio-tick" key={tick} style={{ left: `${ratioPosition(tick)}%` }}>
                {tick === 1 ? "typical" : `${tick}×`}
              </span>
            ))}
          </div>
          <span />
        </div>
      </div>

      <div className="insight-callout">
        <Share2 aria-hidden="true" size={16} strokeWidth={2} />
        <div>
          <strong>People are watching, but not sharing</strong>
          <p>
            This clip is pulling {formatRatio(trendingPost.trending.viewsRatio)} your usual views and{" "}
            {formatRatio(trendingPost.trending.engagementRateRatio)} your usual engagement, yet it is
            shared at only {formatRatio(trendingPost.trending.shareRateRatio)} your normal rate. Add a
            share prompt such as &ldquo;Send this to a Knicks fan&rdquo; to the next clip on this topic.
          </p>
        </div>
      </div>
    </div>
  );
}

function TrendingSpotlight() {
  const expires = pacificTime.format(new Date(trendingPost.trending.expiresAt));

  return (
    <section className="surface posts-section">
      <div className="section-header">
        <div>
          <p className="eyebrow flush">Why this post is breaking out</p>
          <h2>{trendingPost.trending.reason.replace("tiktok", "TikTok")}</h2>
          <div className="status-chips">
            <TrendingBadge />
            {trendingPost.isTailingOff ? (
              <span className="status-chip warning">
                <TrendingDown aria-hidden="true" size={12} strokeWidth={2.4} />
                Momentum slowing
              </span>
            ) : null}
            <span className="status-chip">
              <Clock3 aria-hidden="true" size={12} strokeWidth={2.4} />
              Trending window closes {expires}
            </span>
          </div>
        </div>
        <a className="ghost-action" href={trendingPost.postUrl} rel="noreferrer" target="_blank">
          View on TikTok
          <ArrowUpRight aria-hidden="true" size={14} strokeWidth={2} />
        </a>
      </div>

      <Separator />

      <div className="spotlight-grid">
        <div className="creation-story">
          <div className="spotlight-subhead">
            <h3>
              <Sparkles aria-hidden="true" size={14} strokeWidth={2} />
              How Overlap made this post
            </h3>
            <p>From a long video to a breakout clip, without manual editing</p>
          </div>
          <div className="creation-body">
            <video
              className="spotlight-video"
              controls
              playsInline
              poster={trendingPost.thumbnailUrl}
              preload="none"
              src={trendingPost.mediaUrl}
            />
            <div className="creation-details">
              <ol className="creation-steps">
                {creationSteps.map((step) => (
                  <li key={step.title}>
                    <span className="step-icon">
                      <step.icon aria-hidden="true" size={13} strokeWidth={2} />
                    </span>
                    <div>
                      <strong>{step.title}</strong>
                      <small>{step.detail}</small>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="caption-preview">
                <p>{captionText}</p>
                <div className="caption-tags">
                  {captionTags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <SignalBreakdown />
      </div>
    </section>
  );
}

function ArchivePanel({ posts, data }: { posts: PostRow[]; data: RangeData }) {
  return (
    <section className="archive-panel">
      <div className="archive-tools">
        <div>
          <h2>All posts</h2>
          <p>{posts.length} posts · {data.label.toLowerCase()}</p>
        </div>
        <div className="search-shell">
          <Search aria-hidden="true" size={15} strokeWidth={2} />
          <span>Search posts...</span>
        </div>
      </div>
      <div className="archive-grid">
        <div className="archive-head">
          <span>Post</span>
          <span>Views</span>
          <span>Likes</span>
          <span>Comments</span>
          <span>Shares</span>
          <span>Eng. rate</span>
          <span>vs. typical</span>
        </div>
        {posts.map((post) => (
          <div className={post.trending ? "archive-row is-trending" : "archive-row"} key={post.id}>
            <div>
              <strong className="archive-title">
                <span>{post.title}</span>
                {post.trending ? <TrendingBadge /> : null}
              </strong>
              <small>{post.handle} · {post.platform} · {post.date}</small>
            </div>
            <span>{compactNumber.format(post.views)}</span>
            <span>{compactNumber.format(post.likes)}</span>
            <span>{compactNumber.format(post.comments)}</span>
            <span>{compactNumber.format(post.shares)}</span>
            <span>{formatPercent(engagementRate(post))}</span>
            <span className={vsTypical(post) >= 10 ? "ratio-cell breakout" : "ratio-cell"}>
              {formatRatio(vsTypical(post))}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PostsPanel({ data }: { data: RangeData }) {
  const posts = postRows
    .filter((post) => post.ageDays <= data.maxAgeDays)
    .sort((a, b) => a.ageDays - b.ageDays);

  return (
    <div className="posts-view">
      <TopPosts data={data} posts={posts} />
      <TrendingSpotlight />
      <ArchivePanel data={data} posts={posts} />
    </div>
  );
}

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("overview");
  const [range, setRange] = useState<TimeRange>("7d");
  const data = rangeData[range];

  return (
    <main className="analytics-page">
      <AppSidebar />
      <div className="analytics-container">
        <div className="page-header">
          <div className="title-block">
            <h1>Analytics</h1>
            <Separator />
          </div>

          <div className="header-controls">
            <RangeToggle onChange={setRange} range={range} />

            <div className="tab-toggle" role="tablist" aria-label="Analytics sections">
              <button
                aria-selected={activeTab === "overview"}
                className={activeTab === "overview" ? "tab-button active" : "tab-button"}
                onClick={() => setActiveTab("overview")}
                role="tab"
                type="button"
              >
                Overview
              </button>
              <button
                aria-selected={activeTab === "posts"}
                className={activeTab === "posts" ? "tab-button active" : "tab-button"}
                onClick={() => setActiveTab("posts")}
                role="tab"
                type="button"
              >
                Posts
              </button>
            </div>
          </div>
        </div>

        {activeTab === "posts" ? (
          <div className="analytics-note">
            <span>
              <Info aria-hidden="true" size={14} strokeWidth={2} />
              YouTube data has a 48 hour delay
            </span>
          </div>
        ) : null}

        {activeTab === "overview" ? <WorkspacePanel data={data} /> : <PostsPanel data={data} />}
      </div>
    </main>
  );
}
