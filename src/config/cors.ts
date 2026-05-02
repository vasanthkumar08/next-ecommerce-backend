import cors from "cors";

const normalizeOrigin = (origin: string | undefined) =>
  String(origin || "")
    .trim()
    .replace(/\/+$/, "");

const allowedOrigins = (process.env.CLIENT_URL ?? "http://localhost:3000")
  .split(",")
  .map(normalizeOrigin)
  .concat([
    "https://ecommerce-frontend-three-psi.vercel.app",
    "http://localhost:3000",
  ])
  .filter(Boolean);

export const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(normalizeOrigin(origin))) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Apollo-Require-Preflight", "X-CSRF-Token"],
  exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining"],
  optionsSuccessStatus: 200,
};

export default cors(corsOptions);
