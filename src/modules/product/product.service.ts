import Product from "./product.model.js";
import type { IProduct } from "./product.model.js";
import APIFeatures from "../../utils/apiFeatures.js";
import { getCache, setCache } from "../../utils/cache.js";

/* ===================== TYPES ===================== */

interface QueryString {
  [key: string]: unknown;
}

interface ProductResponse {
  products: IProduct[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/* ===================== GET PRODUCTS ===================== */

export const getProducts = async (
  queryString: QueryString
): Promise<ProductResponse> => {
  const cacheKey = `products:${JSON.stringify(queryString)}`;

  // ⚡ CHECK CACHE FIRST
  const cached = (await getCache(cacheKey)) as ProductResponse | null;
  if (cached) return cached;

  const baseQuery = Product.find({ isActive: true });

  const features = new APIFeatures(baseQuery, queryString)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .lean();

  const products = await features.query;

  // ⚡ COUNT QUERY (OPTIMIZED)
  const countQuery = new APIFeatures(
    Product.find({ isActive: true }),
    queryString
  )
    .search()
    .filter();

  const total = await countQuery.query.countDocuments();

  const limit = Math.min(Number(queryString.limit) || 10, 50);
  const page = Math.max(Number(queryString.page) || 1, 1);

  const result: ProductResponse = {
    products,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };

  // ⚡ CACHE RESULT (5 MIN)
  await setCache(cacheKey, result, 300);

  return result;
};

/* ===================== PRODUCT CRUD ===================== */
export const createProduct = async (
  data: Record<string, unknown>,
  createdBy: string
) => {
  const name = typeof data.name === "string" ? data.name : "";
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return Product.create({ ...data, slug, createdBy });
};

export const getProductById = async (id: string) => {
  return Product.findById(id);
};

export const updateProduct = async (
  id: string,
  data: Record<string, unknown>
) => {
  return Product.findByIdAndUpdate(id, data, { new: true });
};

export const deleteProduct = async (id: string) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    return { message: "Product not found" };
  }
  return { message: "Product deleted successfully" };
};
