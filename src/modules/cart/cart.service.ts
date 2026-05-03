import mongoose, { ClientSession } from "mongoose";
import Cart from "./cart.model.js";
import Product from "../product/product.model.js";
import AppError from "../../utils/AppError.js";

/* ===================== TYPES ===================== */
interface CartItemInput {
  productId: string;
  quantity: number;
}

interface UserCart {
  user: string;
  items: Array<{
    product: { toString(): string };
    quantity: number;
    price: number;
    name?: string;
    image?: string;
  }>;
}

/* ===================== ADD TO CART ===================== */
export const addToCart = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError("Invalid productId", 400);
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new AppError("Invalid quantity", 400);
  }

  const session: ClientSession = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findById(productId).session(session);

    if (!product) throw new AppError("Product not found", 404);
    if (product.stock < quantity) {
      throw new AppError("Insufficient stock", 400);
    }

    let cart = await Cart.findOne({ user: userId }).session(session);

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item: any) => item.product.toString() === productId
    );

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;

      if (product.stock < newQty) {
        throw new AppError("Stock exceeded", 400);
      }

      existingItem.quantity = newQty;
      existingItem.price = product.price;
    } else {
      cart.items.push({
        product: product._id,
        quantity,
        price: product.price,
        name: product.name,
        image: product.images?.[0]?.url || "",
      });
    }

    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    return cart;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/* ===================== GET CART ===================== */
export const getCart = async (userId: string) => {
  return Cart.findOne({ user: userId }).populate("items.product");
};

/* ===================== UPDATE CART ITEM ===================== */
export const updateCartItem = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError("Invalid productId", 400);
  }

  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new AppError("Invalid quantity", 400);
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError("Cart not found", 404);

  const item = cart.items.find((i: any) => i.product.toString() === productId);
  if (!item) throw new AppError("Item not found in cart", 404);

  if (quantity <= 0) {
    cart.items = cart.items.filter(
      (i: any) => i.product.toString() !== productId
    ) as any;
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  return cart;
};

/* ===================== REMOVE FROM CART ===================== */
export const removeFromCart = async (userId: string, productId: string) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError("Invalid productId", 400);
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError("Cart not found", 404);

  cart.items = cart.items.filter(
    (item: any) => item.product.toString() !== productId
  ) as any;
  await cart.save();
  return cart;
};

/* ===================== CLEAR CART ===================== */
export const clearCart = async (userId: string) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return { message: "Cart already empty" };

  cart.items = [] as any;
  await cart.save();
  return { message: "Cart cleared" };
};
