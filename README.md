# Rently — Equipment Rental Marketplace

Rently is a full-stack equipment-rental marketplace prototype developed for a college E-Business project. Users can discover equipment, browse categories, view product details, select rental dates and quantities, manage a persistent cart, and proceed toward checkout.

## Project Architecture

Rently uses a decoupled full-stack architecture:

```text
User Browser
    |
    v
React + Vite Frontend (Vercel)
    |
    | HTTP API Requests
    v
Express Backend API (Vercel)
    |
    | Prisma ORM
    v
Neon PostgreSQL Database
```

The project is deployed through two separate Vercel projects:

- **Frontend Vercel project:** Hosts the React/Vite application.
- **Backend Vercel project:** Hosts the Express API and connects to Neon PostgreSQL through Prisma.

## Live Deployment

- **Frontend:** https://rently-frontend-lilac.vercel.app/
- **Backend:** https://rently-server-ten.vercel.app/
- **Backend health check:** https://rently-server-ten.vercel.app/api/health
- **GitHub repository:** https://github.com/neurus0/rently

Deployment URLs may change if the Vercel projects are renamed or redeployed.

## Features

### Customer Experience

- Responsive React/Vite interface
- Home, listing, product details, cart, checkout, account, login, and signup screens
- Product search
- Category, location, price, and availability-related filtering
- Price sorting
- Rental date and quantity selection
- Estimated rental charges and security deposits
- Persistent browser-based cart
- Checkout interface with payment placeholder

### Authentication and Authorization

- User signup and login
- Password hashing using `bcryptjs`
- JWT-based authentication
- Authenticated session handling
- Role-aware server-side middleware
- Customer, seller, and admin roles

### Backend and Database

- Express REST API
- Prisma ORM
- Neon-hosted PostgreSQL database
- Database-backed users, categories, products, sellers, carts, orders, and payments
- Product availability endpoint
- Authenticated cart endpoints
- Database migration and seed scripts

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- CSS
- Lucide icons

### Backend

- Node.js
- Express
- TypeScript
- JSON Web Tokens
- bcryptjs
- CORS

### Database

- PostgreSQL
- Neon PostgreSQL
- Prisma ORM

### Development and Deployment

- Git
- GitHub
- Vercel
- npm
- Environment variables

## Project Structure

```text
Rently/
├── client/
│   ├── public/
│   │   └── images/
│   │       └── products/
│   └── ...
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── ...
│   └── ...
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Local Development

### Prerequisites

Install:

- Node.js
- npm
- Git
- PostgreSQL, or access to a Neon PostgreSQL database

### Clone the Repository

```bash
git clone https://github.com/neurus0/rently.git
cd rently
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create the required environment files from the available `.env.example` files.

Do not commit real credentials or secrets. Configuration may include:

- Database connection URL
- JWT secret
- Backend API URL
- Frontend origin or CORS configuration
- Other environment-specific settings

Use the exact variable names provided in the project's environment example files.

### Run Setup

```bash
npm run setup
```

### Start Development

```bash
npm run dev
```

Expected local addresses:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- API health check: `http://localhost:4000/api/health`

## Useful Commands

```bash
npm install
npm run setup
npm run dev
npm run typecheck
npm run build
npm run db:migrate
npm run seed
```

The exact command behavior is defined in the root `package.json`.

## Database and Neon Setup

The production backend uses PostgreSQL hosted on Neon.

General workflow:

```text
Prisma Schema
    |
    v
Prisma Migration
    |
    v
Neon PostgreSQL Database
```

Before running database commands:

1. Configure the database connection variable.
2. Confirm that the Prisma schema uses the PostgreSQL provider.
3. Run migrations as required.
4. Seed demo data when needed.

Never commit the real Neon connection string or any database credentials.

## API Endpoints

### Health

```http
GET /api/health
```

### Authentication

```http
POST /api/auth/signup
POST /api/auth/login
GET /api/auth/me
```

### Categories

```http
GET /api/categories
```

### Products

```http
GET /api/products
GET /api/products/:id
GET /api/products/:id/availability
```

### Cart

```http
GET /api/cart
POST /api/cart
PATCH /api/cart/:id
DELETE /api/cart/:id
```

Cart endpoints require authentication where enforced by the backend.

## Demo Accounts

The prototype includes demo accounts for different roles.

| Role | Email |
|---|---|
| Admin | `admin@rently.demo` |
| Customer | `ananya@demo.rently` |
| Seller | `aarav@toolhub.demo` |

Demo password:

```text
Rently@123
```

Use demo credentials only for development and demonstrations. Do not use demo passwords in production.

## Customer Workflow

```text
Home
  ↓
Browse or Search Products
  ↓
Apply Filters
  ↓
Open Product Details
  ↓
Select Rental Dates and Quantity
  ↓
Add to Cart
  ↓
Review Cart
  ↓
Proceed to Checkout
  ↓
Payment and Order Workflow
```

## Product Images

Product images are stored locally in:

```text
client/public/images/products
```

Seeded product records reference local image paths so the storefront does not depend on remote image hosting during normal use.

The interface includes a fallback for unavailable images. Use only images that are properly licensed or that you have permission to use.

## Deployment Workflow

### Frontend on Vercel

1. Connect the GitHub repository to a Vercel project.
2. Configure the frontend root directory and build settings.
3. Add required frontend environment variables.
4. Configure the deployed backend API URL.
5. Deploy the frontend.
6. Test navigation and API requests.

### Backend on Vercel

1. Create a separate Vercel project for the backend.
2. Configure the backend root directory and build settings.
3. Add the Neon PostgreSQL connection string.
4. Add the JWT secret and other backend environment variables.
5. Configure CORS for the deployed frontend origin.
6. Deploy the backend.
7. Test `/api/health` and other API endpoints.

### Neon Database

1. Create or open a Neon PostgreSQL project.
2. Add the Neon connection string to backend environment variables.
3. Confirm the Prisma provider is set to `postgresql`.
4. Apply the required Prisma migrations.
5. Run the seed process if demo data is required.
6. Verify database connectivity through the backend.

## Git and Repository Practices

The repository excludes local and sensitive files through `.gitignore`, including:

- `node_modules/`
- Build output
- `.env` files
- Local database files
- `docs/`
- `.vscode/`

Do not commit:

- Database credentials
- Neon connection strings
- JWT secrets
- Private API keys
- Local editor settings
- Other confidential configuration

Typical Git workflow:

```bash
git status
git add .
git commit -m "Describe the changes"
git pull --rebase origin main
git push origin main
```

Avoid force-pushing to the shared main branch unless the team has explicitly agreed to it.

## Current Status

The project currently demonstrates:

- Full-stack React and Express architecture
- Prisma database integration
- Neon PostgreSQL connectivity
- JWT authentication
- Product and category browsing
- Rental cart functionality
- Separate frontend and backend Vercel deployments
- GitHub source control

## Limitations and Future Improvements

Potential future improvements include:

- Authoritative checkout validation
- Order creation and order history
- Simulated or real payment integration
- Inventory locking and settlement
- Rental booking conflict prevention
- Advanced seller dashboard
- Admin management tools
- Notifications and booking confirmations
- Stronger validation and error handling
- Automated tests
- Production-grade logging and monitoring
- Improved production security configuration

The current project is an academic prototype and demonstration of an equipment-rental marketplace. Payment, delivery, inventory settlement, and complete order processing should not be considered production-ready unless explicitly implemented and tested.

## Team Project

Rently was developed as part of a college E-Business project. It combines frontend development, backend API development, database management, authentication, deployment, and marketplace workflow design.
