import '../styles/about.css'

function About() {
  return (
    <div className="about-page">

      <p className="about-kicker">About this project</p>

      <h1 className="about-headline">
        I built a real-time auction house to learn Go. Here's how it went.
      </h1>

      <hr className="about-divider" />

      <h2 className="about-heading">Why this exists</h2>
      <p className="about-body">
        Go kept appearing in job listings for backend roles I wanted. Not as a nice-to-have —
        as a requirement. So I decided to actually learn it rather than just read about it,
        and I wanted a project that would force me to use the bits of Go that make it
        interesting rather than just build a CRUD app in a new syntax.
      </p>
      <p className="about-body">
        An auction house felt like the right problem. When someone places a bid,
        every person watching that lot needs to see the new price immediately —
        no refresh, no polling every few seconds. That's a real concurrency problem,
        and it turns out Go handles it in a way that's genuinely different from most languages.
      </p>
      <p className="about-body">
        The frontend is React. I mostly work in Vue.js day-to-day but wanted to refresh
        my React and get more exposure to it — I'd used it before but only in a limited
        capacity and it was a few years back. So this ended up being a two-birds-one-stone
        situation: Go on the backend, React on the frontend, both getting a proper workout
        at the same time.
      </p>

      <hr className="about-divider" />

      <h2 className="about-heading">The stack</h2>
      <p className="about-body">
        Nothing exotic. React with Vite and Tailwind on the frontend. Go with the Chi router
        on the backend. SQLite for the database — simple to run locally, easy to deploy,
        and more than capable for what this needs to do. WebSockets for the real-time stuff.
      </p>

      <div className="about-tags">
        <span className="about-tag">React + Vite</span>
        <span className="about-tag">Tailwind CSS</span>
        <span className="about-tag">Go</span>
        <span className="about-tag">Chi Router</span>
        <span className="about-tag">WebSockets</span>
        <span className="about-tag">SQLite</span>
        <span className="about-tag">golang-migrate</span>
        <span className="about-tag">gorilla/websocket</span>
      </div>

      <p className="about-body">
        The frontend posts bids over a normal REST endpoint, and the backend broadcasts
        the updated lot to every connected client over WebSockets. So placing a bid is
        HTTP — fast, simple, easy to validate — and receiving updates is WebSocket —
        persistent, instant, no polling.
      </p>

      <hr className="about-divider" />

      <h2 className="about-heading">Why Go specifically</h2>
      <p className="about-body">
        The thing that actually impressed me about Go is how it handles concurrency.
        In most languages, if you want to hold thousands of simultaneous WebSocket connections
        open, you're holding thousands of OS threads — each one carrying about 1MB of overhead,
        each one requiring the operating system to context-switch between them.
        Under real load, that ceiling arrives faster than you'd think.
      </p>

      <p className="about-body">
        Go uses goroutines — lightweight tasks managed by the runtime, not the OS.
        Each one starts at around 2KB. You can have tens of thousands of them before
        you start to sweat.
      </p>

      <p className="about-body">
        The other thing worth mentioning: Meridian doesn't use any external concurrency
        libraries or worker pools. The WebSocket hub is a single goroutine running a
        select loop. Each connected client gets a read goroutine and a write goroutine.
        That's the whole model. The language provides the primitives and you just use them.
      </p>

      <hr className="about-divider" />

      <h2 className="about-heading">How the backend is structured</h2>
      <p className="about-body">
        The backend follows a layered architecture. Handler talks to service, service talks
        to repository, repository talks to the database. Each layer only knows about the layer
        below it, and only through an interface it defines itself.
      </p>

      <div className="about-flow">
        <div className="about-flow-node">Handler</div>
        <span className="about-flow-arrow">→</span>
        <div className="about-flow-node">Service</div>
        <span className="about-flow-arrow">→</span>
        <div className="about-flow-node">Repository</div>
        <span className="about-flow-arrow">→</span>
        <div className="about-flow-node">Database</div>
      </div>

      <p className="about-body">
        Go satisfies interfaces implicitly — no implements keyword, no registration.
        If your type has the right methods, it satisfies the contract. The practical
        upside is that swapping SQLite for Postgres means changing one file.
        Nothing upstream notices. Each layer is independently testable with a mock
        of the interface below it.
      </p>
      <p className="about-body">
        A few other decisions worth noting: prices are stored as int64 pence throughout —
        same as how banks handle currency, no floating point rounding errors.
        Database migrations are baked into the compiled binary via embed.FS,
        so the whole thing is self-contained when you deploy it.
      </p>

      <hr className="about-divider" />

      <h2 className="about-heading">What's missing and what I'd add at real scale</h2>
      <p className="about-body">
        Meridian is honest about its limitations. It's a portfolio project, not a production
        system, and the things it's missing are deliberate — they'd have doubled the build
        time without teaching me anything new at this stage.
      </p>

      <div className="about-scale-grid">
        <div className="about-scale-item">
          <div className="about-scale-item-title">Authentication</div>
          <div className="about-scale-item-body">Anyone can bid as anyone right now. A real auction needs users, sessions, and KYC verification before someone commits to a £2.8m Porsche.</div>
        </div>
        <div className="about-scale-item">
          <div className="about-scale-item-title">Redis Pub/Sub</div>
          <div className="about-scale-item-body">The WebSocket hub is in-memory. Scale to two server instances and they'd have isolated hubs. Redis as a pub/sub broker fixes that — every instance subscribes to the same channel.</div>
        </div>
        <div className="about-scale-item">
          <div className="about-scale-item-title">Polyglot Services</div>
          <div className="about-scale-item-body">Not everything needs Go. Laravel or Django for the boring CRUD — auth, user management, admin. Go only for the hot path where the concurrency model actually matters.</div>
        </div>
        <div className="about-scale-item">
          <div className="about-scale-item-title">Circuit Breakers</div>
          <div className="about-scale-item-body">Without one, a slow payment gateway fills your connection pool and takes everything down with it. gobreaker wraps dependencies so failures are fast and isolated.</div>
        </div>
        <div className="about-scale-item">
          <div className="about-scale-item-title">Postgres + pgBouncer</div>
          <div className="about-scale-item-body">SQLite's single-writer lock is fine here. Under real bid volume you'd want Postgres row-level locking and pgBouncer for connection pooling.</div>
        </div>
        <div className="about-scale-item">
          <div className="about-scale-item-title">Auction Timers</div>
          <div className="about-scale-item-body">Lots don't close. A real auction needs a closes_at timestamp, a background job to handle expiry, declared winners, and notifications. The plumbing is there — it just hasn't been built.</div>
        </div>
      </div>

      <div className="about-footer">Meridian — Built with React &amp; Go</div>

    </div>
  )
}

export default About
