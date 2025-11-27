import { and, eq, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  categories,
  InsertCategory,
  products,
  InsertProduct,
  cartItems,
  orders,
  paymentRequests,
  InsertPaymentRequest,
  courseDeliverables,
  InsertCourseDeliverable,
  adminSettings,
  InsertAdminSettings,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all active categories
 */
export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories);
}

/**
 * Get all active products with optional filtering
 */
export async function getProducts(filters?: { categoryId?: number; search?: string }) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [eq(products.isActive, 1)];

  if (filters?.categoryId) {
    const catCondition = eq(products.categoryId, filters.categoryId);
    if (catCondition) {
      conditions.push(catCondition);
    }
  }

  if (filters?.search) {
    const searchTerm = `%${filters.search}%`;
    const searchCondition = or(
      like(products.name, searchTerm),
      like(products.description, searchTerm)
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  return db.select().from(products).where(and(...(conditions.filter(Boolean) as any)));
}

/**
 * Get a single product by ID
 */
export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0] || null;
}

/**
 * Get user's cart items with product details
 */
export async function getUserCart(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(cartItems)
    .where(eq(cartItems.userId, userId));
}

/**
 * Add or update cart item
 */
export async function upsertCartItem(
  userId: number,
  productId: number,
  quantity: number
) {
  const db = await getDb();
  if (!db) return null;

  const existing = await db
    .select()
    .from(cartItems)
    .where(
      and(
        eq(cartItems.userId, userId),
        eq(cartItems.productId, productId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(cartItems)
      .set({ quantity })
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        )
      );
  } else {
    await db.insert(cartItems).values({ userId, productId, quantity });
  }
}

/**
 * Remove item from cart
 */
export async function removeCartItem(userId: number, productId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(cartItems)
    .where(
      and(
        eq(cartItems.userId, userId),
        eq(cartItems.productId, productId)
      )
    );
}

/**
 * Clear user's cart
 */
export async function clearUserCart(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

/**
 * Create an order
 */
export async function createOrder(
  userId: number,
  totalAmount: number,
  items: unknown
) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(orders).values({
    userId,
    totalAmount,
    items: JSON.stringify(items),
    status: "pending",
  });
  return result;
}

/**
 * Get user's orders
 */
export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId));
}

/**
 * Admin: Create or update product
 */
export async function upsertProduct(product: InsertProduct & { id?: number }) {
  const db = await getDb();
  if (!db) return null;

  if (product.id) {
    const { id, ...updateData } = product;
    await db.update(products).set(updateData).where(eq(products.id, id));
    return { id };
  } else {
    const result = await db.insert(products).values(product);
    return result;
  }
}

/**
 * Admin: Delete product (soft delete)
 */
export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(products).set({ isActive: 0 }).where(eq(products.id, id));
}

/**
 * Admin: Create or update category
 */
export async function upsertCategory(category: InsertCategory & { id?: number }) {
  const db = await getDb();
  if (!db) return null;

  if (category.id) {
    const { id, ...updateData } = category;
    await db.update(categories).set(updateData).where(eq(categories.id, id));
    return { id };
  } else {
    const result = await db.insert(categories).values(category);
    return result;
  }
}

/**
 * Admin: Get all orders
 */
export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders);
}


/**
 * Payment Requests
 */
export async function createPaymentRequest(request: InsertPaymentRequest) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(paymentRequests).values(request);
  return result;
}

export async function getUserPaymentRequests(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentRequests).where(eq(paymentRequests.userId, userId));
}

export async function getAllPaymentRequests() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentRequests);
}

export async function getPaymentRequestById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(paymentRequests).where(eq(paymentRequests.id, id)).limit(1);
  return result[0] || null;
}

export async function updatePaymentRequestStatus(
  id: number,
  status: "pending" | "approved" | "rejected" | "delivered",
  notes?: string
) {
  const db = await getDb();
  if (!db) return null;
  const updateData: Record<string, unknown> = { status };
  if (notes) {
    updateData.notes = notes;
  }
  await db.update(paymentRequests).set(updateData).where(eq(paymentRequests.id, id));
  return { id };
}

/**
 * Course Deliverables
 */
export async function createCourseDeliverable(deliverable: InsertCourseDeliverable) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(courseDeliverables).values(deliverable);
  return result;
}

export async function getUserDeliverables(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courseDeliverables).where(eq(courseDeliverables.userId, userId));
}

export async function getDeliverableByPaymentRequest(paymentRequestId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(courseDeliverables)
    .where(eq(courseDeliverables.paymentRequestId, paymentRequestId))
    .limit(1);
  return result[0] || null;
}

export async function updateDeliverable(
  id: number,
  updates: Partial<InsertCourseDeliverable>
) {
  const db = await getDb();
  if (!db) return null;
  await db.update(courseDeliverables).set(updates).where(eq(courseDeliverables.id, id));
  return { id };
}

/**
 * Admin Settings
 */
export async function getAdminSettings(adminId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(adminSettings)
    .where(eq(adminSettings.adminId, adminId))
    .limit(1);
  return result[0] || null;
}

export async function createOrUpdateAdminSettings(settings: InsertAdminSettings & { adminId: number }) {
  const db = await getDb();
  if (!db) return null;

  const existing = await getAdminSettings(settings.adminId);
  if (existing) {
    const { adminId, ...updateData } = settings;
    await db.update(adminSettings).set(updateData).where(eq(adminSettings.adminId, adminId));
    return { id: existing.id };
  } else {
    const result = await db.insert(adminSettings).values(settings);
    return result;
  }
}

export async function getActiveAdminSettings() {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(adminSettings)
    .where(eq(adminSettings.isActive, 1))
    .limit(1);
  return result[0] || null;
}
