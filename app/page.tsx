import { RadioPlayer } from "@/components/radio-player";

export default function HomePage() {
  return (
    <main>
      <nav>
        <div className="brand">eulr<span>music</span></div>
        <a href="/api/v1/health">API status</a>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">REMOTE MUSIC FOR EULR</div>
          <h1>Focus music without making the npm package huge.</h1>
          <p>
            Audio lives in Vercel Blob. The catalog and synchronized station state are served by
            this project. Playback still happens locally inside eulr through mpv.
          </p>
          <div className="endpoint-list">
            <code>GET /api/v1/catalog</code>
            <code>GET /api/v1/now-playing</code>
            <code>GET /api/v1/health</code>
          </div>
        </div>
        <RadioPlayer />
      </section>

      <section className="how-it-works">
        <article>
          <span>01</span>
          <h3>Upload</h3>
          <p>Upload licensed audio to a public Vercel Blob store with the included script.</p>
        </article>
        <article>
          <span>02</span>
          <h3>Schedule</h3>
          <p>The station computes the current track and offset from a deterministic timeline.</p>
        </article>
        <article>
          <span>03</span>
          <h3>Play locally</h3>
          <p>eulr fetches the API and gives the remote URL plus seek offset to local mpv.</p>
        </article>
      </section>
    </main>
  );
}
