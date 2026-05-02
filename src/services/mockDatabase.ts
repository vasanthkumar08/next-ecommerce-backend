import type { CartItem } from "@/features/cart/cartSlice";
import type { Order, OrderItem } from "@/features/orders/ordersSlice";
import type { AdminProduct, ProductImage } from "@/types/admin";
import type { Product } from "@/types/product";
import type { Review } from "@/types/review";

export interface MockBackendProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  countInStock: number;
  rating: number;
  numReviews: number;
  createdAt: string;
}

export interface MockOrderInput {
  userId: string;
  orderItems: CartItem[];
  totalPrice: number;
  isPaid: boolean;
  paymentMethod: string;
}

export interface MockReviewInput {
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
}

const PRODUCTS_KEY = "vasanthtrends.mock.products";
const ORDERS_KEY = "vasanthtrends.mock.orders";
const REVIEWS_KEY = "vasanthtrends.mock.reviews";

const now = () => new Date().toISOString();

const seedProducts: MockBackendProduct[] = [
  {
    id: "p-1001",
    name: "Noise Cancelling Wireless Headphones",
    price: 3499,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    description: "Comfortable over-ear headphones with long battery life.",
    category: "electronics",
    countInStock: 18,
    rating: 4.6,
    numReviews: 248,
    createdAt: now(),
  },
  {
    id: "p-1002",
    name: "Smart Fitness Watch",
    price: 2499,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    description: "Track workouts, sleep, heart rate, and notifications.",
    category: "electronics",
    countInStock: 24,
    rating: 4.4,
    numReviews: 190,
    createdAt: now(),
  },
  {
    id: "p-1003",
    name: "Premium Cotton T-Shirt",
    price: 699,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    description: "Soft everyday cotton tee with a relaxed modern fit.",
    category: "fashion",
    countInStock: 42,
    rating: 4.2,
    numReviews: 146,
    createdAt: now(),
  },
  {
    id: "p-1004",
    name: "Leather Office Backpack",
    price: 1899,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    description: "Durable backpack with laptop storage and travel pockets.",
    category: "accessories",
    countInStock: 13,
    rating: 4.5,
    numReviews: 172,
    createdAt: now(),
  },
  {
    id: "p-1005",
    name: "Stainless Steel Water Bottle",
    price: 499,
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80",
    description: "Insulated bottle that keeps drinks hot or cold for hours.",
    category: "home",
    countInStock: 36,
    rating: 4.3,
    numReviews: 116,
    createdAt: now(),
  },
  {
    id: "p-1006",
    name: "Organic Dry Fruit Gift Box",
    price: 1299,
    image:
      "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=900&q=80",
    description: "Gift-ready almonds, cashews, dates, and raisins.",
    category: "grocery",
    countInStock: 20,
    rating: 4.7,
    numReviews: 211,
    createdAt: now(),
  },
];

const canUseStorage = () => typeof window !== "undefined";

function readCollection<T>(key: string, fallback: T[]): T[] {
  if (!canUseStorage()) return fallback;

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(raw) as T[];
  } catch {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function writeCollection<T>(key: string, value: T[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

const delay = () =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, 200);
  });

export const toProduct = (product: MockBackendProduct): Product => ({
  id: product.id,
  title: product.name,
  description: product.description,
  price: product.price,
  image: product.image,
  category: product.category,
  countInStock: product.countInStock,
  rating: {
    rate: product.rating,
    count: product.numReviews,
  },
});

const toAdminProduct = (product: MockBackendProduct): AdminProduct => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  discount: 0,
  category: product.category,
  brand: "Vasanth Trends",
  stock: product.countInStock,
  images: [{ url: product.image, public_id: product.id } satisfies ProductImage],
  ratings: product.rating,
  isActive: true,
  createdAt: product.createdAt,
  updatedAt: product.createdAt,
});

const toOrderItems = (items: CartItem[]): OrderItem[] =>
  items.map((item) => ({
    productId: item.id,
    title: item.title,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
  }));

export async function getMockProducts(): Promise<Product[]> {
  await delay();
  return readCollection<MockBackendProduct>(PRODUCTS_KEY, seedProducts).map(toProduct);
}

export async function getMockProductById(id: string): Promise<Product | null> {
  await delay();
  const product = readCollection<MockBackendProduct>(PRODUCTS_KEY, seedProducts).find(
    (item) => item.id === id
  );
  return product ? toProduct(product) : null;
}

export async function getMockAdminProducts(): Promise<AdminProduct[]> {
  await delay();
  return readCollection<MockBackendProduct>(PRODUCTS_KEY, seedProducts).map(toAdminProduct);
}

export async function upsertMockProduct(
  product: Omit<MockBackendProduct, "id" | "rating" | "numReviews" | "createdAt">,
  id?: string
): Promise<AdminProduct> {
  await delay();
  const products = readCollection<MockBackendProduct>(PRODUCTS_KEY, seedProducts);
  const existing = id ? products.find((item) => item.id === id) : undefined;
  const saved: MockBackendProduct = {
    id: existing?.id ?? `p-${Date.now()}`,
    rating: existing?.rating ?? 0,
    numReviews: existing?.numReviews ?? 0,
    createdAt: existing?.createdAt ?? now(),
    ...product,
  };
  const next = existing
    ? products.map((item) => (item.id === existing.id ? saved : item))
    : [saved, ...products];
  writeCollection(PRODUCTS_KEY, next);
  return toAdminProduct(saved);
}

export async function deleteMockProduct(id: string): Promise<void> {
  await delay();
  const products = readCollection<MockBackendProduct>(PRODUCTS_KEY, seedProducts);
  writeCollection(
    PRODUCTS_KEY,
    products.filter((product) => product.id !== id)
  );
}

export async function createMockOrder(input: MockOrderInput): Promise<Order> {
  await delay();
  const orders = readCollection<Order>(ORDERS_KEY, []);
  const order: Order = {
    id: `o-${Date.now()}`,
    createdAt: now(),
    status: "Pending",
    items: toOrderItems(input.orderItems),
    total: input.totalPrice,
    paymentMethod: input.paymentMethod,
    userId: input.userId,
    isPaid: input.isPaid,
  };
  writeCollection(ORDERS_KEY, [order, ...orders]);
  return order;
}

export async function getMockOrders(userId?: string): Promise<Order[]> {
  await delay();
  const orders = readCollection<Order>(ORDERS_KEY, []);
  return userId ? orders.filter((order) => order.userId === userId) : orders;
}

export async function getMockReviews(productId: string): Promise<Review[]> {
  await delay();
  return readCollection<Review>(REVIEWS_KEY, [])
    .filter((review) => review.productId === productId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function createMockReview(input: MockReviewInput): Promise<Review> {
  await delay();
  const reviews = readCollection<Review>(REVIEWS_KEY, []);
  const review: Review = {
    id: `r-${Date.now()}`,
    createdAt: now(),
    ...input,
  };
  writeCollection(REVIEWS_KEY, [review, ...reviews]);

  const products = readCollection<MockBackendProduct>(PRODUCTS_KEY, seedProducts);
  const nextProducts = products.map((product) => {
    if (product.id !== input.productId) return product;

    const productReviews = [review, ...reviews].filter(
      (item) => item.productId === product.id
    );
    const totalRating = productReviews.reduce((sum, item) => sum + item.rating, 0);

    return {
      ...product,
      rating: Number((totalRating / productReviews.length).toFixed(1)),
      numReviews: productReviews.length,
    };
  });
  writeCollection(PRODUCTS_KEY, nextProducts);

  return review;
}
