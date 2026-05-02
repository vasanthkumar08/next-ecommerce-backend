import winston from "winston";
import path from "path";

/**
 * 📁 Log directory
 */
const logDir = "logs";
 
/**
 * 🎯 Logger instance
 */
const logger = winston.createLogger({
  level: "info",

  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),

  transports: [
    /**
     * ❌ Error logs
     */
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),

    /**
     * 📦 All logs
     */
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
  ],
});

/**
 * 🖥 Console logs (dev only)
 */
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export default logger;