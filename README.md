# Technical Assessment

This repository is organized as a two-stage frontend assessment. Each stage is isolated so candidates can work on one challenge without inheriting unrelated setup from the other stage.

## Stages

| Stage | Focus |
| --- | --- |
| [Stage 1](./stage-1) | Build a Google Meet-style realtime background blur filter for the user's front camera. |
| [Stage 2](./stage-2) | Complete the Overlap AI analytics/design test. |

## Stage 1: Camera Background Blur

Stage 1 starts from a small Next.js app with no backend. The app opens the user's front camera and renders the live video preview in the browser.

Your task is to turn this camera preview into a realtime background blur experience similar to Google Meet:

- Keep the person in the foreground sharp.
- Blur the background behind the person in realtime.
- Add a clear way to enable and disable blur.
- Keep the camera feed responsive while processing frames.
- Handle camera permission errors and unsupported browser APIs gracefully.

You may use any client-side library or browser API, but be prepared to explain the implementation and tradeoffs.

### Running Stage 1

```bash
cd stage-1
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and allow camera access when prompted.

## Stage 2: Overlap Analytics Design Test

Stage 2 starts from a hardcoded copy of an Overlap AI analytics page. Overlap AI is focused on video clipping, editing, publishing, and analytics.

Your task is to redesign or extend the analytics page so it better communicates the value Overlap provides. The page includes a provided `trendingPost` object, but you may rearrange, remove, expand, or redesign any other sections if it makes the overall analytics experience stronger.

You may change layout, visual hierarchy, cards, charts, copy, panels, drawers, sidebar treatment, and interactions. Keep the app frontend-only and keep the data hardcoded.

### Running Stage 2

```bash
cd stage-2
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Repository Notes

- Both stages are intentionally frontend-only.
- Do not add a Python backend.
- Keep submissions responsive for compact laptop and mobile widths.
- Include clear notes about your approach, tradeoffs, and browser/device assumptions.
