import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// ======================================================
// Better Auth tables (login)
// ======================================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  // "admin" | "staff" | "customer"
  role: text("role").notNull().default("customer"),
  // "active" | "inactive" | "blocked"
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ======================================================
// Banking tables
// ======================================================

// Extra details of a customer, plus the hashed transaction PIN
export const customerProfiles = pgTable("customer_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  phone: text("phone"),
  address: text("address"),
  // hashed, never the real PIN
  pinHash: text("pin_hash"),
  pinFailedAttempts: integer("pin_failed_attempts").notNull().default(0),
  pinLockedUntil: timestamp("pin_locked_until"),
  // "pending" | "verified" | "rejected"
  verificationStatus: text("verification_status").notNull().default("pending"),
  verifiedBy: text("verified_by").references(() => user.id, {
    onDelete: "restrict",
  }),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// The money. One user can have many accounts.
export const bankAccounts = pgTable(
  "bank_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    accountNumber: text("account_number").notNull().unique(),
    // "savings" | "current" | "business"
    type: text("type").notNull(),
    balance: numeric("balance", { precision: 14, scale: 2 })
      .notNull()
      .default("0.00"),
    // "active" | "frozen"
    status: text("status").notNull().default("active"),
    dailyLimit: numeric("daily_limit", { precision: 14, scale: 2 })
      .notNull()
      .default("50000.00"),
    singleLimit: numeric("single_limit", { precision: 14, scale: 2 })
      .notNull()
      .default("10000.00"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [check("balance_not_negative", sql`${table.balance} >= 0`)],
);

// The history. Rows are never deleted.
export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    txnRef: text("txn_ref").notNull().unique(),
    // "deposit" | "withdrawal" | "transfer" | "loan_disbursement" | "loan_repayment"
    type: text("type").notNull(),
    senderAccountId: uuid("sender_account_id").references(
      () => bankAccounts.id,
      { onDelete: "restrict" },
    ),
    receiverAccountId: uuid("receiver_account_id").references(
      () => bankAccounts.id,
      { onDelete: "restrict" },
    ),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    fee: numeric("fee", { precision: 14, scale: 2 }).notNull().default("0.00"),
    // "pending" | "completed" | "failed" | "reversed"
    status: text("status").notNull().default("pending"),
    description: text("description"),
    idempotencyKey: text("idempotency_key").unique(),
    flagged: boolean("flagged").notNull().default(false),
    flagReason: text("flag_reason"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    check("amount_positive", sql`${table.amount} > 0`),
    check(
      "has_an_account",
      sql`${table.senderAccountId} is not null or ${table.receiverAccountId} is not null`,
    ),
  ],
);

// Deposit and withdrawal requests waiting for approval
export const moneyRequests = pgTable(
  "money_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => bankAccounts.id, { onDelete: "restrict" }),
    // "deposit" | "withdrawal"
    type: text("type").notNull(),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    description: text("description"),
    // "pending" | "approved" | "rejected"
    status: text("status").notNull().default("pending"),
    requestedBy: text("requested_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    reviewedBy: text("reviewed_by").references(() => user.id, {
      onDelete: "restrict",
    }),
    // the transaction created after approval
    transactionId: uuid("transaction_id").references(() => transactions.id, {
      onDelete: "restrict",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    reviewedAt: timestamp("reviewed_at"),
  },
  (table) => [
    check("request_amount_positive", sql`${table.amount} > 0`),
    check(
      "no_self_approval",
      sql`${table.reviewedBy} is null or ${table.reviewedBy} <> ${table.requestedBy}`,
    ),
  ],
);

// Loan applications
export const loans = pgTable(
  "loans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    // the account that receives the money
    accountId: uuid("account_id")
      .notNull()
      .references(() => bankAccounts.id, { onDelete: "restrict" }),
    // "personal" | "home" | "car" | "education" | "business"
    type: text("type").notNull(),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    durationMonths: integer("duration_months").notNull(),
    monthlyIncome: numeric("monthly_income", {
      precision: 14,
      scale: 2,
    }).notNull(),
    // "employed" | "self_employed" | "business_owner" | "student" | "unemployed"
    employmentStatus: text("employment_status").notNull(),
    description: text("description"),
    // "pending" | "under_review" | "approved" | "rejected" | "active" | "completed"
    status: text("status").notNull().default("pending"),
    // filled when the admin approves
    interestRate: numeric("interest_rate", { precision: 5, scale: 2 }),
    monthlyPayment: numeric("monthly_payment", { precision: 14, scale: 2 }),
    remainingBalance: numeric("remaining_balance", {
      precision: 14,
      scale: 2,
    })
      .notNull()
      .default("0.00"),
    // staff who forwarded it, admin who decided
    forwardedBy: text("forwarded_by").references(() => user.id, {
      onDelete: "restrict",
    }),
    reviewedBy: text("reviewed_by").references(() => user.id, {
      onDelete: "restrict",
    }),
    // the transaction that paid out the loan
    disbursementTransactionId: uuid("disbursement_transaction_id").references(
      () => transactions.id,
      { onDelete: "restrict" },
    ),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    reviewedAt: timestamp("reviewed_at"),
  },
  (table) => [
    check("loan_amount_positive", sql`${table.amount} > 0`),
    check("loan_duration_positive", sql`${table.durationMonths} > 0`),
    check("loan_remaining_not_negative", sql`${table.remainingBalance} >= 0`),
    check(
      "loan_no_self_review",
      sql`(${table.reviewedBy} is null or ${table.reviewedBy} <> ${table.userId}) and (${table.forwardedBy} is null or ${table.forwardedBy} <> ${table.userId})`,
    ),
  ],
);

