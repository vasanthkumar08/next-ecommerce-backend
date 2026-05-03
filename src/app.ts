import express, { Application } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import corsMiddleware from "./config/cors.js";
import routes from "./routes.js";
import errorMiddleware from "./middleware/error.middleware.js";
import { apiLimiter, rateLimitMiddleware } from "./middleware/rateLimiter.js";

const app: Application = express();

app.use(corsMiddleware);
app.options(/.*/, corsMiddleware);
app.use(helmet());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

app.use(["/api", "/v1"], (req, res, next) => {
  if (req.method === "OPTIONS") return next();
  return rateLimitMiddleware(apiLimiter)(req, res, next);
});

app.use("/api", routes);
app.use(routes);
app.use(errorMiddleware);

export default app;
