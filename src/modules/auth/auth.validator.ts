import { z } from "zod";

const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be 72 characters or fewer")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/\d/, "Password must include a number")
  .regex(/[@$!%*?&]/, "Password must include a special character (@$!%*?&)");

export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(50),
    email: z.string().trim().toLowerCase().email().max(100),
    password: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(100),
  password: z.string().min(1),
  rememberMe: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(100),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32),
  password: strongPassword,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

export const verifyEmailSchema = z.object({
  token: z.string().min(32),
});

export const oauthSessionSchema = z.object({
  provider: z.enum(["google", "github"]),
  providerAccountId: z.string().min(1),
  email: z.string().trim().toLowerCase().email().max(100),
  name: z.string().trim().min(1).max(80).optional(),
  avatarUrl: z.string().url().optional(),
  emailVerified: z.boolean().optional(),
  rememberMe: z.boolean().optional().default(false),
});

export const revokeSessionSchema = z.object({
  sessionId: z.string().min(12),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OAuthSessionInput = z.infer<typeof oauthSessionSchema>;
