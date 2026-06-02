"use client";

import Image from "next/image";
import { useState } from "react";
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
  ChartNoAxesCombined,
  Clock3,
  CreditCard,
  Eye,
  FolderKanban,
  Home,
  Info,
  Plus,
  Search,
  Settings,
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

type AnalyticsTab = "overview" | "posts";

type HeadlineMetric = {
  label: string;
  value: string;
  delta: string;
  icon: LucideIcon;
  note: string;
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

const headlineMetrics: HeadlineMetric[] = [
  {
    label: "Engagement Rate",
    value: "7.8%",
    delta: "+1.4%",
    icon: ChartNoAxesCombined,
    note: "vs last hour"
  },
  {
    label: "Average Watch Time Per Post",
    value: "0:43",
    delta: "+8.2%",
    icon: Clock3,
    note: "vs last hour"
  },
  {
    label: "Average Views Per Post",
    value: "31.6k",
    delta: "+12.7%",
    icon: Eye,
    note: "vs last hour"
  }
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

const historyRows = [
  {
    title: "How to turn a 45 minute webinar into 12 clips",
    platform: "YouTube",
    date: "Mar 29",
    views: "184k",
    likes: "8.2k",
    comments: "642",
    shares: "1.8k"
  },
  {
    title: "The fastest way to find your strongest hook",
    platform: "TikTok",
    date: "Mar 28",
    views: "141k",
    likes: "11.5k",
    comments: "904",
    shares: "3.1k"
  },
  {
    title: "Editing before and after: retention cleanup",
    platform: "Instagram",
    date: "Mar 27",
    views: "96k",
    likes: "5.4k",
    comments: "318",
    shares: "1.2k"
  },
  {
    title: "Why your product demo should start at the reveal",
    platform: "LinkedIn",
    date: "Mar 26",
    views: "74k",
    likes: "2.9k",
    comments: "186",
    shares: "624"
  }
];

const seriesRows = [
  { date: "Mar 1", views: 18200, posts: 2 },
  { date: "Mar 3", views: 24600, posts: 3 },
  { date: "Mar 5", views: 22300, posts: 2 },
  { date: "Mar 7", views: 31800, posts: 4 },
  { date: "Mar 9", views: 38900, posts: 4 },
  { date: "Mar 11", views: 44600, posts: 5 },
  { date: "Mar 13", views: 51600, posts: 4 },
  { date: "Mar 15", views: 57800, posts: 5 },
  { date: "Mar 17", views: 63900, posts: 5 },
  { date: "Mar 19", views: 70400, posts: 6 },
  { date: "Mar 21", views: 78200, posts: 5 },
  { date: "Mar 23", views: 86800, posts: 6 },
  { date: "Mar 25", views: 91600, posts: 6 },
  { date: "Mar 27", views: 104400, posts: 7 },
  { date: "Mar 29", views: 118900, posts: 7 },
  { date: "Mar 31", views: 132700, posts: 8 },
  { date: "Apr 2", views: 149300, posts: 7 },
  { date: "Apr 4", views: 164800, posts: 8 },
  { date: "Apr 6", views: 181900, posts: 8 },
  { date: "Apr 8", views: 202400, posts: 9 }
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

function SignalGraph() {
  return (
    <ChartContainer
      aria-label="All time views chart"
      className="signal-chart"
      config={seriesConfig}
    >
      <AreaChart
        accessibilityLayer
        data={seriesRows}
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
          interval={4}
          minTickGap={24}
          tickLine={false}
          tickMargin={12}
        />
        <YAxis
          domain={["dataMin - 12000", "dataMax + 12000"]}
          hide
          yAxisId="views"
        />
        <YAxis domain={[0, 10]} hide orientation="right" yAxisId="posts" />
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

function WorkspacePanel() {
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
                <strong>{stat.value}</strong>
                <span>{stat.delta}</span>
              </div>
              <small>{stat.note}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="surface primary-surface">
        <div className="surface-header">
          <div className="surface-title">
            <p className="eyebrow">All time views</p>
            <div className="headline-row">
              <strong>12,842,912</strong>
              <span className="lift-badge">+18.6%</span>
            </div>
          </div>

          <div className="control-cluster" aria-label="Analytics controls">
            <button className="pill-select" type="button">All Platforms</button>
            <div className="range-shell">
              {["LIVE", "7d", "14d", "30d", "All Time"].map((range) => (
                <button
                  className={range === "All Time" ? "range-chip active" : "range-chip"}
                  key={range}
                  type="button"
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        <div className="surface-grid">
          <div className="visual-pane">
            <div className="legend-strip">
              <span><i />Views</span>
              <span><i className="dot-marker" />Posts</span>
            </div>
            <SignalGraph />
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

function ArchivePanel() {
  return (
    <section className="archive-panel">
      <div className="archive-tools">
        <div>
          <h2>Posts</h2>
          <p>Search and inspect post-level analytics.</p>
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
        </div>
        {historyRows.map((post) => (
          <div className="archive-row" key={post.title}>
            <div>
              <strong>{post.title}</strong>
              <small>{post.platform} · {post.date}</small>
            </div>
            <span>{post.views}</span>
            <span>{post.likes}</span>
            <span>{post.comments}</span>
            <span>{post.shares}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("overview");

  return (
    <main className="analytics-page">
      <AppSidebar />
      <div className="analytics-container">
        <div className="page-header">
          <div className="title-block">
            <h1>Analytics</h1>
            <Separator />
          </div>

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

        {activeTab === "posts" ? (
          <div className="analytics-note">
            <span>
              <Info aria-hidden="true" size={14} strokeWidth={2} />
              YouTube data has a 48 hour delay
            </span>
          </div>
        ) : null}

        {activeTab === "overview" ? <WorkspacePanel /> : <ArchivePanel />}
      </div>
    </main>
  );
}
