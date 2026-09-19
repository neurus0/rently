# Rently

Rently is a full-stack equipment-rental marketplace prototype built for a college e-business project. It demonstrates how customers can discover equipment, choose rental dates, add equipment to a persistent cart, and prepare for checkout. Payments, order creation, and inventory settlement are deliberately deferred to Phase 3.

## Current features — Phase 1 + Phase 2

- React/Vite customer experience with responsive home, listing, product detail, cart, checkout, account, login and signup screens.
- Express + Prisma + SQLite API, secure password hashing, JWT session authentication, and server-side role-aware middleware.
- Database-backed categories, products, sellers, users, historical orders/payments, and cart schema.
- Product search, category/location/price/availability filters and price sorting.
- Rental date and quantity controls with estimated rental charges and security deposits.
- Persistent browser cart; authenticated cart endpoints are ready for server-cart integration.
- 28 fictional equipment listings across 8 categories, 3 demo sellers and historical demo orders.

## Technology

React, TypeScript, Vite, Express, Prisma ORM, SQLite, JSON Web Tokens, bcryptjs, and Lucide icons.

## Run locally

```bash
npm install
npm run setup
npm run dev
```

Open `http://localhost:5173`. The API health check is `http://localhost:4000/api/health`.

Other commands: `npm run typecheck`, `npm run build`, `npm run db:migrate`, and `npm run seed`.

## Demo accounts

All demo accounts use password `Rently@123`.

| Role | Email |
| --- | --- |
| Admin | admin@rently.demo |
| Customer | ananya@demo.rently |
| Seller | aarav@toolhub.demo |

## Customer flow

Home → browse/search → filter → product details → select dates and quantity → cart → checkout → Phase 3 demo payment placeholder.

## Available API endpoints

- `GET /api/health`
- `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/categories`
- `GET /api/products`, `GET /api/products/:id`, `GET /api/products/:id/availability`
- `GET|POST /api/cart`, `PATCH|DELETE /api/cart/:id` (authenticated)

## Project status

Phase 2 is the current customer marketplace milestone. Phase 3 will add authoritative checkout validation, order creation, simulated payment, inventory updates and order confirmation. No real payment or delivery is performed by this prototype.

## Product imagery

Customer product images are stored locally in `client/public/images/products` and referenced from the seeded `Product.images` data, so the storefront does not hotlink remote media. The initial curated images are downloaded from Unsplash under the Unsplash License; see `docs/image-sources.md` for source records. Product cards and details include a graceful visual fallback when an image is unavailable.
