import { CameraPreview } from "../components/CameraPreview";

export default function Home() {
  return (
    <main className="stage-shell">
      <section className="stage-header" aria-labelledby="stage-title">
        <p className="stage-kicker">Stage 1</p>
        <h1 id="stage-title">Realtime Background Blur</h1>
        <p className="stage-copy">
          Start from the live front-camera preview and implement Google Meet-style background blur in the browser.
        </p>
      </section>

      <CameraPreview />
    </main>
  );
}
