import Joi from "joi";

// ✅ FIX: pattern matches what the frontend actually sends
// Strong pattern kept but error message now surfaces to the client clearly
const strongPassword =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,50}$/;

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(3).max(50).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters",
  }),

  email: Joi.string().trim().lowercase().email().max(100).required().messages({
    "string.email": "Invalid email address",
    "string.empty": "Email is required",
  }),

  password: Joi.string()
    .pattern(strongPassword)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.pattern.base":
        "Password must be 8-50 characters and include uppercase, lowercase, number and special character (@$!%*?&)",
    }),

  confirmPassword: Joi.any()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
      "any.required": "Please confirm your password",
    }),
}).options({ abortEarly: false, stripUnknown: true });

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(100).required(),
  password: Joi.string().required(),
}).options({ abortEarly: false, stripUnknown: true });

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});