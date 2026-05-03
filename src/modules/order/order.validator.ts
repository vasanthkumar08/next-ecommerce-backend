import Joi from "joi";

/* ===================== ITEM ===================== */

const orderItemSchema = Joi.object({
  product: Joi.string().hex().length(24).optional(),
  productId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).required(),
  price: Joi.number().min(0).optional(),
  name: Joi.string().trim().optional(),
  image: Joi.string().allow("").optional(),
});

/* ===================== SHIPPING ===================== */

const shippingAddressSchema = Joi.object({
  address: Joi.string().trim().required(),
  phone: Joi.string()
    .trim()
    .pattern(/^[6-9]\d{9}$/)
    .optional()
    .messages({
      "string.pattern.base": "Valid 10-digit phone number is required",
    }),
  city: Joi.string().trim().required(),
  pincode: Joi.string().trim().required(),
  country: Joi.string().trim().required(),
});

/* ===================== CREATE ORDER ===================== */

export const createOrderValidator = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required(),

  shippingAddress: shippingAddressSchema.required(),

  totalAmount: Joi.number().min(0).optional(),

  paymentMethod: Joi.string()
    .valid("cod", "credit_card", "debit_card", "upi")
    .required(),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

/* ===================== UPDATE STATUS ===================== */

export const updateStatusValidator = Joi.object({
  status: Joi.string()
    .valid(
      "pending",
      "confirmed",
      "paid",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "failed"
    )
    .required(),
}).options({
  abortEarly: false,
  stripUnknown: true,
});
