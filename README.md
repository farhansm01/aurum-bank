# Aurum Bank — Advanced Digital Banking Management System

> **Simulated project. No real money is used.**

Aurum Bank is an enterprise-grade, simulated digital banking platform built with Next.js (App Router), TypeScript, Tailwind CSS, PostgreSQL (via Drizzle ORM), Better Auth, and Redux Toolkit. It demonstrates financial business logic, strict transaction consistency, role-based authorization, and modern fintech UI architecture.

---

## 1. Project Overview

Aurum Bank simulates a full commercial banking environment across three distinct user roles: **Admin**, **Bank Staff**, and **Customer**. Unlike basic CRUD dashboards, financial operations in Aurum Bank utilize database transactions with row-level locks, cryptographic transaction PIN verification with rate-limited lockouts, idempotency safeguards, and audit ledgers.

---

## 2. Key Features by Role

### 👤 Customer Portal (`/dashboard`)
- **Dashboard Overview**: Summary KPI cards (Total Balance across all accounts, Total Deposits, Total Withdrawals), recent transaction preview, and active loans.
- **Visual Analytics**: Interactive Recharts graphs showing debit/transfer spending trends and transaction category distribution.
- **Account Management**: View multi-tier accounts (Savings, Current, Business) with individual account numbers, balances, and transaction thresholds.
- **Fund Transfers**: Transfer funds between personal accounts or to other customers within Aurum Bank protected by a 4-digit hashed PIN, idempotency keys, single-transaction limits, and daily transfer limits.
- **Deposit & Withdrawal Requests**: Submit deposit and withdrawal requests for bank staff review.
- **Transaction History**: Comprehensive ledger featuring search by reference ID/description, type filter, status filter, interactive date/amount sorting, pagination, and one-click **CSV Statement Export**.
- **Loan Applications**: Apply for personal, home, car, education, or business loans with requested amount, duration, monthly income, and employment status.

### 💼 Bank Staff Portal (`/staff`)
- **Operations Dashboard**: Real-time review queues for pending money requests, loan reviews, customer KYC status, and customer directories.
- **Customer Directory & KYC**: Verify customer identification profiles (Pending, Verified, Rejected).
- **Request Management**: Review customer deposit and withdrawal requests with one-click approval or rejection.
- **Transaction Auditing**: Global transaction monitoring across all bank accounts with advanced sorting, filtering, and pagination.
- **Loan Assistance**: Review incoming customer loan applications.

### 🛡️ Admin Portal (`/admin`)
- **Executive Analytics**: KPI summary metrics (Total Customers, Total Accounts, Total Bank Liquidity, Deposits, Withdrawals, Total Transactions, Pending Loans).
- **Interactive Business Intelligence**: Recharts visual charts for deposit vs withdrawal volume flow and account distribution.
- **Customer Controls**: Activate, deactivate, or block suspicious customer accounts.
- **Account Management**: Freeze or unfreeze bank accounts; inspect balances and daily limits.
- **Master Financial Ledger**: Complete transaction ledger with search, filtering, and CSV export.
- **Loan Management**: Approve loans (triggering instant automated disbursement transactions directly into customer bank accounts) or reject applications.
- **Bank-Wide Settings**: Configure system-wide limits: daily transfer limits, max single transaction amounts, minimum account balance reserves, and standard transfer fees.

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Server & Client Components) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Database** | PostgreSQL (Neon serverless pg Pool) |
| **ORM & Migrations** | Drizzle ORM & Drizzle Kit |
| **Authentication** | Better Auth (Custom credentials authentication with role authorization) |
| **Global State** | Redux Toolkit & React-Redux (typed hooks, multi-slice store) |
| **Data Visualization** | Recharts |
| **Icons** | Lucide React |

---

## 4. Redux Toolkit Architecture

Global client state is centralized using **Redux Toolkit** under a feature-based structure (`src/features/*` and `src/store/*`):

- **Store Configuration (`src/store/index.ts`)**:
  Combines slice reducers into a centralized store with strongly-typed `RootState` and `AppDispatch`.
- **Typed Hooks (`src/store/hooks.ts`)**:
  Provides `useAppDispatch` and `useAppSelector` with typed autocomplete across the application.
- **Slices**:
  - `authSlice`: Stores current user profile and session role.
  - `accountsSlice`: Manages customer bank accounts, balance updates, and loading/error states.
  - `transactionsSlice`: Manages transaction streams and filtering.
  - `loansSlice`: Tracks active and pending loan applications.
- **Client Provider (`src/components/StoreProvider.tsx`)**:
  Wraps the root layout cleanly, enabling client components to consume global state without converting layouts into client components.

