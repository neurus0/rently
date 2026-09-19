# Architecture

Rently is a two-app JavaScript/TypeScript workspace:

- `client/`: React + Vite customer application. It uses reusable navigation, footer, product-card, authentication context and persistent cart context.
- `server/`: Express REST API. Routes are separated by auth, products, categories and cart. Prisma is the data-access layer.
- `server/prisma/`: SQLite schema and deterministic fictional demo seed.

The browser only calculates estimates for immediate feedback. The server owns product records, availability, user identity and the authenticated cart API. Phase 3 will make the server the authority for final order, payment and inventory transactions.
