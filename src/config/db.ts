import mongoose from "mongoose";
import dotenv from "dotenv";
// ✅ FIX: remove .js extension
import logger from "../utils/logger.js";

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI as string;
    const conn = await mongoose.connect(mongoURI);
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