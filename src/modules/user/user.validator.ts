import Joi from "joi";

/* ===================== COMMON FIELDS ===================== */

export const email = Joi.string()
  .email()
  .lowercase()
  .trim()
  .max(100);

export const password = Joi.string()
  .min(6)
  .max(100)
  .pattern(/^[a-zA-Z0-9@#$%^&*!]+$/);

/* ===================== AVATAR ===================== */

export const avatar = Joi.object({
  url: Joi.string().uri().allow("").optional(),
  public_id: Joi.string().allow("").optional(),
});

/* ===================== REGISTER ===================== */

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),

  email: email.required(),

  password: password.required(),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

/* ===================== LOGIN ===================== */

export const loginSchema = Joi.object({
  email: email.required(),
  password: Joi.string().required(),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

/* ===================== UPDATE PROFILE ===================== */

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).optional(),
  email: email.optional(),
  avatar: avatar.optional(),
})
  .min(1)
  .options({
    abortEarly: false,
    stripUnknown: true,
  });

/* ===================== CHANGE PASSWORD ===================== */

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),

  newPassword: password
    .invalid(Joi.ref("oldPassword"))
    .required()
    .messages({
      "any.invalid": "New password must be different",
    }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

/* ===================== USER QUERY ===================== */

export const userQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(50).optional(),

  role: Joi.string().valid("user", "admin").optional(),
  isBlocked: Joi.boolean().optional(),
}).options({
  abortEarly: false,
  stripUnknown: true,
});