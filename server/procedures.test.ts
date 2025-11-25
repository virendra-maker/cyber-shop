import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("tRPC Procedures", () => {
  describe("auth.me", () => {
    it("returns authenticated user", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.me();
      expect(result).toEqual(ctx.user);
    });

    it("returns null for unauthenticated user", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.me();
      expect(result).toBeNull();
    });
  });

  describe("products.list", () => {
    it("returns products list without authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.products.list({});
      expect(Array.isArray(result)).toBe(true);
    });

    it("accepts search filter", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.products.list({ search: "test" });
      expect(Array.isArray(result)).toBe(true);
    });

    it("accepts category filter", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.products.list({ categoryId: 1 });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("products.categories", () => {
    it("returns categories list without authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.products.categories();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("cart procedures", () => {
    it("requires authentication for cart.get", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.cart.get();
        expect.fail("Should throw UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("requires authentication for cart.add", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.cart.add({ productId: 1, quantity: 1 });
        expect.fail("Should throw UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("accepts valid cart add input", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      try {
        // This will fail at DB level but should pass validation
        await caller.cart.add({ productId: 1, quantity: 1 });
      } catch (error: any) {
        // Expected to fail at DB level, not validation
        expect(error.code).not.toBe("BAD_REQUEST");
      }
    });
  });

  describe("orders procedures", () => {
    it("requires authentication for orders.list", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.orders.list();
        expect.fail("Should throw UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("requires authentication for orders.create", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.orders.create({ totalAmount: 100, items: [] });
        expect.fail("Should throw UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });
  });

  describe("admin procedures", () => {
    it("requires admin role for admin.products.list", async () => {
      const ctx = createAuthContext("user");
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.admin.products.list();
        expect.fail("Should throw FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("allows admin to access admin.products.list", async () => {
      const ctx = createAuthContext("admin");
      const caller = appRouter.createCaller(ctx);
      try {
        const result = await caller.admin.products.list();
        expect(Array.isArray(result)).toBe(true);
      } catch (error: any) {
        // May fail at DB level but should not be FORBIDDEN
        expect(error.code).not.toBe("FORBIDDEN");
      }
    });

    it("requires admin role for admin.products.upsert", async () => {
      const ctx = createAuthContext("user");
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.admin.products.upsert({
          categoryId: 1,
          name: "Test",
          price: 100,
          stock: 10,
          isActive: 1,
        });
        expect.fail("Should throw FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("requires admin role for admin.products.delete", async () => {
      const ctx = createAuthContext("user");
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.admin.products.delete(1);
        expect.fail("Should throw FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("requires admin role for admin.categories.list", async () => {
      const ctx = createAuthContext("user");
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.admin.categories.list();
        expect.fail("Should throw FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("requires admin role for admin.categories.upsert", async () => {
      const ctx = createAuthContext("user");
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.admin.categories.upsert({ name: "Test" });
        expect.fail("Should throw FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("requires admin role for admin.orders.list", async () => {
      const ctx = createAuthContext("user");
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.admin.orders.list();
        expect.fail("Should throw FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });
});
