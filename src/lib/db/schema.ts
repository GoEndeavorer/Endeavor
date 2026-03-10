import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

// ── Enums ───────────────────────────────────────────────────────────────────

export const locationTypeEnum = pgEnum("location_type", [
  "in-person",
  "remote",
  "either",
]);

export const endeavorStatusEnum = pgEnum("endeavor_status", [
  "draft",
  "open",
  "in-progress",
  "completed",
  "cancelled",
]);

export const memberRoleEnum = pgEnum("member_role", [
  "creator",
  "collaborator",
]);

export const memberStatusEnum = pgEnum("member_status", [
  "pending",
  "approved",
  "rejected",
]);

// ── Better Auth tables ──────────────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  bio: text("bio"),
  location: text("location"),
  skills: text("skills").array(),
  interests: text("interests").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Endeavors ───────────────────────────────────────────────────────────────

export const endeavor = pgTable("endeavor", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  location: text("location"),
  locationType: locationTypeEnum("location_type").notNull().default("in-person"),
  needs: text("needs").array(),
  status: endeavorStatusEnum("status").notNull().default("open"),
  costPerPerson: integer("cost_per_person"),
  capacity: integer("capacity"),
  fundingEnabled: boolean("funding_enabled").notNull().default(false),
  fundingGoal: integer("funding_goal"),
  fundingRaised: integer("funding_raised").notNull().default(0),
  joinType: text("join_type").notNull().default("open"), // "open" or "request"
  creatorId: text("creator_id")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in-progress",
  "done",
]);

// ── Memberships (user ↔ endeavor) ───────────────────────────────────────────

export const member = pgTable("member", {
  id: uuid("id").primaryKey().defaultRandom(),
  endeavorId: uuid("endeavor_id")
    .notNull()
    .references(() => endeavor.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  role: memberRoleEnum("role").notNull().default("collaborator"),
  status: memberStatusEnum("status").notNull().default("pending"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

// ── Discussions ─────────────────────────────────────────────────────────────

export const discussion = pgTable("discussion", {
  id: uuid("id").primaryKey().defaultRandom(),
  endeavorId: uuid("endeavor_id")
    .notNull()
    .references(() => endeavor.id),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Tasks ───────────────────────────────────────────────────────────────────

export const task = pgTable("task", {
  id: uuid("id").primaryKey().defaultRandom(),
  endeavorId: uuid("endeavor_id")
    .notNull()
    .references(() => endeavor.id),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("task_status").notNull().default("todo"),
  assigneeId: text("assignee_id").references(() => user.id),
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Payments ────────────────────────────────────────────────────────────────

export const paymentTypeEnum = pgEnum("payment_type", [
  "join",      // cost-to-join payment
  "donation",  // crowdfunding donation
]);

export const payment = pgTable("payment", {
  id: uuid("id").primaryKey().defaultRandom(),
  endeavorId: uuid("endeavor_id")
    .notNull()
    .references(() => endeavor.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  type: paymentTypeEnum("type").notNull(),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").notNull().default("usd"),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: text("status").notNull().default("pending"), // pending, completed, refunded
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Shared Links / Resources ────────────────────────────────────────────────

export const link = pgTable("link", {
  id: uuid("id").primaryKey().defaultRandom(),
  endeavorId: uuid("endeavor_id")
    .notNull()
    .references(() => endeavor.id),
  addedById: text("added_by_id")
    .notNull()
    .references(() => user.id),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Notifications ───────────────────────────────────────────────────────────

export const notification = pgTable("notification", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  type: text("type").notNull(), // "join_request", "member_joined", "new_discussion", "task_assigned", "funding_received"
  message: text("message").notNull(),
  endeavorId: uuid("endeavor_id").references(() => endeavor.id),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
