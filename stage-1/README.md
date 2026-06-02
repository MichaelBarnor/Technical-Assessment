# Stage 1: Realtime Background Blur

Build a Google Meet-style background blur experience that runs against the user's live front-camera feed.

## Starting Point

This stage is a small Next.js app with no backend. The existing implementation requests the user's front camera and renders the live preview in the browser.

## Candidate Task

Implement realtime background blur:

- Keep the person in the foreground sharp.
- Blur the background behind the person.
- Add a clear blur on/off control.
- Keep the camera feed responsive while processing frames.
- Handle camera permission errors and unsupported browser APIs.

You may use any client-side library or browser API, but you should be able to explain the implementation and tradeoffs.

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and allow camera access.

## Useful Files

- [app/page.tsx](./app/page.tsx) - Stage page shell.
- [components/CameraPreview.tsx](./components/CameraPreview.tsx) - Live front-camera preview.
- [app/globals.css](./app/globals.css) - Stage styling.
