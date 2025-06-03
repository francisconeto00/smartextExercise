const { createLogger, format, transports } = require("winston");

const isDebugEnabled = process.env.LOG_DEBUG === "false";

const logger = createLogger({
  level: isDebugEnabled ? "debug" : "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(
      ({ timestamp, level, message }) =>
        `${timestamp} [${level.toUpperCase()}]: ${message}`
    )
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
});

if (!isDebugEnabled) {
  logger.debug = () => {};
}

module.exports = logger;
