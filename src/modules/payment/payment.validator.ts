import Joi from "joi";

/* ===================== CREATE PAYMENT ORDER ===================== */

export const createPaymentOrderSchema = Joi.object({
  orderId: Joi.string()
    .hex()
    .length(24)
    .required(),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

/* ===================== VERIFY PAYMENT ===================== */

export const verifyPaymentSchema = Joi.object({
  orderId: Joi.string()
    .hex()
    .length(24)
    .required(),

  razorpay_order_id: Joi.string().trim().required(),

  razorpay_payment_id: Joi.string().trim().required(),

  razorpay_signature: Joi.string().trim().required(),
}).options({
  abortEarly: false,
  stripUnknown: true,
});