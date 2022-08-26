import React from "react";
import winston, { createLogger } from "winston";
import { CloudWatchTransport } from "./lib/CloudWatchTransport";

export const LogLevel = {
  critical: 0,
  error: 1,
  security: 2,
  warn: 3,
  info: 4,
  trace: 5,
};

export const logger = createLogger({
  levels: LogLevel,
  transports: [
    // new transports.Console(),
    new CloudWatchTransport(),
  ],
}) as winston.Logger &
  // modify logger type with log methods based on our custom LogLevels (e.g. logger.critical, logger.security, logger,info, etc.
  Record<keyof typeof LogLevel, winston.LeveledLogMethod>;

export function Winston() {
  return (
    <div>
      <header>
        <h1>
          Yellow Frontend Logging Framework <b>Winston</b> POC
        </h1>
        <fieldset>
          <legend>Winston Logger</legend>
          <button
            onClick={() => {
              logger.critical({
                message: "Critical Log",
                stack: "CloudWatchLogger.ts",
                correlationId: "12345678910",
              });
            }}
          >
            Critical log
          </button>
          <button
            onClick={() => {
              logger.error({
                message: "Error Log",
                stack: "CloudWatchLogger.ts",
                correlationId: "12345678910",
              });
            }}
          >
            Error log
          </button>
          <button
            onClick={() => {
              logger.warn({
                message: "Warning Log",
                stack: "CloudWatchLogger.ts",
                correlationId: "12345678910",
              });
            }}
          >
            Warning log
          </button>
          <button
            onClick={() => {
              logger.security({
                message: "Security Log",
                stack: "CloudWatchLogger.ts",
                correlationId: "12345678910",
              });
            }}
          >
            Security log
          </button>
          <button
            onClick={() => {
              logger.info({
                message: "Information Log",
                stack: "CloudWatchLogger.ts",
                correlationId: "12345678910",
              });
            }}
          >
            Info log
          </button>
        </fieldset>
      </header>
    </div>
  );
}
