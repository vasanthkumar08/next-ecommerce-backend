import winston from "winston";
import path from "path";
import fs from "fs";

/**
 * 📁 Log directory
 */
const logDir = "logs";
const logToFile = process.env.LOG_TO_FILE === "true";

if (logToFile) {
  fs.mkdirSync(logDir, { recursive: true });
}
 
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
    new winston.transports.Console(),
  ],
});

if (logToFile) {
  logger.add(
    /**
     * ❌ Error logs
     */
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    })
  );

  logger.add(
    /**
     * 📦 All logs
     */
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    })
  );
}

export default logger;
