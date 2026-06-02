# Meridian

A real-time luxury car auction platform built as a CV/portfolio piece to learn React and Go. You can browse lots, place bids, and watch the prices update live across multiple browser tabs via WebSockets.

**Live demo:** _coming soon_

---

## What it is

Meridian is a full-stack auction house application with a premium aesthetic — think Christie's or RM Sotheby's rather than eBay. Eight fictional luxury car lots are seeded into the database on first run. Anyone who has the site open can place a bid and everyone else sees the new price instantly without refreshing the page.

The frontend is React + Vite + Tailwind CSS. The backend is Go. They talk to each other over a REST API for placing bids and a WebSocket connection for receiving live updates.

---

## Tech stack

**Frontend**
- React 18 + Vite
- Tailwind CSS
- react-router-dom (client-side routing)

**Backend**
- Go with the Chi router
- SQLite (via go-sqlite3, requires CGO)
- gorilla/websocket
- golang-migrate (database migrations)
- go-cache (in-memory caching)

---

## Prerequisites

Before you start you'll need:

- **Node.js** (v18 or higher) — [nodejs.org](https://nodejs.org)
- **Go** (v1.21 or higher) — [go.dev/dl](https://go.dev/dl)
- **TDM-GCC** (Windows only) — go-sqlite3 requires a C compiler. Download from [jmeubank.github.io/tdm-gcc](https://jmeubank.github.io/tdm-gcc). On Mac you just need Xcode Command Line Tools (`xcode-select --install`). On Linux you need `gcc` (`sudo apt install gcc`).

---

## Installation

Clone the repo and install dependencies for both ends.

```bash
git clone https://github.com/PursDios/testBidding.git
cd testBidding
```

**Frontend**
```bash
cd frontend
npm install
```

**Backend**
```bash
cd backend
go mod download
```

---

## Running locally

You'll need two terminals open — one for each end.

**Terminal 1 — Backend**
```bash
cd backend
go run ./cmd/server
```

The server starts on `http://localhost:8080`. On first run it creates the SQLite database, runs the migration, and seeds the 8 car lots automatically.

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
```

The frontend starts on `http://localhost:5173`. Open it in your browser and you're good to go.

To test the real-time bidding, open the same URL in a second browser tab and place a bid — you'll see the price update on the other tab without refreshing.

---

## Project structure

```
bidding/
├── frontend/
│   └── src/
│       ├── components/       # Navigation, BidModal
│       ├── hooks/            # useWebSocket
│       ├── pages/            # Auctions, About, Contact
│       ├── styles/           # All CSS in one place
│       └── router.jsx
└── backend/
    ├── cmd/server/           # Entry point
    ├── db/                   # Connection, migrations, seeder
    └── internal/
        ├── handler/          # HTTP handlers
        ├── hub/              # WebSocket hub
        ├── model/            # Structs
        ├── repository/       # Database queries
        └── service/          # Business logic
```

The backend follows a layered architecture: handler → service → repository → model. Each layer only knows about the layer below it through interfaces, which keeps things testable and easy to swap out.

---

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | Returns all auction lots |
| POST | `/api/bids` | Places a bid |
| GET | `/ws` | WebSocket connection for live updates |
| GET | `/images/*` | Serves car images |

**POST /api/bids** expects JSON:
```json
{
  "itemId": "uuid-here",
  "amount": 95000000
}
```
Amount is in pence. No floating point nonsense.

---

## Why Go?

Honestly — job listings. Go kept appearing in roles I was interested in and I wanted to understand what the fuss was about. Turns out the fuss is justified, at least for this kind of problem.

The thing that genuinely impressed me was how Go handles concurrency. In most languages, holding thousands of simultaneous WebSocket connections means thousands of threads or processes, which gets expensive fast — each one carries real memory overhead and the OS has to context-switch between them constantly. Go sidesteps this entirely with goroutines, which are lightweight concurrent tasks managed by the Go runtime rather than the operating system. A goroutine costs about 2KB of memory to start versus ~1MB for a typical OS thread. In practice that means a single Go server can hold tens of thousands of open connections without breaking a sweat.

Importantly, this project doesn't use any external concurrency libraries or worker pool packages — the hub runs a single goroutine with a `select` loop, and each WebSocket client gets its own read and write goroutines. That's it. The concurrency is built into the language itself rather than bolted on.

The other thing that clicked for me was interfaces. Go's implicit interface satisfaction — where a type satisfies an interface just by having the right methods, with no `implements` keyword — sounds like a small detail but it fundamentally changes how you structure code. Each layer in this project only knows about the layer below it through an interface it defines itself. That makes the whole thing trivially testable and means you can swap implementations (SQLite → Postgres, in-memory cache → Redis) without touching anything upstream.

---

## Configuration

Right now the API URLs are hardcoded for local development. If you're deploying or pointing the frontend at a different backend, here's where to change things:

**Frontend** — all API calls are in two files:
- [src/pages/Auctions.jsx](frontend/src/pages/Auctions.jsx) — the initial `fetch` for items and the WebSocket URL in `useWebSocket`
- [src/components/BidModal.jsx](frontend/src/components/BidModal.jsx) — the `fetch` for placing bids

Search for `http://localhost:8080` and `ws://localhost:8080` and replace with your deployed backend URL. For a proper setup you'd move these into a `.env` file and reference them as `import.meta.env.VITE_API_URL`.

**Backend** — the CORS allowed origins are in [backend/cmd/server/main.go](backend/cmd/server/main.go):
```go
AllowedOrigins: []string{"http://localhost:5173"},
```
Add your deployed frontend URL here when deploying, otherwise the browser will block all API requests.

---

## Limitations

**SQLite** — SQLite is a single-writer database, which means it handles concurrent bids safely (one wins, the rest get rejected) but it's not going to scale to thousands of simultaneous writes. It's fine for a demo or low-traffic use but you'd swap it for Postgres in a real production environment.

**Single server instance** — The WebSocket hub lives in memory on the server process. If you scaled this horizontally to multiple server instances, a bid placed on machine A would only notify clients connected to machine A. Clients on machine B would be left in the dark.

**No authentication** — Anyone can bid as anyone. There's no concept of users, accounts, or sessions. In a real auction you'd want identity, bid history, and probably KYC verification before someone can throw £2.8 million at a 1970 Porsche 917K.

**No auction end time** — Lots don't close. The auction runs forever until you hit reset. Real auctions have a countdown and a winner.

**Reset is manual** — There's a planned reset endpoint but no timer or scheduler. Someone has to press the button.

---

## What I'd do differently at real scale

**Swap SQLite for Postgres** — Row-level locking with `SELECT FOR UPDATE` gives you much finer-grained concurrency control than SQLite's table-level write lock. You'd also get proper connection pooling with pgBouncer.

**Add Redis for pub/sub** — Right now the WebSocket hub is in-memory. Putting Redis in as a pub/sub broker means every server instance subscribes to the same channel, so broadcasts reach every connected client regardless of which machine they're on. This is what makes horizontal scaling actually work.

**Add authentication** — JWT tokens or sessions. You'd want a `users` table, login/register endpoints, and the bid tied to a user ID so you have a proper audit trail of who bid what and when. Plus KYC verification before anyone can bid on anything serious.

**Auction timers** — Each lot should have a `closes_at` timestamp. A background goroutine (or a proper job queue like Asynq) would handle closing lots, declaring winners, and sending notifications.

**Rate limiting** — Without it, nothing stops someone from hammering the bid endpoint in a loop. go-chi has rate limiting middleware that makes this straightforward to add.

**Tests** — The layered architecture with interfaces was deliberately set up to make testing easy. Each layer can be tested in isolation with a mock of the layer below it. That work just hasn't been done yet.

**Litestream** — If you wanted to keep SQLite and still have some resilience, Litestream streams your SQLite database to S3 in real time. It's a neat middle ground before committing to Postgres.

---

## How I'd architect this at real scale

This is where it gets interesting. The whole application is one Go binary right now — that's fine for a demo but at real scale you'd want to think about where the pressure points are and split responsibilities accordingly.

**The polyglot approach — right tool for the right job**

Not everything needs to be Go. A more realistic production stack might actually use multiple languages deliberately:

- **Laravel (PHP) or Django (Python) handles the slow, boring stuff** — user accounts, authentication, lot management, the admin dashboard, emails, payment processing. These are standard request/response flows that don't need microsecond performance. Laravel especially is brilliant for this: Eloquent ORM, built-in queues, scheduled tasks, and a mature ecosystem. I think it makes sense to use it for the 80% of the application that isn't performance-critical. You'd be done in a fraction of the time compared to building the same thing in Go.

- **Go handles the hot path** — bid processing and the WebSocket hub. When 500 people are watching the same lot and bids are flying in, you want a language that can hold tens of thousands of concurrent WebSocket connections without breaking a sweat. Go's goroutine model is genuinely exceptional here — each connection costs about 2KB of memory versus PHP/Python which would spawn a new process or thread per request. Under that kind of concurrency, a traditional framework would fall over.

So in practice: a user logs in via Laravel, receives a JWT, then connects to the Go service with that token to participate in live bidding. The two services share the same Postgres database. Laravel owns the schema and migrations; Go only touches the tables it needs for bid processing.

**Circuit breakers**

A circuit breaker sits in front of any dependency your application relies on — your database, a payment gateway, a third-party fraud detection API — and trips open if that dependency starts failing. Once open, calls fail immediately instead of queuing up and timing out, which stops one slow service from cascading and taking down everything else.

Imagine the payment gateway goes down mid-auction. Without a circuit breaker, every bid attempt that triggers a payment check blocks for 30 seconds waiting for a timeout. Your connection pool fills up, requests queue, and the whole application grinds to a halt even though the bidding database is perfectly healthy. With a circuit breaker, after a handful of failures it trips open, returns an error instantly, and only tries again after a cooldown period. The rest of the application keeps running.

In Go, `github.com/sony/gobreaker` is the standard library for this. You'd wrap database calls and any external service calls behind it. The same pattern exists in Laravel via packages or a manual implementation. The concept is language-agnostic — it's just a state machine that counts failures.

**What the infrastructure would actually look like**

```
                        ┌─────────────────┐
                        │   Cloudflare    │  (DDoS protection, CDN, WAF)
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │  Load Balancer  │  (nginx / AWS ALB)
                        └────┬───────┬────┘
                             │       │
              ┌──────────────▼─┐   ┌─▼──────────────┐
              │  Laravel API   │   │  Go Bid Service  │
              │  (auth, users, │   │  (WebSockets,    │
              │   lots, admin) │   │   bid processing)│
              └──────┬─────────┘   └────────┬─────────┘
                     │                      │
              ┌──────▼──────────────────────▼──────┐
              │              Postgres               │
              └──────────────────┬─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │      Redis      │  (pub/sub for WS broadcasts,
                        └─────────────────┘   session cache, rate limiting)
```

The React frontend is just static files — built once, deployed to a CDN like Cloudflare Pages or GitHub Pages. It never talks directly to the database, only to the two API services.

**Horizontal scaling**

With this setup, both services are stateless — all shared state lives in Postgres and Redis, not in memory on any individual server. That means you can run as many instances of each service as you need behind the load balancer and it doesn't matter which instance handles any given request.

Go's WebSocket hub would push bid events to a Redis channel instead of broadcasting locally. Every Go instance subscribes to that same channel, so regardless of which server a client is connected to, they all receive the same messages. Spin up ten Go instances during a high-profile auction, scale back to one overnight.

**Where this project sits on that journey**

This demo is essentially the Go bid service in isolation — no auth, no Laravel layer, SQLite instead of Postgres, no circuit breakers. But the architecture is deliberately shaped so those pieces could be added without rewriting everything. The handler → service → repository layering exists precisely so you can swap the SQLite repository for a Postgres one without touching the handlers. The WebSocket hub is already in its own package, ready to have Redis wired in behind it.
