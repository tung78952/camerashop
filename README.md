# CameraShop

[![CI](https://github.com/tung78952/camerashop/actions/workflows/ci.yml/badge.svg)](https://github.com/tung78952/camerashop/actions/workflows/ci.yml)

Full-stack e-commerce store for cameras, lenses and accessories (Sony, Canon, Nikon, Fujifilm), built as a solo portfolio project.

**Live demo:** _coming soon_ · **API docs:** `/swagger-ui.html` on the backend

> The free backend instance sleeps when idle — the first request may take ~1 minute to wake up.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Customer | `demo@camerashop.local` | `demo123` |
| Admin | `admin@camerashop.local` | `admin123` |

VNPay sandbox test card: bank **NCB**, card `9704198526191432198`, name `NGUYEN VAN A`, issue date `07/15`, OTP `123456`.

## Features

- **Catalog** — products with variants (body / kit) holding their own price, SKU and stock; filter by brand, category, mount and price; multi-angle gallery; grouped technical specifications.
- **Compatibility** — lenses suggested by camera mount (Sony E, Canon RF, Nikon Z, Fujifilm X), batteries/chargers via a compatibility table.
- **Cart & checkout** — server-side pricing, order state machine (pending → shipping → completed / cancelled) with automatic restocking on cancellation.
- **Payments** — COD or **VNPay** (sandbox) with HMAC-SHA512 signing, signature verification and idempotent IPN handling; failed payments cancel the order and restore stock.
- **Auth** — stateless JWT (Spring Security resource server), token kept in an httpOnly cookie via Next.js Server Actions; customer / admin roles.
- **Reviews** — only verified buyers (a completed order containing the product) can review; one review per user per product; average rating on product cards.
- **Admin** — product management with multi-image upload (content validation, normalization, content-hash file names), hide/unhide instead of delete, order status management.
- **AI shopping assistant** — retrieval-augmented chat bot (Gemini): the backend retrieves matching in-stock products (budget, category, brand, owned camera) and grounds the answer on them; per-IP rate limiting.
- **Order emails** — sent asynchronously after the transaction commits.

## Engineering highlights

| Problem | Approach |
|---|---|
| Overselling when many customers buy the last item at once | Atomic conditional update `UPDATE … SET stock = stock - ? WHERE id = ? AND stock >= ?` inside the order transaction; covered by a concurrency test |
| Duplicate / replayed payment callbacks | Idempotent `UPDATE … WHERE payment_status = 'UNPAID'`; HMAC-SHA512 verification with constant-time comparison |
| N+1 queries on listing pages | Batched aggregate queries (price ranges, ratings) per page, `@EntityGraph` for associations |
| Race between two "first" reviews or duplicate SKUs | Service-level checks plus database `UNIQUE` constraints as the last line of defense |
| LLM hallucinating products | RAG: rule-based retrieval over the real catalog, strict system prompt, low temperature; the model is behind a `ChatModel` interface and faked in tests |
| Image storage differs between local and cloud | `ImageStorage` interface with local-disk and Cloudinary implementations selected by configuration |

## Tech stack

- **Backend:** Java 21, Spring Boot 4, Spring Security (JWT), Spring Data JPA / Hibernate, Flyway, PostgreSQL, JUnit 5 + Testcontainers
- **Frontend:** Next.js 16 (App Router, Server Components & Server Actions), TypeScript, Tailwind CSS
- **Infrastructure:** Docker Compose (Postgres + Mailpit) for local development, GitHub Actions CI, Render (backend), Vercel (frontend), Neon (database), Cloudinary (images)

```
backend/             Spring Boot REST API — controller → service → repository, DTOs, Flyway migrations
frontend/            Next.js app — server components fetch data, Server Actions call the API with the JWT cookie
docker-compose.yml   PostgreSQL + Mailpit for local development
```

## Running locally

Requirements: Docker Desktop, JDK 21, Node.js 20+.

```bash
cp .env.example .env            # fill in database credentials (optional: VNPay, Gemini keys)
docker compose up -d            # PostgreSQL :5432, Mailpit :8025

cd backend && ./mvnw spring-boot:run      # API on http://localhost:8080 (Flyway creates and seeds the schema)
cd frontend && npm install && npm run dev # web on http://localhost:3000
```

Product photos are not included in the repository (copyrighted); the UI falls back to generated placeholders.

```bash
cd backend && ./mvnw test        # integration tests on a real PostgreSQL container (Docker required)
```

## Roadmap

- Guest checkout (anonymous cart token, order lookup link by email)
- Optimistic locking (`@Version`) for admin stock edits
- Vector search (pgvector) for the assistant as the catalog grows; shared rate limiting (Redis) for multiple instances
