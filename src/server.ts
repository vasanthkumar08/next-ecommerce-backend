// ================= ENV =================
import "./config/env.js";

// ================= APP =================
import app from "./app.js";
import connectDB from "./config/db.js";
import { setupGraphQL } from "./graphql/server.js";

// ================= UNCAUGHT EXCEPTION =================
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

let server: ReturnType<typeof app.listen>;

const bootstrap = async () => {
  // ================= DB =================
  connectDB();

  // ================= GRAPHQL =================
  await setupGraphQL(app);

  // ================= SERVER =================
const PORT = process.env.PORT || 5000;

  server = app.listen(PORT, () => {
    console.log(
      `🚀 Server running on port ${PORT} in ${
        process.env.NODE_ENV || "development"
      } mode`
    );
    console.log("🧩 GraphQL ready at /graphql");
  });
};

bootstrap().catch((err) => {
  console.error("❌ Server bootstrap failed:", err);
  process.exit(1);
});

// ================= ERROR HANDLING =================
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});

// ================= SHUTDOWN =================
process.on("SIGTERM", () => {
  console.log("⚠️ SIGTERM received");
  server.close(() => console.log("🛑 Server stopped"));
});

process.on("SIGINT", () => {
  console.log("⚠️ SIGINT received");
  server.close(() => console.log("🛑 Server stopped"));
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
