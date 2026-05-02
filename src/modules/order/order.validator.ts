import Joi from "joi";

/* ===================== ITEM ===================== */

const orderItemSchema = Joi.object({
  product: Joi.string().hex().length(24).optional(),
  productId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
  quantity: Joi.number().min(1).required(),
  price: Joi.number().min(0).required(),
  name: Joi.string().trim().required(),
  image: Joi.string().allow("").optional(),
});

/* ===================== SHIPPING ===================== */

const shippingAddressSchema = Joi.object({
  address: Joi.string().trim().required(),
  city: Joi.string().trim().required(),
  pincode: Joi.string().trim().required(),
  country: Joi.string().trim().required(),
});

/* ===================== CREATE ORDER ===================== */

export const createOrderValidator = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required(),

  shippingAddress: shippingAddressSchema.required(),

  totalAmount: Joi.number().min(0).required(),

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
