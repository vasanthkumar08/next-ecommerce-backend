import mongoose from "mongoose";
import env from "./env.js";
import logger from "../utils/logger.js";

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = env.MONGO_URI;
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
      maxPoolSize: 10,
      minPoolSize: 1,
    });
    logger.info(`🟢 MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on("disconnected", () =>
      logger.warn("⚠️ MongoDB disconnected")
    );
    mongoose.connection.on("reconnected", () =>
      logger.info("🔄 MongoDB reconnected")
    );
    mongoose.connection.on("error", (err: Error) =>
      logger.error(`❌ MongoDB error: ${err.message}`)
    );
    mongoose.connection.on("connected", () =>
      logger.info("🟢 MongoDB connection ready")
    );
  } catch (error: unknown) {
    logger.error(
      error instanceof Error
        ? `❌ MongoDB Connection Error: ${error.message}`
        : "❌ MongoDB Connection Error"
    );
    process.exit(1);
  }
};

export default connectDB;
