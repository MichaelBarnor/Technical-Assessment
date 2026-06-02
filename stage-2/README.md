# Stage 2: Analytics Page + Trending Post

This stage starts with a hardcoded copy of the Overlap Analytics page. The app is intentionally frontend-only: no auth, Firebase, API routes, backend services, or company context.

## Goal

Redesign or extend the analytics page in whatever way best communicates value to an Overlap AI customer. The provided `trendingPost` should be represented thoughtfully, but you are not limited to adding a single post module.

Overlap helps users turn video content into clips, publish those clips, and understand what is working. The Analytics page should make that value obvious. A user should be able to open the page and quickly understand:

- Which post is breaking out.
- Why the post matters.
- What signal Overlap detected.
- What action or insight the user should take next.
- How the broader analytics experience should be organized around those insights.

## Candidate Task

Use the provided `trendingPost` object below and adjust the UI in any way you deem fit. You may redesign as much of the page as you want, including sections that are not directly about the trending post, if doing so makes the overall product experience stronger.

You may change:

- Layout and visual hierarchy.
- The chart, cards, tables, panels, and sidebar.
- Copy, labels, empty states, and helper text.
- How the post is highlighted.
- Which analytics are emphasized.
- How sections are grouped, reordered, removed, or expanded.
- The page information architecture and primary workflow.
- Interactions such as drawers, tabs, hover states, or detail panels.

Constraints:

- Keep the data hardcoded.
- Keep the app frontend-only.
- Do not add a Python backend or external service dependency.
- Keep the experience responsive for compact laptop and mobile widths.
- The result should aesthetically match the existing Overlap/shadcn-inspired direction.

## Evaluation

We are looking for product and UI judgment more than a single correct answer. Strong submissions will make the trending post feel native to a redesigned analytics experience, show clear value to the user, and improve the overall page rather than simply placing the object somewhere on the existing layout.

## Trending Post Data

Firestore timestamps have been represented as ISO strings so this can be copied directly into the Next.js app.

