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
  website: text("website"),
  github: text("github"),
  twitter: text("twitter"),
  linkedin: text("linkedin"),
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
  imageUrl: text("image_url"),
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
  parentId: uuid("parent_id"),
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

// ── Milestones ──────────────────────────────────────────────────────────────

export const milestone = pgTable("milestone", {
  id: uuid("id").primaryKey().defaultRandom(),
  endeavorId: uuid("endeavor_id")
    .notNull()
    .references(() => endeavor.id),
  title: text("title").notNull(),
  description: text("description"),
  targetDate: timestamp("target_date"),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Stories (post-endeavor) ─────────────────────────────────────────────────

export const story = pgTable("story", {
  id: uuid("id").primaryKey().defaultRandom(),
  endeavorId: uuid("endeavor_id")
    .notNull()
    .references(() => endeavor.id),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  published: boolean("published").notNull().default(false),
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

// ── Updates (creator announcements) ─────────────────────────────────────────

export const update = pgTable("update", {
  id: uuid("id").primaryKey().defaultRandom(),
  endeavorId: uuid("endeavor_id")
    .notNull()
    .references(() => endeavor.id),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  pinned: boolean("pinned").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Bookmarks (saved endeavors) ──────────────────────────────────────────────

export const bookmark = pgTable("bookmark", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  endeavorId: uuid("endeavor_id")
    .notNull()
    .references(() => endeavor.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Follows (user → user) ───────────────────────────────────────────────────

export const follow = pgTable("follow", {
  id: uuid("id").primaryKey().defaultRandom(),
  followerId: text("follower_id")
    .notNull()
    .references(() => user.id),
  followingId: text("following_id")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Invite Links ────────────────────────────────────────────────────────────

export const invite = pgTable("invite", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  endeavorId: uuid("endeavor_id")
    .notNull()
    .references(() => endeavor.id),
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id),
  maxUses: integer("max_uses"),
  uses: integer("uses").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Chat Messages (endeavor group chat) ─────────────────────────────────────

export const message = pgTable("message", {
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

// ── Polls (endeavor decision-making) ────────────────────────────────────────

export const pollStatusEnum = pgEnum("poll_status", [
  "active",
  "closed",
]);

export const poll = pgTable("poll", {
  id: uuid("id").primaryKey().defaultRandom(),
  endeavorId: uuid("endeavor_id")
    .notNull()
    .references(() => endeavor.id),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id),
  question: text("question").notNull(),
  options: text("options").array().notNull(),
  status: pollStatusEnum("poll_status").notNull().default("active"),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pollVote = pgTable("poll_vote", {
  id: uuid("id").primaryKey().defaultRandom(),
  pollId: uuid("poll_id")
    .notNull()
    .references(() => poll.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  optionIndex: integer("option_index").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Reports / Moderation ────────────────────────────────────────────────────

export const report = pgTable("report", {
  id: uuid("id").primaryKey().defaultRandom(),
  reporterId: text("reporter_id")
    .notNull()
    .references(() => user.id),
  endeavorId: uuid("endeavor_id").references(() => endeavor.id),
  reason: text("reason").notNull(),
  details: text("details"),
  status: text("status").notNull().default("pending"), // pending, reviewed, dismissed
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Direct Messages ────────────────────────────────────────────────────────

export const directMessage = pgTable("direct_message", {
  id: uuid("id").primaryKey().defaultRandom(),
  senderId: text("sender_id")
    .notNull()
    .references(() => user.id),
  recipientId: text("recipient_id")
    .notNull()
    .references(() => user.id),
  content: text("content").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Events / Schedule ──────────────────────────────────────────────────────

export const event = pgTable("event", {
  id: uuid("id").primaryKey().defaultRandom(),
  endeavorId: uuid("endeavor_id")
    .notNull()
    .references(() => endeavor.id),
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Story Comments ─────────────────────────────────────────────────────────

export const comment = pgTable("comment", {
  id: uuid("id").primaryKey().defaultRandom(),
  storyId: uuid("story_id")
    .notNull()
    .references(() => story.id),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Reactions ──────────────────────────────────────────────────────────────
export const reaction = pgTable("reaction", {
  id: uuid("id").primaryKey().defaultRandom(),
  discussionId: uuid("discussion_id")
    .notNull()
    .references(() => discussion.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  emoji: text("emoji").notNull(), // like, heart, fire, thumbsup, thumbsdown, celebrate
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Endorsements / Testimonials ─────────────────────────────────────────────

export const endorsement = pgTable("endorsement", {
  id: uuid("id").primaryKey().defaultRandom(),
  endeavorId: uuid("endeavor_id")
    .notNull()
    .references(() => endeavor.id),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id),
  content: text("content").notNull(),
  rating: integer("rating").notNull(), // 1-5
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Media / Attachments ─────────────────────────────────────────────────────

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  endeavorId: uuid("endeavor_id")
    .notNull()
    .references(() => endeavor.id),
  uploadedById: text("uploaded_by_id")
    .notNull()
    .references(() => user.id),
  url: text("url").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // image/png, application/pdf, etc.
  fileSize: integer("file_size"), // in bytes
  caption: text("caption"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
