import { Product } from "@/types/product";
import api from "@/lib/axios";
import { fetchMockProductById, fetchMockProducts } from "@/services/mockProducts";

interface ProductImage {
  url: string;
  public_id?: string;
}

interface BackendProduct {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  description: string;
  price: number;
  category: string;
  countInStock?: number;
  stock?: number;
  image?: string;
  images?: ProductImage[];
  ratings?: number;
  rating?: { rate?: number; count?: number };
  numReviews?: number;
}

interface ProductsResponse {
  success: boolean;
  data:
    | {
        products?: BackendProduct[];
      }
    | BackendProduct[];
  message?: string;
}

const getProductId = (product: BackendProduct) =>
  product.id ?? product._id ?? product.name;

const categoryImages: Record<string, string> = {
  electronics:
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=80",
  jewelery:
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
  "men's clothing":
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
  "women's clothing":
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
};

const getProductImage = (product: BackendProduct) => {
  const image = product.images?.[0]?.url ?? product.image;
  if (image?.trim()) {
    return image;
  }

  return (
    categoryImages[product.category?.toLowerCase()] ??
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80"
  );
};

const toProduct = (product: BackendProduct): Product => ({
  id: String(getProductId(product)),
  title: product.name ?? product.title ?? "Untitled product",
  description: product.description,
  price: product.price,
  image: getProductImage(product),
  category: product.category,
  countInStock: product.countInStock ?? product.stock,
  rating: {
    rate: product.ratings ?? product.rating?.rate ?? 0,
    count: product.numReviews ?? product.rating?.count ?? 0,
  },
});

const getProductList = (response: ProductsResponse): BackendProduct[] => {
  const data = response.data;

  if (Array.isArray(data)) {
    return data;
  }

  return data.products ?? [];
};

const productListCache = {
  data: null as Product[] | null,
  expiresAt: 0,
  pending: null as Promise<Product[]> | null,
};

const productByIdCache = new Map<string, { data: Product; expiresAt: number }>();
const cacheTtlMs = 60_000;

/* ===================== SERVICES ===================== */

/**
 * 📦 Get All Products
 */
export const getProducts = async (): Promise<Product[]> => {
  const now = Date.now();

  if (productListCache.data && productListCache.expiresAt > now) {
    return productListCache.data;
  }

  if (productListCache.pending) {
    return productListCache.pending;
  }

  productListCache.pending = (async () => {
  try {
    const res = await api.get<ProductsResponse>("/v1/products", {
      params: { limit: 50 },
    });
    const products = getProductList(res.data).map(toProduct);

    const result = products.length > 0 ? products : await fetchMockProducts();
    productListCache.data = result;
    productListCache.expiresAt = Date.now() + cacheTtlMs;
    return result;
  } catch {
    const fallbackProducts = await fetchMockProducts();
    productListCache.data = fallbackProducts;
    productListCache.expiresAt = Date.now() + cacheTtlMs;
    return fallbackProducts;
  } finally {
    productListCache.pending = null;
  }
  })();

  return productListCache.pending;
};

/**
 * 🔍 Get Product By ID
 */
export const getProductById = async (id: string): Promise<Product> => {
  if (!id) {
    throw new Error("Product ID is required");
  }

  const cached = productByIdCache.get(id);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  try {
    const res = await api.get<{ success: boolean; data: BackendProduct }>(
      `/v1/products/${id}`
    );

    const product = toProduct(res.data.data);
    productByIdCache.set(id, { data: product, expiresAt: Date.now() + cacheTtlMs });
    return product;
  } catch {
    const product = await fetchMockProductById(id);

    if (!product) {
      throw new Error("Product not found");
    }

    productByIdCache.set(id, { data: product, expiresAt: Date.now() + cacheTtlMs });
    return product;
  }
};
