import { Request, Response, NextFunction } from "express";
import * as productService from "./product.service";
import { sendResponse } from "../../utils/response";
import type { IProduct } from "./product.model";

/* ===================== TYPES ===================== */

interface AuthRequest extends Request {
  user?: {
    _id: string;
    role?: string;
  };
}

/* ===================== SANITIZER ===================== */

const sanitizeProduct = (product: IProduct | null) => {
  if (!product) return null;

  return {
    id: String(product._id),
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    price: product.price,
    discount: product.discount,
    category: product.category,
    brand: product.brand,
    stock: product.stock,
    ratings: product.ratings,
    numReviews: product.numReviews,
    images: product.images,
    createdBy: product.createdBy,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

/* ===================== CREATE PRODUCT ===================== */

export const create = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const product = await productService.createProduct(
      req.body,
      req.user._id
    );

    return sendResponse(
      res,
      201,
      "Product created successfully",
      sanitizeProduct(product)
    );
  } catch (err) {
    next(err);
  }
};

/* ===================== GET ALL PRODUCTS ===================== */

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await productService.getProducts(req.query);

    return sendResponse(res, 200, "Products fetched successfully", {
      products: result.products.map(sanitizeProduct),
      total: result.total,
      page: result.page,
      pages: result.pages,
    });
  } catch (err) {
    next(err);
  }
};

/* ===================== GET SINGLE PRODUCT ===================== */

export const getOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID required",
      });
    }

    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return sendResponse(
      res,
      200,
      "Product fetched successfully",
      sanitizeProduct(product)
    );
  } catch (err) {
    next(err);
  }
};

/* ===================== UPDATE PRODUCT ===================== */

export const update = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID required",
      });
    }

    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const product = await productService.updateProduct(id, req.body);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return sendResponse(
      res,
      200,
      "Product updated successfully",
      sanitizeProduct(product)
    );
  } catch (err) {
    next(err);
  }
};

/* ===================== DELETE PRODUCT ===================== */

export const remove = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID required",
      });
    }

    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const result = await productService.deleteProduct(id);

    return sendResponse(res, 200, result?.message || "Product deleted");
  } catch (err) {
    next(err);
  }
};
