import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  username: text("username").unique(),
  pendingInviteToken: text("pending_invite_token"),
  createdAt: text("created_at").notNull(),
});

export const books = sqliteTable("books", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  status: text("status").notNull(),
  formatsJson: text("formats_json").notNull().default("[]"),
  startedAt: text("started_at"),
  finishedAt: text("finished_at"),
  abandonedAt: text("abandoned_at"),
  dateAdded: text("date_added"),
  note: text("note"),
  metadataJson: text("metadata_json").notNull().default("{}"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const friendships = sqliteTable(
  "friendships",
  {
    id: text("id").primaryKey(),
    requesterId: text("requester_id")
      .notNull()
      .references(() => users.id),
    addresseeId: text("addressee_id")
      .notNull()
      .references(() => users.id),
    status: text("status").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [uniqueIndex("friendships_pair").on(table.requesterId, table.addresseeId)],
);

export const inviteLinks = sqliteTable("invite_links", {
  id: text("id").primaryKey(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => users.id),
  token: text("token").notNull().unique(),
  usedAt: text("used_at"),
  createdAt: text("created_at").notNull(),
});
