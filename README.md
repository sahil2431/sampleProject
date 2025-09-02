# Announcements 2.0 – Delivery Packet

> **Status**: Frontend is live at **[https://sample-project-brown.vercel.app/](https://sample-project-brown.vercel.app/)**. Replace `https://sampleproject-pc7p.onrender.com` below with your Render API URL.

---

## 🗂 Project Structure

```
├── client (Vite + React + TS)
└── server (NestJS + TypeScript)
```

---

## 🔗 Live URLs

* **UI (Vercel):** [https://sample-project-brown.vercel.app/](https://sample-project-brown.vercel.app/)
* **API (Render):** `https://<your-api>.onrender.com` → replace everywhere in this doc as `https://sampleproject-pc7p.onrender.com`.
* **OpenAPI Docs:** `https://sampleproject-pc7p.onrender.com/docs`
* **Health:** `https://sampleproject-pc7p.onrender.com/health`

---

## ⚙️ Environment Variables

### Server (`/server`)

Create `.env`:

```
PORT=8080
NODE_ENV=production
CORS_ORIGIN=https://sample-project-brown.vercel.app
RATE_LIMIT_GLOBAL_PER_MINUTE=60
RATE_LIMIT_COMMENTS_PER_MINUTE=10
BODY_LIMIT=1mb
IDEMPOTENCY_TTL_SECONDS=300
```

### Client (`/client`)

Create `.env` (Vite expects `VITE_` prefix):

```
VITE_API_BASE=https://sampleproject-pc7p.onrender.com
```

---

## 🔒 Security Defaults

* `helmet` enabled (HSTS off on local, on in prod via platform).
* Body limit via `BODY_LIMIT`.
* Global validation pipe (whitelist + forbidNonWhitelisted) → unknown fields rejected.
* CORS restricted to `CORS_ORIGIN`.
* Rate limits: 60 req/min/IP (global) + 10 comments/min/IP.

---

## 🩺 Health & Docs

* **Health:** `GET /health` → `{ status: 'ok', timestamp }`
* **Swagger/OpenAPI:** `/docs` with request/response examples.

---

## 📦 API Contracts

Base URL: `https://sampleproject-pc7p.onrender.com`

### 1) Comments

#### Add Comment

`POST /announcements/:id/comments`

Headers:

* `Content-Type: application/json`

Body:

```json
{
  "authorName": "Jane Doe",
  "text": "Excited for this!"
}
```

Constraints:

* `authorName`: 1–100 chars
* `text`: 1–500 chars

Response `201`:

```json
{
  "id": "c_01J8...",
  "announcementId": "a_01H...",
  "authorName": "Jane Doe",
  "text": "Excited for this!",
  "createdAt": "2025-09-02T16:35:12.123Z"
}
```

#### List Comments (Cursor Pagination)

`GET /announcements/:id/comments?cursor=<commentId>&limit=20`

Response `200`:

```json
{
  "items": [
    {"id":"c_...","authorName":"Jane","text":"...","createdAt":"..."}
  ],
  "nextCursor": "c_..."  // null when end reached
}
```

---

### 2) Reactions

#### Add / Upsert Reaction (Idempotent)

`POST /announcements/:id/reactions`

Headers:

* `Content-Type: application/json`
* `X-User-Id: u_123`  // identify the actor
* `Idempotency-Key: 8a1a9c27-...` // identical requests within 5min do not duplicate

Body:

```json
{ "type": "up" } // one of: up | down | heart
```

Responses:

* `201 Created` on first write
* `200 OK` on idempotent repeat (same effect key within TTL)

`DELETE /announcements/:id/reactions`

Headers:

* `X-User-Id: u_123`

Response `204 No Content`.

---

### 3) Announcements List (Aggregates + Caching)

`GET /announcements`

Headers (client **should** send):

* `If-None-Match: W/"<etag-value>"` // when you have a cached ETag

Responses:

* `200 OK` with body & `ETag` header when data changed
* `304 Not Modified` when unchanged

Body example:

```json
[
  {
    "id": "a_01H...",
    "title": "Water supply maintenance",
    "commentCount": 5,
    "reactions": {"up": 10, "down": 1, "heart": 7},
    "lastActivityAt": "2025-09-02T16:40:00.000Z"
  }
]
```

`lastActivityAt` = max(latest comment/reaction/announcement.updatedAt).

---

## ♻️ Idempotency & Caching Details

* **Idempotency**: server stores `Idempotency-Key` per (user + endpoint + announcement) for **5 minutes**. Replays return the original result and do not duplicate side-effects.
* **ETag**: computed per `/announcements` response snapshot. Clients store it and re-send via `If-None-Match` to get `304` when unchanged.

---

## 🖥 Frontend UX Notes

* List: title, counts, last activity
* Detail: paginated comments (Load More)
* Add comment: optimistic append → rollback on failure + toast
* Reactions: optimistic counts; disabled while pending
* Real-time: SSE at `GET /announcements/:id/stream` **or** 5s polling (fallback). Client respects `VITE_POLL_INTERVAL_MS`.
* Full loading, error, empty states.

---

## 🧪 Testing

### Backend (NestJS)

**Areas**

* DTO validation (bounds, unknown fields rejected)
* Idempotency (same key returns 200 and same payload; no dupes)
* Pagination (stable order, nextCursor, end-of-list)
* Aggregates (counts, lastActivityAt)
* E2E (happy paths + error shapes)

**Commands**

```bash
cd server
npm ci
npm run lint
npm run test
npm run test:e2e
npm run test:cov  # ensure >= 80%
```

### Frontend (React)

**Areas**

* List/Detail render states (loading/empty/error)
* Optimistic updates & rollback
* Reaction buttons disabled while pending
* API mocks (MSW or fetch mocks)

**Commands**

```bash
cd client
npm ci
npm run lint
npm run test -- --coverage
```

---

## 🚀 Deployment

### Backend (Render)

* Build Command: `npm ci && npm run build`
* Start Command: `node dist/main.js`
* Environment: variables from above
* Health Check Path: `/health`
* CORS Origin: `https://sample-project-brown.vercel.app`

### Frontend (Vercel)

* Framework: Vite
* Build Command: `npm ci && npm run build`
* Output Dir: `dist`
* Env: `VITE_API_BASE=https://sampleproject-pc7p.onrender.com`

---

## 🔁 Real-time

* **SSE**: `GET /announcements/:id/stream` → `text/event-stream` with events: `comment.created`, `reaction.updated`.
* Fallback polling every 5s if SSE not available.

Client expectations:

* Reconnect on network error
* Deduplicate updates (by id) to avoid dupes when mixed with optimistic entries

---

## 🧱 In-Memory Repositories (Interface)

* `AnnouncementRepository`: CRUD + aggregates helpers
* `CommentRepository`: create, listByAnnouncement(id, {cursor, limit})
* `ReactionRepository`: upsert/remove by (announcementId, userId), breakdown per announcement
* `IdempotencyRepository`: store(key, response, ttl), get(key)

These can later be swapped with a DB implementation.

---

## 🧰 cURL Examples

### Add Comment

```bash
curl -X POST "$https://sampleproject-pc7p.onrender.com/announcements/a_01H/comments" \
  -H 'Content-Type: application/json' \
  -d '{"authorName":"Jane","text":"Great!"}'
```

### Paginate Comments

```bash
curl "$https://sampleproject-pc7p.onrender.com/announcements/a_01H/comments?limit=10&cursor=c_01J8"
```

### Add Reaction (Idempotent)

```bash
curl -X POST "$https://sampleproject-pc7p.onrender.com/announcements/a_01H/reactions" \
  -H 'Content-Type: application/json' \
  -H 'X-User-Id: u_123' \
  -H 'Idempotency-Key: 8a1a9c27-5d7d-4e7e-8e9d-cbc6a6e5b3c2' \
  -d '{"type":"heart"}'
```

### Remove Reaction

```bash
curl -X DELETE "$https://sampleproject-pc7p.onrender.com/announcements/a_01H/reactions" \
  -H 'X-User-Id: u_123'
```

### Announcements with ETag

```bash
# First fetch
ETAG=$(curl -i "$https://sampleproject-pc7p.onrender.com/announcements" | awk -F': ' '/^ETag:/ {print $2}' | tr -d '\r')

# Conditional fetch
curl -i "$https://sampleproject-pc7p.onrender.com/announcements" -H "If-None-Match: $ETAG"
```

---

## 🧾 Error Shape (Structured)

```json
{
  "code": "RATE_LIMITED",
  "message": "Too many requests",
  "details": {
    "limit": 60,
    "window": "1m"
  }
}
```


---

### Backend (NestJS)

* [ ] POST `/announcements/:id/comments` (validate + persist)
* [ ] GET `/announcements/:id/comments?cursor&limit` (pagination)
* [ ] POST `/announcements/:id/reactions` (idempotency)
* [ ] DELETE `/announcements/:id/reactions` (`X-User-Id`)
* [ ] GET `/announcements` (counts, breakdown, `lastActivityAt`, ETag)
* [ ] `/health` endpoint
* [ ] Swagger at `/docs` with examples
* [ ] Security: helmet, size limit, unknown fields rejected
* [ ] In-memory repositories via interfaces

### Frontend (React + TS)

* [ ] Announcements list (title, commentCount, reactions, lastActivityAt)
* [ ] Detail view with paginated comments (Load more)
* [ ] Add comment (validation + optimistic + rollback)
* [ ] Reactions (👍 👎 ❤️) optimistic + disabled while pending
* [ ] Real-time via SSE or 5s polling
* [ ] Loading / error / empty states everywhere

### Production

* [ ] Deployed (Render + Vercel)
* [ ] CORS restricted to UI origin
* [ ] OpenAPI docs with examples
* [ ] CI: lint, test, coverage ≥ 80%
* [ ] Tests: DTOs, idempotency, pagination, aggregates, e2e; FE states & mocks

---

## 📓 Local Development

### Server

```bash
cd server
npm ci
npm run start:dev
```

* Swagger at `http://localhost:8080/docs`

### Client

```bash
cd client
npm ci
npm run dev
```

* App at `http://localhost:5173`

---

## 🧭 Notes for Reviewers

* Real-time: if SSE is disabled on the platform, polling is enabled via `VITE_POLL_INTERVAL_MS`.
* Idempotency-Key is stored for 5 minutes; repeat requests return the original response with `200`.
* Announcements endpoint supports ETag; client sends `If-None-Match` to leverage `304 Not Modified`.
* Error responses use structured `{ code, message, details? }` consistently.

---
