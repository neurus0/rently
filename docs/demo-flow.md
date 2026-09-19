# Rently — Complete Demo Guide, Architecture & Q&A

This document provides a complete guide on how to start Rently, navigate Customer, Seller, and Admin portals, inspect SQLite data, review live analytics, and answer essential architectural and workflow questions.

---

## 🚀 1. How to Run the Website

From the root project directory (`c:\Users\rajde\OneDrive\Desktop\RAJDEEEP MAITY\projects\Rently`), run:

```bash
npm run dev
```

This starts both the backend API server and frontend client concurrently:
- **Client (Frontend)**: [http://localhost:5173](http://localhost:5173)
- **API Server (Backend)**: [http://localhost:4000](http://localhost:4000) (Health check: [http://localhost:4000/api/health](http://localhost:4000/api/health))

> **Initial Setup (if needed)**:
> If running on a fresh clone or reset database:
> ```bash
> cd server && npx prisma migrate deploy && npm run seed
> ```

---

## 🔑 2. Demo User Credentials

All demo accounts share the password `rently123`:

| Role | Email | Password | Access & Purpose |
|---|---|---|---|
| **Admin** | `admin@rently.demo` | `rently123` | Master control console, GMV metrics, user & seller moderation, order overrides, marketing campaigns |
| **Seller 1** | `vikram@apexrental.demo` | `rently123` | **Apex Heavy Rentals** — Industrial tools, stock manager, CSV importer, order milestones |
| **Seller 2** | `priya@cinegear.demo` | `rently123` | **CineGear Studio** — Professional cameras, lighting, sound & DJ equipment |
| **Customer** | `aarav.sharma@example.com` | `rently123` | Renter account with active rental orders, order history & live tracking |

---

## 📊 3. How to See Statistics & Analytics

Rently features interactive charts built with **Recharts**:

1. **Admin Master Analytics**:
   - Log in as `admin@rently.demo` / `rently123`.
   - Go to [http://localhost:5173/admin/analytics](http://localhost:5173/admin/analytics) or click **Revenue Analytics** in the admin sidebar.
   - **What you'll see**:
     - **Revenue Trajectory Area Chart**: Monthly gross turnover vs. 10% platform commission fee.
     - **Category Performance Bar Chart**: Revenue ranking across all 16 categories.
     - **Geographic Demand Bar Chart**: Booking volumes broken down by metro city (Mumbai, Bengaluru, Delhi, etc.).
     - **Demographics Donut Chart**: Gender & Age distribution of renters.
     - **Top Performing Products**: Leaderboard of the most rented gear.

2. **Seller Store Analytics**:
   - Log in as `vikram@apexrental.demo` / `rently123`.
   - Go to [http://localhost:5173/seller/analytics](http://localhost:5173/seller/analytics) or click **Store Analytics** in the seller sidebar.
   - **What you'll see**: Filtered analytics specific to that seller shop's equipment turnover, orders, and clients.

---

## 🏪 4. How to See the Seller Side

Log in with `vikram@apexrental.demo` (or click **Seller Hub** in the navbar):

1. **Dashboard** (`/seller`): Real-time metrics on rental income, active customer rentals, low inventory alerts, and recent incoming orders.
2. **Products & CSV Import** (`/seller/products`):
   - Add new equipment listings with photos, condition, daily price, and deposit.
   - **Bulk CSV Upload**: Click *Bulk CSV Import*, paste or load the template data, and import multiple items in one click.
3. **Inventory Stock Management** (`/seller/inventory`):
   - Health meters showing available vs. rented-out equipment.
   - Quick **`+` / `-` buttons** to adjust stock levels in real time.
4. **Orders & Fulfillment Stepper** (`/seller/orders`):
   - Advance milestone statuses: `READY_FOR_PICKUP` &rarr; `DISPATCHED` &rarr; `DELIVERED` &rarr; `IN_USE` &rarr; `RETURN_INITIATED` &rarr; `COMPLETED`.
   - Attach custom courier/inspection notes which immediately notify the renter.

---

## 🛡️ 5. How to See the Admin Side

Log in with `admin@rently.demo` (or click **Admin** in the navbar):

1. **Master Dashboard** (`/admin`): Key aggregates (Gross Volume, Platform Commissions, Total Bookings, Registered Users).
2. **Users & Role Assignment** (`/admin/users`): Search user directory, inspect email/phone/city, and change roles (`CUSTOMER`, `SELLER`, `ADMIN`).
3. **Seller Approvals Queue** (`/admin/sellers`): Review vendor store applications and toggle statuses (`APPROVED`, `SUSPENDED`, `REJECTED`).
4. **Catalog Moderation** (`/admin/products`): Audit 52+ listings, toggle visibility between `ACTIVE` and `INACTIVE`.
5. **Orders Audit** (`/admin/orders`): Oversee all marketplace bookings with administrative status overrides.
6. **Payment Transactions Ledger** (`/admin/payments`): Transaction audit trail with unique transaction IDs (`TXN-...`) and gateway statuses.
7. **Marketing Campaigns** (`/admin/marketing`): Audience segmentation (All users, Marketing Opt-ins, Active Renters, Sellers) and simulated promotional campaign dispatch.

---

## 🗄️ 6. How to See the SQL Database (Where All Data is Stored)

Rently uses **SQLite** managed via **Prisma ORM**.
The physical database file is stored at:
`server/prisma/dev.db`

### Visual GUI Explorer (Prisma Studio)
To inspect and edit all database tables in a visual browser UI:

1. Open a new terminal in the `server` directory:
   ```bash
   cd server
   npx prisma studio
   ```
2. Prisma Studio will open automatically at **[http://localhost:5555](http://localhost:5555)**.
3. You can click on any table (`User`, `Seller`, `Product`, `Category`, `Order`, `OrderItem`, `Payment`, `TrackingEvent`, `Notification`, `Campaign`) to view, filter, sort, edit, or delete records live.

### Direct SQLite CLI / VS Code Extensions
- You can also open `server/prisma/dev.db` using the **SQLite Viewer** or **Database Client** extensions in VS Code / Cursor / IDE.

---

## 🛒 7. End-to-End Customer Booking Flow

1. Open [http://localhost:5173](http://localhost:5173).
2. Click **Browse** or select a category (e.g. *Cameras & Production* or *Power Tools*).
3. Click a product card (e.g. *Sony FX3 Cinema Camera*).
4. Select your rental start & return dates, choose quantity, and click **Add to Cart**.
5. Open your cart at `/cart`, verify the live calculation of **Rental Charges** vs. **Refundable Security Deposit**, then click **Proceed to Checkout**.
6. Log in as `aarav.sharma@example.com` / `rently123`.
7. Click **Proceed to Payment**.
8. Choose a demo payment method (**UPI / QR**, **Card**, or **Net Banking**) and click **Authorise Demo Payment**.
9. You will be redirected to the **Order Confirmation** page with your order breakdown and unique tracking code (`RNT-XXXXXX`).
10. Click **Track Package Milestones** (or go to `/tracking`) to see the live stepper and timestamped timeline.
11. Check the **Notification Bell** in the top navbar to see real-time order and payment alerts.

---

## ❓ 8. Comprehensive Questions & Answers (FAQ)

### Q1: How does Rently handle security deposits and inventory stock?
**A**: When a customer places an order:
1. The backend verifies that `availableStock >= requestedQuantity` for all items.
2. The order is created, and `Product.availableStock` is immediately decremented by the booked quantity.
3. The security deposit is collected and held in escrow.
4. When the seller completes the return inspection (`COMPLETED` or `CANCELLED`), the inventory stock is automatically incremented back to the store.

### Q2: How does the 10% platform commission work?
**A**: For every rental order, Rently calculates `commissionAmount = round(rentalAmount * 0.10)`. This allows the platform owner to track gross platform revenue vs. net platform commission earnings in the Admin & Analytics dashboards.

### Q3: What happens when an order status is updated by a seller or admin?
**A**: Two things happen automatically:
1. A new `TrackingEvent` record is inserted with a timestamp, status key, and human-readable milestone note.
2. A new in-app `Notification` is created for the renter, which increments the unread notification badge on the bell icon in real time.

### Q4: How does the CSV bulk upload work for sellers?
**A**: In `/seller/products`, sellers can paste CSV rows formatted as:
`name, categorySlug, pricePerDay, securityDeposit, totalStock, location, condition, description`
The backend automatically resolves the category slugs, creates the products under the authenticated seller's store ID, and initializes inventory counts.

### Q5: How do role permissions work?
**A**: User roles (`CUSTOMER`, `SELLER`, `ADMIN`) are encoded in JWT tokens and enforced on both the backend via Express middleware (`authenticate`, `authorize('ADMIN')`, `authorize('SELLER')`) and on the client via React Router route guards.
