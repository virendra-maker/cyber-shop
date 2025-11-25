import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getCategories,
  getProducts,
  getProductById,
  getUserCart,
  upsertCartItem,
  removeCartItem,
  clearUserCart,
  createOrder,
  getUserOrders,
  upsertProduct,
  deleteProduct,
  upsertCategory,
  getAllOrders,
} from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

// Helper to ensure user is admin
const adminProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

// Helper to ensure user is authenticated
const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Product and category procedures
  products: router({
    list: publicProcedure
      .input(
        z.object({
          categoryId: z.number().optional(),
          search: z.string().optional(),
        })
      )
      .query(({ input }) => getProducts(input)),

    getById: publicProcedure
      .input(z.number())
      .query(({ input }) => getProductById(input)),

    categories: publicProcedure.query(() => getCategories()),
  }),

  // Cart procedures
  cart: router({
    get: protectedProcedure.query(({ ctx }) =>
      getUserCart(ctx.user!.id)
    ),

    add: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          quantity: z.number().min(1),
        })
      )
      .mutation(({ ctx, input }) =>
        upsertCartItem(ctx.user!.id, input.productId, input.quantity)
      ),

    remove: protectedProcedure
      .input(z.number())
      .mutation(({ ctx, input }) =>
        removeCartItem(ctx.user!.id, input)
      ),

    clear: protectedProcedure.mutation(({ ctx }) =>
      clearUserCart(ctx.user!.id)
    ),
  }),

  // Order procedures
  orders: router({
    list: protectedProcedure.query(({ ctx }) =>
      getUserOrders(ctx.user!.id)
    ),

    create: protectedProcedure
      .input(
        z.object({
          totalAmount: z.number(),
          items: z.unknown(),
        })
      )
      .mutation(({ ctx, input }) =>
        createOrder(ctx.user!.id, input.totalAmount, input.items)
      ),
  }),

  // Admin procedures
  admin: router({
    products: router({
      list: adminProcedure.query(() => getProducts()),

      upsert: adminProcedure
        .input(
          z.object({
            id: z.number().optional(),
            categoryId: z.number(),
            name: z.string(),
            description: z.string().optional(),
            price: z.number(),
            originalPrice: z.number().optional(),
            image: z.string().optional(),
            stock: z.number(),
            isActive: z.number(),
            features: z.string().optional(),
          })
        )
        .mutation(({ input }) => upsertProduct(input)),

      delete: adminProcedure
        .input(z.number())
        .mutation(({ input }) => deleteProduct(input)),
    }),

    categories: router({
      list: adminProcedure.query(() => getCategories()),

      upsert: adminProcedure
        .input(
          z.object({
            id: z.number().optional(),
            name: z.string(),
            description: z.string().optional(),
            icon: z.string().optional(),
          })
        )
        .mutation(({ input }) => upsertCategory(input)),
    }),

    orders: router({
      list: adminProcedure.query(() => getAllOrders()),
    }),
  }),
});

export type AppRouter = typeof appRouter;
