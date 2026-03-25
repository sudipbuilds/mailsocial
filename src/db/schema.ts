import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

const timeStamps = {
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
};

export const users = sqliteTable(
  'users',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    secretKey: text('secret_key').notNull(),
    bio: text('bio'),
    username: text('username').notNull().unique(),
    isPrivate: integer('is_private', { mode: 'boolean' }).default(false).notNull(),
    website: text('website'),
    emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(),
    ...timeStamps,
  },
  table => [index('users_secretKey_idx').on(table.secretKey)]
);

export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    ...timeStamps,
  },
  table => [index('sessions_userId_idx').on(table.userId)]
);

export const accounts = sqliteTable(
  'accounts',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', {
      mode: 'timestamp_ms',
    }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', {
      mode: 'timestamp_ms',
    }),
    scope: text('scope'),
    password: text('password'),
    ...timeStamps,
  },
  table => [index('accounts_userId_idx').on(table.userId)]
);

export const verifications = sqliteTable(
  'verifications',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    ...timeStamps,
  },
  table => [index('verification_identifier_idx').on(table.identifier)]
);

export const orders = sqliteTable(
  'orders',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    customerId: text('customer_id').notNull(),
    customerEmail: text('customer_email').notNull(),
    customerName: text('customer_name').notNull(),
    customerUsername: text('customer_username').notNull(),
    paymentId: text('payment_id').notNull().unique(),
    paymentStatus: text('payment_status').notNull(),
    amount: integer('amount', { mode: 'number' }).notNull(),
    currency: text('currency').notNull(),
    productId: text('product_id').notNull(),
    invoiceUrl: text('invoice_url'),
    paymentMethod: text('payment_method'),
    webhookId: text('webhook_id').unique(),
    refundedAt: integer('refunded_at', { mode: 'timestamp_ms' }),
    ...timeStamps,
  },
  table => [
    index('orders_paymentId_idx').on(table.paymentId), // For refund lookup
    index('orders_customerUsername_idx').on(table.customerUsername), // For availability check
  ]
);

export const webhookEvents = sqliteTable('webhook_events', {
  id: text('id').primaryKey(), // webhook-id header
  eventType: text('event_type').notNull(),
  receivedAt: integer('received_at', { mode: 'timestamp' }).notNull(),
  processed: integer('processed', { mode: 'boolean' }).notNull().default(false),
  raw: text('raw').notNull(),
  ...timeStamps,
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  orders: many(orders),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type SessionInsert = typeof sessions.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type AccountInsert = typeof accounts.$inferInsert;

export type Verification = typeof verifications.$inferSelect;
export type VerificationInsert = typeof verifications.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type OrderInsert = typeof orders.$inferInsert;

export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type WebhookEventInsert = typeof webhookEvents.$inferInsert;