---

## 5. Security & Financial Consistency

Financial operations follow strict banking rules:

1. **Atomic Fund Transfers (`db.transaction`)**:
   Transfers run inside an atomic database transaction. Sender and receiver account rows are locked using `.for("update")` in a fixed, ordered sequence by account ID to prevent deadlocks. If any balance check or limit fails, the entire transaction rolls back.
2. **Double-Spending & Race Condition Protection**:
   Balance math is executed on the database server directly (`sql`${bankAccounts.balance} - ${amount}::numeric``) rather than relying on stale client-sent values.
3. **Transaction PIN with Lockout**:
   Customer PINs are hashed using `bcryptjs`. Five consecutive failed PIN attempts automatically lock the PIN for 15 minutes.
4. **Idempotency Keys**:
   Every transfer request requires a unique idempotency key. Repeating requests return the original transaction without moving funds twice.
5. **Server-Side Authorization**:
   Route and API security is strictly enforced on the server via `requireRole()` and `requireApiRole()` in `src/lib/session.ts`.

---

## 6. Database Schema

All 12 tables are defined in `src/db/schema.ts`:

- `user`: Identity, email, role (`customer`, `staff`, `admin`), status (`active`, `inactive`, `blocked`).
- `session` & `account`: Better Auth session management and security tokens.
- `customer_profiles`: Phone, address, hashed transaction PIN, failed PIN attempt counter, PIN lock expiry, KYC verification status.
- `bank_accounts`: Account number, type (`savings`, `current`, `business`), balance (`numeric(14,2)`), limits, and status (`active`, `frozen`).
- `transactions`: Immutable financial ledger records with unique `txnRef`, types, amounts, fees, status, and idempotency keys.
- `money_requests`: Deposit and withdrawal approval workflow rows with maker-checker constraints (no self-approval).
- `loans`: Application records, interest rates, durations, status, reviewer IDs, and disbursement transaction references.
- `loan_installments`: Repayment schedule rows.
- `loan_notes`: Staff internal notes on loan applications.
- `bank_settings`: Global banking parameters (transfer limits, min balances, fees).

---

## 7. Demo Credentials

The database can be seeded with demo users across all three roles using `npm run db:seed`:

| Role | Email | Password | Transaction PIN |
|---|---|---|---|
| **Admin** | `admin@aurum.test` | `Admin@12345` | *(Not required)* |
| **Bank Staff** | `staff@aurum.test` | `Staff@12345` | *(Not required)* |
| **Customer 1** | `customer@aurum.test` | `Customer@12345` | `1234` |
| **Customer 2** | `karim@aurum.test` | `Karim@12345` | `5678` |

### Pre-configured Demo Accounts

- **AB-1001** (customer@aurum.test): Savings Account ($5,000.00)
- **AB-1002** (customer@aurum.test): Current Account ($1,200.00)
- **AB-2001** (karim@aurum.test): Savings Account ($3,000.00)

---

## 8. Local Setup & Installation

### Prerequisites
- Node.js 18.18+ or 20+
- PostgreSQL database (or free [Neon](https://neon.tech) database)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd aurum-bank
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@ep-sample-123456.ap-southeast-1.aws.neon.tech/aurum-bank?sslmode=require"
   BETTER_AUTH_SECRET="your_secure_random_auth_secret_key"
   BETTER_AUTH_URL="http://localhost:3000"
   ```

4. **Initialize Database Schema:**
   Push the schema to your PostgreSQL database:
   ```bash
   npm run db:push
   ```

5. **Seed Demo Data:**
   Populate demo accounts, PINs, and default bank settings:
   ```bash
   npm run db:seed
   ```

6. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 9. Available Scripts

- `npm run dev`: Runs the local development server.
- `npm run build`: Compiles and builds the production application.
- `npm run start`: Starts the production build.
- `npm run lint`: Runs ESLint checks.
- `npm run db:push`: Synchronizes Drizzle schema with the database.
- `npm run db:studio`: Opens Drizzle Studio GUI for database inspection.
- `npm run db:seed`: Seeds demo users, accounts, and bank settings.

---

## 10. Deployment Instructions (Vercel)

1. Push your code to a public GitHub repository.
2. Import the repository in [Vercel](https://vercel.com).
3. Under **Environment Variables**, add:
   - `DATABASE_URL`
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL` (set to your Vercel deployment URL, e.g. `https://your-project.vercel.app`)
4. Deploy the project. Database migrations and seeds can be pushed via your local CLI using `npm run db:push` pointing to your production database URL.
