import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const requiredEnv: string[] = [
  "MONGO_URI",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "REDIS_URL",
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`❌ Missing env variable: ${key}`);
  }
});

const requireStrongSecret = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`❌ Missing env variable: ${key}`);
  }

  if (process.env.NODE_ENV === "production" && value.length < 32) {
    throw new Error(`❌ ${key} must be at least 32 characters in production`);
  }

  return value;
};

const authInternalSecret =
  process.env.AUTH_INTERNAL_SECRET ||
  process.env.AUTH_SECRET ||
  requireStrongSecret("JWT_SECRET");

if (process.env.NODE_ENV === "production" && authInternalSecret.length < 32) {
  throw new Error(
    "❌ AUTH_INTERNAL_SECRET must be at least 32 characters in production"
  );
}

/**
 * 🌍 ENV TYPE
 */
interface Env {
  NODE_ENV: string;
  PORT: number;

  // DB
  MONGO_URI: string;
  MONGO_MAX_POOL_SIZE: number;
  MONGO_MIN_POOL_SIZE: number;

  // JWT
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;

  // Razorpay
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RAZORPAY_WEBHOOK_SECRET?: string;

  // Cloudinary
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;

  // Email
  EMAIL_USER?: string;
  EMAIL_PASS?: string;

  // Security
  BCRYPT_SALT_ROUNDS: number;
  AUTH_INTERNAL_SECRET: string;

  // Redis
  REDIS_URL?: string;
}

/**
 * 🔐 ENV OBJECT
 */
const env: Env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 5000,

  // DB
  MONGO_URI: process.env.MONGO_URI as string,
  MONGO_MAX_POOL_SIZE: Number(process.env.MONGO_MAX_POOL_SIZE) || 50,
  MONGO_MIN_POOL_SIZE: Number(process.env.MONGO_MIN_POOL_SIZE) || 5,

  // JWT
  JWT_SECRET: requireStrongSecret("JWT_SECRET"),
  JWT_REFRESH_SECRET: requireStrongSecret("JWT_REFRESH_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "15m",
  JWT_REFRESH_EXPIRES_IN:
    process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,

  // Cloudinary
  CLOUDINARY_CLOUD_NAME:
    process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET:
    process.env.CLOUDINARY_API_SECRET,

  // Email
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,

  // Security
  BCRYPT_SALT_ROUNDS:
    Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  AUTH_INTERNAL_SECRET:
    authInternalSecret,

  // Redis
  REDIS_URL: process.env.REDIS_URL,
};

export default env;
