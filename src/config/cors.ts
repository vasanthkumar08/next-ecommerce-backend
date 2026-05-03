import cors from "cors";

const normalizeOrigin = (origin: string | undefined) =>
  String(origin || "")
    .trim()
    .replace(/\/+$/, "");

const requiredOrigins = [
  "http://localhost:3000",
  "https://next-ecommerce-frontend-theta.vercel.app",
];

const configuredOrigins = [
  process.env.CLIENT_URL,
  process.env.AUTH_URL,
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .join(",");

const allowedOrigins = Array.from(
  new Set(
    (configuredOrigins || "http://localhost:3000")
      .split(",")
      .map(normalizeOrigin)
      .concat(requiredOrigins)
      .filter(Boolean)
  )
);

const allowedHeaders = [
  "Content-Type",
  "Authorization",
  "Accept",
  "X-Auth-Retry",
  "X-CSRF-Token",
  "X-Requested-With",
  "Apollo-Require-Preflight",
];

export const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(normalizeOrigin(origin))) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders,
  exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining"],
  optionsSuccessStatus: 204,
  preflightContinue: false,
};

export default cors(corsOptions);
