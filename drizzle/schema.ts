import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Product categories for organizing hacking tools and services
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Products and services for sale
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: int("price").notNull(), // Store as cents to avoid decimal issues
  originalPrice: int("originalPrice"), // For discounts
  image: varchar("image", { length: 500 }),
  stock: int("stock").default(0).notNull(),
  isActive: int("isActive").default(1).notNull(), // 1 = true, 0 = false
  features: text("features"), // JSON string of features array
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Shopping cart items for users
 */
export const cartItems = mysqlTable("cartItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

/**
 * Orders placed by users
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  totalAmount: int("totalAmount").notNull(), // In cents
  status: mysqlEnum("status", ["pending", "completed", "cancelled"]).default("pending").notNull(),
  items: text("items"), // JSON string of order items
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Payment requests submitted by users
 */
export const paymentRequests = mysqlTable("paymentRequests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  amount: int("amount").notNull(), // In cents
  status: mysqlEnum("status", ["pending", "approved", "rejected", "delivered"]).default("pending").notNull(),
  transactionId: varchar("transactionId", { length: 255 }).notNull(), // UTR or Transaction ID
  paymentMethod: varchar("paymentMethod", { length: 50 }).default("upi").notNull(),
  notes: text("notes"), // Admin notes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type InsertPaymentRequest = typeof paymentRequests.$inferInsert;

/**
 * Course and API deliverables
 */
export const courseDeliverables = mysqlTable("courseDeliverables", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  paymentRequestId: int("paymentRequestId").notNull(),
  userId: int("userId").notNull(),
  deliveryType: mysqlEnum("deliveryType", ["course", "api", "tool", "service"]).notNull(),
  deliveryContent: text("deliveryContent"), // JSON: links, credentials, files, etc.
  accessLink: varchar("accessLink", { length: 500 }),
  apiKey: varchar("apiKey", { length: 500 }),
  credentials: text("credentials"), // JSON: username, password, etc.
  expiresAt: timestamp("expiresAt"),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CourseDeliverable = typeof courseDeliverables.$inferSelect;
export type InsertCourseDeliverable = typeof courseDeliverables.$inferInsert;

/**
 * Admin settings for payment collection
 */
export const adminSettings = mysqlTable("adminSettings", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  upiId: varchar("upiId", { length: 255 }).notNull(), // UPI ID for payments
  upiName: varchar("upiName", { length: 255 }), // Name associated with UPI
  qrCode: text("qrCode"), // QR code image URL for UPI payments
  bankAccount: varchar("bankAccount", { length: 255 }), // Optional bank details
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminSettings = typeof adminSettings.$inferSelect;
export type InsertAdminSettings = typeof adminSettings.$inferInsert;