```ts
export const trendingPost = {
  action: "scheduled",
  analytics: {
    averageWatchTime: 33.81,
    comments: 30,
    likes: 140,
    shares: 3,
    views: 8469
  },
  awsUrl:
    "https://s3-overlap-cdn.s3.us-east-1.amazonaws.com/rendered-videos/1780268150594-exported-videos/exported-6e32f988-a389-4fc5-9a78-a9437c8f23f4-1780268150594.mp4",
  created: "2026-05-31T22:56:49Z",
  createdAt: "2026-05-31T15:56:06-07:00",
  engagementScore: 466.69,
  errors: [],
  final_post_text:
    "Colin Cowherd says Wemby is the best player in a potential Knicks-Spurs Finals — but New York is coming to make it ugly 👀 Can the Spurs handle the physicality, or does Wemby rise to the moment? #NBA #Wembanyama #Knicks #Spurs #ColinCowherd",
  isTailingOff: true,
  isVideo: true,
  lastAnalyticsUpdate: "2026-06-01T16:44:55-07:00",
  lastGrowthRate: 0.04,
  lastUpdated: "2026-05-31T15:56:50-07:00",
  mediaUrl:
    "https://s3-overlap-cdn.s3.us-east-1.amazonaws.com/rendered-videos/1780268150594-exported-videos/exported-6e32f988-a389-4fc5-9a78-a9437c8f23f4-1780268150594.mp4",
  mediaUrls: [
    "https://s3-overlap-cdn.s3.us-east-1.amazonaws.com/rendered-videos/1780268150594-exported-videos/exported-6e32f988-a389-4fc5-9a78-a9437c8f23f4-1780268150594.mp4"
  ],
  platform: "tiktok",
  platforms: ["tiktok"],
  post:
    "Colin Cowherd says Wemby is the best player in a potential Knicks-Spurs Finals — but New York is coming to make it ugly 👀⁣ Can the Spurs handle the physicality, or does Wemby rise to the moment? #NBA #Wembanyama #Knicks #Spurs #ColinCowherd",
  postIds: [
    {
      isVideo: true,
      mediaUrls: [
        "https://s3-overlap-cdn.s3.us-east-1.amazonaws.com/rendered-videos/1780268150594-exported-videos/exported-6e32f988-a389-4fc5-9a78-a9437c8f23f4-1780268150594.mp4"
      ],
      platform: "tiktok",
      postUrl: "https://www.tiktok.com/@volumebball/video/7646193478434688269",
      status: "success"
    }
  ],
  postUrl: "https://www.tiktok.com/@volumebball/video/7646193478434688269",
  posts: [
    {
      errors: [],
      post:
        "Colin Cowherd says Wemby is the best player in a potential Knicks-Spurs Finals — but New York is coming to make it ugly 👀⁣ Can the Spurs handle the physicality, or does Wemby rise to the moment? #NBA #Wembanyama #Knicks #Spurs #ColinCowherd",
      postIds: [
        {
          id: "pending",
          idShare: "v_pub_url~v2.7646193263808055310",
          isVideo: true,
          platform: "tiktok",
          status: "success"
        }
      ],
      status: "success"
    }
  ],
  source: "user",
  status: "success",
  subAction: "tikTokPublished",
  text:
    "Colin Cowherd says Wemby is the best player in a potential Knicks-Spurs Finals — but New York is coming to make it ugly 👀 Can the Spurs handle the physicality, or does Wemby rise to the moment? #NBA #Wembanyama #Knicks #Spurs #ColinCowherd",
  thumbnailUrl:
    "https://s3-overlap-cdn.s3.us-east-1.amazonaws.com/rendered-videos/1780262337546-exported-thumbnails/exported-6e32f988-a389-4fc5-9a78-a9437c8f23f4-1780262337546.png",
  tikTokPublished: true,
  timeStamp: 1780268209,
  timestamp: "2026-05-31T22:56:49.956592",
  trending: {
    active: true,
    analyticsSnapshotId: "2026-06-01T21:59:47.163417+00:00",
    baselineSampleSize: 185,
    baselineScope: "accountPlatform",
    elapsedHours: 0.2828,
    engagementRateRatio: 1.7459,
    engagementScore: 466.69,
    expiresAt: "2026-06-01T19:21:09-07:00",
    growthRate: 0.04,
    lowAccountBreakout: true,
    metricDeltas: {
      comments: 2,
      likes: 4,
      shares: 1,
      views: 20
    },
    metrics: {
      averageWatchTime: 33.81,
      comments: 30,
      likes: 140,
      shares: 3,
      views: 8469
    },
    platforms: ["tiktok"],
    reason: "Breaking out for this tiktok account: 8,469 views vs a typical 32.",
    runId: "2026-06-02T00:21:09.271936+00:00",
    score: 50.8754,
    scoreDelta: 0.2,
    shareRateRatio: 0.3542,
    source: "score_trending_posts",
    updatedAt: "2026-06-01T17:22:24-07:00",
    velocityRatio: 53.041,
    viewsRatio: 264.6562
  },
  trendingCandidateUntil: "2026-06-01T21:21:09-07:00",
  trendingSignals: {
    commentsDelta: 0,
    elapsedHours: 0.2828,
    engagementDelta: 0.2,
    engagementScore: 466.69,
    growthRate: 0.04,
    isTailingOff: true,
    likesDelta: 0,
    platform: "tiktok",
    scoreDelta: 0.2,
    sharesDelta: 0,
    updatedAt: "2026-06-01T14:59:47-07:00",
    views: 8469,
    viewsDelta: 20
  }
} as const;
```

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful Files

- [app/page.tsx](./app/page.tsx) - Stage page shell.
- [components/AnalyticsDashboard.tsx](./components/AnalyticsDashboard.tsx) - Hardcoded Analytics page copy.
- [components/ui/chart.tsx](./components/ui/chart.tsx) - shadcn-style chart helpers.
- [app/globals.css](./app/globals.css) - Stage styling.