// The repayment schedule: one row per monthly payment
export const loanInstallments = pgTable(
  "loan_installments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    loanId: uuid("loan_id")
      .notNull()
      .references(() => loans.id, { onDelete: "restrict" }),
    installmentNumber: integer("installment_number").notNull(),
    dueDate: timestamp("due_date").notNull(),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    // "due" | "paid"
    status: text("status").notNull().default("due"),
    paidAt: timestamp("paid_at"),
    // the transaction that paid it
    transactionId: uuid("transaction_id").references(() => transactions.id, {
      onDelete: "restrict",
    }),
  },
  (table) => [
    unique("loan_installment_unique").on(table.loanId, table.installmentNumber),
    check("installment_amount_positive", sql`${table.amount} > 0`),
  ],
);

// Internal notes by staff on a loan (customers never see these)
export const loanNotes = pgTable("loan_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  loanId: uuid("loan_id")
    .notNull()
    .references(() => loans.id, { onDelete: "restrict" }),
  staffId: text("staff_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  note: text("note").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Messages for users (money received, loan approved, and so on)
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  // "transfer" | "deposit" | "withdrawal" | "loan" | "system"
  type: text("type").notNull().default("system"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Bank-wide settings. Always exactly ONE row (id = 1). Only admin can change it.
export const bankSettings = pgTable(
  "bank_settings",
  {
    id: integer("id").primaryKey().default(1),
    dailyTransferLimit: numeric("daily_transfer_limit", {
      precision: 14,
      scale: 2,
    })
      .notNull()
      .default("50000.00"),
    maxSingleTransaction: numeric("max_single_transaction", {
      precision: 14,
      scale: 2,
    })
      .notNull()
      .default("10000.00"),
    minBalance: numeric("min_balance", { precision: 14, scale: 2 })
      .notNull()
      .default("0.00"),
    transferFee: numeric("transfer_fee", { precision: 14, scale: 2 })
      .notNull()
      .default("0.00"),
    updatedBy: text("updated_by").references(() => user.id, {
      onDelete: "restrict",
    }),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [check("only_one_settings_row", sql`${table.id} = 1`)],
);