import Joi from "joi";

/* ===================== IMAGE TYPE ===================== */

const imageSchema = Joi.object({
  url: Joi.string().uri().required(),
  public_id: Joi.string().required(),
});

/* ===================== CREATE PRODUCT ===================== */

export const createProductValidator = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),

  description: Joi.string().trim().min(10).required(),

  price: Joi.number().min(0).required(),
  discount: Joi.number().min(0).max(95).optional(),

  category: Joi.string().required(),

  brand: Joi.string().allow("").optional(),
  sku: Joi.string().allow("").optional(),
  ratings: Joi.number().min(0).max(5).optional(),

  stock: Joi.number().integer().min(0).required(),

  images: Joi.array().items(imageSchema).min(1).required(),
});

/* ===================== UPDATE PRODUCT ===================== */

export const updateProductValidator = Joi.object({
  name: Joi.string().trim().min(2).max(120),

  description: Joi.string().trim().min(10),

  price: Joi.number().min(0),
  discount: Joi.number().min(0).max(95),

  category: Joi.string(),

  brand: Joi.string().allow(""),
  sku: Joi.string().allow(""),
  ratings: Joi.number().min(0).max(5),
  images: Joi.array().items(imageSchema).min(1),

  stock: Joi.number().integer().min(0),

  isActive: Joi.boolean(),

  isFeatured: Joi.boolean(),
}).min(1); // 🔥 at least one field required
