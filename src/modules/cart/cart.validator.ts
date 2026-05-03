import Joi from "joi";

/**
 * ➕ Add to Cart
 */
export const addToCartValidator = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().min(1).default(1),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

/**
 * 🔁 Update Cart Item
 */
export const updateCartValidator = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().min(0).required(),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

/**
 * ❌ Remove Cart Item
 */
export const removeItemValidator = Joi.object({
  productId: Joi.string().required(),
}).options({
  abortEarly: false,
  stripUnknown: true,
});
