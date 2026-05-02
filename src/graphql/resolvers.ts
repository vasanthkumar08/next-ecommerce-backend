import { GraphQLError } from "graphql";
import Product from "../modules/product/product.model";
import Order from "../modules/order/order.model";
import Review from "../modules/review/review.model";
import * as authService from "../modules/auth/auth.service";
import * as cartService from "../modules/cart/cart.service";
import * as orderService from "../modules/order/order.service";
import * as wishlistService from "../modules/wishlist/wishlist.service";
import type { GraphQLContext } from "./context";

const requireUser = (context: GraphQLContext) => {
  if (!context.user?._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  return context.user;
};

const requireAdmin = (context: GraphQLContext) => {
  const user = requireUser(context);

  if (user.role !== "admin") {
    throw new GraphQLError("Admin access required", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  return user;
};

const productBadge = (product: any) => {
  if (product.discount > 0) return "Sale";
  if (product.isFeatured) return "Trending";
  const createdAt = product.createdAt ? new Date(product.createdAt).getTime() : 0;
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - createdAt < sevenDays ? "New" : null;
};

export const resolvers = {
  Date: {
    serialize(value: unknown) {
      return value instanceof Date ? value.toISOString() : value;
    },
  },

  Product: {
    id: (product: any) => product._id.toString(),
    _id: (product: any) => product._id.toString(),
    image: (product: any) => product.image || product.images?.[0]?.url || "",
    countInStock: (product: any) => product.countInStock ?? product.stock ?? 0,
    badge: productBadge,
    reviews: (product: any) => Review.find({ product: product._id }).populate("user").sort({ createdAt: -1 }),
  },

  Cart: {
    id: (cart: any) => cart._id.toString(),
    totalItems: (cart: any) =>
      cart.totalItems ?? cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    totalPrice: (cart: any) =>
      cart.totalPrice ?? cart.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
  },

  Order: {
    id: (order: any) => order._id.toString(),
    _id: (order: any) => order._id.toString(),
    totalPrice: (order: any) => order.totalPrice ?? order.totalAmount,
  },

  Query: {
    getProducts: async (_: unknown, args: { filters?: { search?: string; category?: string; minPrice?: number; maxPrice?: number; inStock?: boolean; limit?: number; skip?: number } }) => {
      const filters = args.filters || {};
      const filter: Record<string, unknown> = { isActive: true };
      const limit = Math.min(Math.max(Number(filters.limit ?? 20), 1), 100);
      const skip = Math.max(Number(filters.skip ?? 0), 0);

      if (filters.category) filter.category = { $regex: `^${filters.category}$`, $options: "i" };
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        filter.price = {
          ...(filters.minPrice !== undefined ? { $gte: filters.minPrice } : {}),
          ...(filters.maxPrice !== undefined ? { $lte: filters.maxPrice } : {}),
        };
      }
      if (filters.inStock) filter.stock = { $gt: 0 };
      if (filters.search) {
        filter.$or = [
          { name: { $regex: filters.search, $options: "i" } },
          { category: { $regex: filters.search, $options: "i" } },
          { brand: { $regex: filters.search, $options: "i" } },
        ];
      }

      const [items, total] = await Promise.all([
        Product.find(filter)
          .sort({ isFeatured: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Product.countDocuments(filter),
      ]);

      return {
        items,
        total,
        limit,
        skip,
        hasMore: skip + items.length < total,
      };
    },

    getProductById: (_: unknown, args: { id: string }) => Product.findById(args.id),

    getCart: (_: unknown, __: unknown, context: GraphQLContext) => {
      const user = requireUser(context);
      return cartService.getCart(user._id);
    },

    getOrders: (_: unknown, __: unknown, context: GraphQLContext) => {
      const user = requireUser(context);
      return orderService.getMyOrders(user._id);
    },

    getWishlist: (_: unknown, __: unknown, context: GraphQLContext) => {
      const user = requireUser(context);
      return wishlistService.getWishlist(user._id);
    },
  },

  Mutation: {
    registerUser: async (_: unknown, args: { input: { name: string; email: string; password: string } }) => {
      const user = await authService.registerUser(args.input);
      const login = await authService.loginUser({
        email: args.input.email,
        password: args.input.password,
      });

      return {
        user,
        token: login.accessToken,
        accessToken: login.accessToken,
      };
    },

    loginUser: async (_: unknown, args: { input: { email: string; password: string } }) => {
      const { user, accessToken } = await authService.loginUser(args.input);

      return {
        user,
        token: accessToken,
        accessToken,
      };
    },

    addToCart: async (_: unknown, args: { productId: string; quantity: number }, context: GraphQLContext) => {
      const user = requireUser(context);
      await cartService.addToCart(user._id, args.productId, args.quantity);
      return cartService.getCart(user._id);
    },

    updateCartQuantity: async (_: unknown, args: { productId: string; quantity: number }, context: GraphQLContext) => {
      const user = requireUser(context);
      await cartService.updateCartItem(user._id, args.productId, args.quantity);
      return cartService.getCart(user._id);
    },

    removeFromCart: async (_: unknown, args: { productId: string }, context: GraphQLContext) => {
      const user = requireUser(context);
      await cartService.removeFromCart(user._id, args.productId);
      return cartService.getCart(user._id);
    },

    placeOrder: (_: unknown, args: { shippingAddress: any; paymentMethod: "cod" | "credit_card" | "debit_card" | "upi" }, context: GraphQLContext) => {
      const user = requireUser(context);
      return orderService.createOrder(user._id, args.shippingAddress, args.paymentMethod);
    },

    addToWishlist: async (_: unknown, args: { productId: string }, context: GraphQLContext) => {
      const user = requireUser(context);
      await wishlistService.addToWishlist(user._id, args.productId);
      return wishlistService.getWishlist(user._id);
    },

    removeFromWishlist: async (_: unknown, args: { productId: string }, context: GraphQLContext) => {
      const user = requireUser(context);
      await wishlistService.removeFromWishlist(user._id, args.productId);
      return wishlistService.getWishlist(user._id);
    },

    deleteOrder: async (_: unknown, args: { id: string }, context: GraphQLContext) => {
      requireAdmin(context);
      const order = await Order.findById(args.id);

      if (!order) {
        throw new GraphQLError("Order not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      const isDelivered =
        order.isDelivered ||
        order.status === "delivered" ||
        order.status === "completed";

      if (!isDelivered) {
        throw new GraphQLError("Only delivered orders can be deleted", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      await order.deleteOne();
      return order;
    },
  },
};
