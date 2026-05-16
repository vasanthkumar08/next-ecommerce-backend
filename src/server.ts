// ================= ENV =================
import "./config/env.js";

// ================= APP =================
import app from "./app.js";
import connectDB from "./config/db.js";
import { setupGraphQL } from "./graphql/server.js";
import logger from "./utils/logger.js";

// ================= UNCAUGHT EXCEPTION =================
process.on("uncaughtException", (err) => {
  logger.error("uncaught_exception", { error: err });
  process.exit(1);
});

let server: ReturnType<typeof app.listen> | undefined;

const closeServer = (callback?: () => void) => {
  if (!server) {
    callback?.();
    return;
  }

  server.close(callback);
};

const bootstrap = async () => {
  // ================= DB =================
  await connectDB();

  // ================= GRAPHQL =================
  await setupGraphQL(app);

  // ================= SERVER =================
  const PORT = process.env.PORT || 5000;

  server = app.listen(PORT, () => {
    logger.info("server_started", {
      port: PORT,
      environment: process.env.NODE_ENV || "development",
    });
    logger.info("graphql_ready", { path: "/graphql" });
  });
};

bootstrap().catch((err) => {
  logger.error("server_bootstrap_failed", { error: err });
  process.exit(1);
});

// ================= ERROR HANDLING =================
process.on("unhandledRejection", (err) => {
  logger.error("unhandled_rejection", { error: err });
  closeServer(() => process.exit(1));
});

// ================= SHUTDOWN =================
process.on("SIGTERM", () => {
  logger.warn("sigterm_received");
  closeServer(() => logger.info("server_stopped"));
});

process.on("SIGINT", () => {
  logger.warn("sigint_received");
  closeServer(() => logger.info("server_stopped"));
});

// ================= WARN FILTER =================
const originalWarn = console.warn;

console.warn = (...args) => {
  if (
    typeof args[0] === "string" &&
    args[0].includes("Eviction policy")
  ) {
    return;
  }
  originalWarn(...args);
};
