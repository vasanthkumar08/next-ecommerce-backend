import express, { Application } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import corsMiddleware, { setCorsHeaders } from "./config/cors.js";
import routes from "./routes.js";
import errorMiddleware from "./middleware/error.middleware.js";
import { apiLimiter, rateLimitMiddleware } from "./middleware/rateLimiter.js";
import { csrfProtection } from "./lib/security/csrf.middleware.js";
import { requestContext } from "./middleware/requestContext.middleware.js";

const app: Application = express();

const sanitizeMongoOperators = (value: unknown): void => {
  if (!value || typeof value !== "object") return;

  if (Array.isArray(value)) {
    value.forEach(sanitizeMongoOperators);
    return;
  }

  for (const key of Object.keys(value)) {
    const record = value as Record<string, unknown>;

    if (key.startsWith("$") || key.includes(".")) {
      delete record[key];
      continue;
    }

    sanitizeMongoOperators(record[key]);
  }
};

app.set("trust proxy", 1);
app.use(requestContext);

// CORS must run before Helmet, parsers, rate limiters, auth, and routes.
app.use(setCorsHeaders);
app.use(corsMiddleware);

// Express 5 does not accept app.options("*", ...); /.*/ is the safe global matcher.
app.options(/.*/, corsMiddleware);
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});
app.use(helmet());
app.use(
  express.json({
    limit: "5mb",
    verify: (req, _res, buf) => {
      // Payment providers sign the raw request payload. Keeping a raw copy lets
      // webhook verification stay correct while preserving the global JSON parser.
      (req as express.Request & { rawBody?: Buffer }).rawBody = Buffer.from(buf);
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());
app.use((req, _res, next) => {
  sanitizeMongoOperators(req.body);
  sanitizeMongoOperators(req.params);
  sanitizeMongoOperators(req.query);
  next();
});
app.use(csrfProtection);

app.use(["/api", "/v1"], (req, res, next) => {
  if (req.method === "OPTIONS") return next();
  return rateLimitMiddleware(apiLimiter)(req, res, next);
});

app.use("/api", routes);
app.use(routes);
app.use(errorMiddleware);

export default app;
