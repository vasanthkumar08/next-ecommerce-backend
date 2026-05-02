import express, { Application } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";

// ✅ FIX: removed all .js extensions
import corsMiddleware from "./config/cors";
import routes from "./routes";
import errorMiddleware from "./middleware/error.middleware";
import { apiLimiter, rateLimitMiddleware } from "./middleware/rateLimiter";

const app: Application = express();

app.use(corsMiddleware);
app.options(/.*/, corsMiddleware);
app.use(helmet());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

app.use("/api", (req, res, next) => {
  if (req.method === "OPTIONS") return next();
  return rateLimitMiddleware(apiLimiter)(req, res, next);
});

app.use("/api", routes);
app.use(errorMiddleware);

export default app;
