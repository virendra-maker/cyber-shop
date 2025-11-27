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
  createPaymentRequest,
  getUserPaymentRequests,
  getAllPaymentRequests,
  getPaymentRequestById,
  updatePaymentRequestStatus,
  createCourseDeliverable,
  getUserDeliverables,
  getDeliverableByPaymentRequest,
  updateDeliverable,
  getAdminSettings,
  createOrUpdateAdminSettings,
  getActiveAdminSettings,
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

    settings: router({
      getAdmin: adminProcedure.query(({ ctx }) =>
        getAdminSettings(ctx.user!.id)
      ),

      updateAdmin: adminProcedure
        .input(
          z.object({
            upiId: z.string(),
            upiName: z.string().optional(),
            bankAccount: z.string().optional(),
            phoneNumber: z.string().optional(),
          })
        )
        .mutation(({ ctx, input }) =>
          createOrUpdateAdminSettings({
            adminId: ctx.user!.id,
            ...input,
            isActive: 1,
          })
        ),

      getPublicUPI: publicProcedure.query(() => getActiveAdminSettings()),
    }),
  }),

  // Payment procedures
  payments: router({
    submitRequest: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          amount: z.number(),
          transactionId: z.string(),
          paymentMethod: z.string().default("upi"),
        })
      )
      .mutation(({ ctx, input }) =>
        createPaymentRequest({
          userId: ctx.user!.id,
          productId: input.productId,
          amount: input.amount,
          transactionId: input.transactionId,
          paymentMethod: input.paymentMethod,
          status: "pending",
        })
      ),

    getUserRequests: protectedProcedure.query(({ ctx }) =>
      getUserPaymentRequests(ctx.user!.id)
    ),

    getRequestDetails: protectedProcedure
      .input(z.number())
      .query(async ({ input, ctx }) => {
        const request = await getPaymentRequestById(input);
        if (!request || request.userId !== ctx.user!.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return request;
      }),
  }),

  // Delivery procedures
  deliverables: router({
    getUserDeliverables: protectedProcedure.query(({ ctx }) =>
      getUserDeliverables(ctx.user!.id)
    ),

    getDeliverable: protectedProcedure
      .input(z.number())
      .query(async ({ input, ctx }) => {
        const deliverable = await getDeliverableByPaymentRequest(input);
        if (!deliverable || deliverable.userId !== ctx.user!.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return deliverable;
      }),
  }),

  // Admin payment management
  adminPayments: router({
    listAll: adminProcedure.query(() => getAllPaymentRequests()),

    getDetails: adminProcedure
      .input(z.number())
      .query(({ input }) => getPaymentRequestById(input)),

    approve: adminProcedure
      .input(
        z.object({
          paymentRequestId: z.number(),
          notes: z.string().optional(),
        })
      )
      .mutation(({ input }) =>
        updatePaymentRequestStatus(
          input.paymentRequestId,
          "approved",
          input.notes
        )
      ),

    reject: adminProcedure
      .input(
        z.object({
          paymentRequestId: z.number(),
          notes: z.string().optional(),
        })
      )
      .mutation(({ input }) =>
        updatePaymentRequestStatus(
          input.paymentRequestId,
          "rejected",
          input.notes
        )
      ),

    deliverContent: adminProcedure
      .input(
        z.object({
          paymentRequestId: z.number(),
          deliveryType: z.enum(["course", "api", "tool", "service"]),
          accessLink: z.string().optional(),
          apiKey: z.string().optional(),
          credentials: z.string().optional(),
          expiresAt: z.date().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const paymentRequest = await getPaymentRequestById(
          input.paymentRequestId
        );
        if (!paymentRequest) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const result = await createCourseDeliverable({
          productId: paymentRequest.productId,
          paymentRequestId: input.paymentRequestId,
          userId: paymentRequest.userId,
          deliveryType: input.deliveryType,
          accessLink: input.accessLink,
          apiKey: input.apiKey,
          credentials: input.credentials,
          expiresAt: input.expiresAt,
          isActive: 1,
        });

        // Mark payment as delivered
        await updatePaymentRequestStatus(
          input.paymentRequestId,
          "delivered"
        );

        return result;
      }),
  }),
});

export type AppRouter = typeof appRouter;
