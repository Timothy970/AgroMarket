import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums
export const userRoleEnum = pgEnum("user_role", ["buyer", "seller", "admin"]);
export const productStatusEnum = pgEnum("product_status", ["pending", "approved", "rejected"]);
export const purchaseModeEnum = pgEnum("purchase_mode", ["small", "bulk"]);
export const payoutMethodEnum = pgEnum("payout_method", ["mobile_money", "bank_transfer", "paypal"]);
export const orderStatusEnum = pgEnum("order_status", ["placed", "approved", "packed", "shipped", "awaiting_payment", "delivered", "cancelled"]);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").notNull().default("buyer"),
  // Seller payout preferences
  payoutMethod: payoutMethodEnum("payout_method"),
  mobileNumber: varchar("mobile_number"),
  bankName: varchar("bank_name"),
  bankAccount: varchar("bank_account"),
  paypalEmail: varchar("paypal_email"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  // Small purchase pricing
  smallPrice: decimal("small_price", { precision: 10, scale: 2 }).notNull(),
  smallUnit: varchar("small_unit").notNull().default("kg"),
  // Bulk purchase pricing
  bulkPrice: decimal("bulk_price", { precision: 10, scale: 2 }),
  bulkUnit: varchar("bulk_unit"),
  minBulkQuantity: integer("min_bulk_quantity"),
  // Inventory
  availableQuantity: integer("available_quantity").notNull().default(0),
  harvestDate: timestamp("harvest_date"),
  // Images (stored as JSON array of URLs)
  images: text("images").array().notNull().default(sql`ARRAY[]::text[]`),
  // Location
  location: varchar("location"),
  // Approval workflow
  status: productStatusEnum("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("products_seller_idx").on(table.sellerId),
  index("products_status_idx").on(table.status),
  index("products_category_idx").on(table.category),
]);

export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  purchaseMode: purchaseModeEnum("purchase_mode").notNull().default("small"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("cart_items_user_idx").on(table.userId),
]);

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  buyerId: varchar("buyer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  purchaseMode: purchaseModeEnum("purchase_mode").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).notNull().default("500"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  // Bulk order specific
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }),
  remainingBalance: decimal("remaining_balance", { precision: 10, scale: 2 }),
  depositPaid: boolean("deposit_paid").default(false),
  balancePaid: boolean("balance_paid").default(false),
  // Delivery
  deliveryAddress: text("delivery_address").notNull(),
  // Status
  status: orderStatusEnum("status").notNull().default("placed"),
  // Payment
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("orders_buyer_idx").on(table.buyerId),
  index("orders_seller_idx").on(table.sellerId),
  index("orders_status_idx").on(table.status),
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  productsAsSeller: many(products, { relationName: "seller" }),
  cartItems: many(cartItems),
  ordersAsBuyer: many(orders, { relationName: "buyer" }),
  ordersAsSeller: many(orders, { relationName: "seller" }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  seller: one(users, {
    fields: [products.sellerId],
    references: [users.id],
    relationName: "seller",
  }),
  cartItems: many(cartItems),
  orders: many(orders),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id],
    relationName: "buyer",
  }),
  seller: one(users, {
    fields: [orders.sellerId],
    references: [users.id],
    relationName: "seller",
  }),
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
}));

// Zod schemas for validation
export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  status: true,
  approvedAt: true,
  approvedBy: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProductSchema = insertProductSchema.partial();

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
