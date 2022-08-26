import { useLogger } from "./LoggerContext";
import React from "react";

export function App() {
  const logger = useLogger();

  return (
    <div>
      <header>
        <h1>Logging Framework POC</h1>
        <fieldset>
          <legend>useLogger Context Logger</legend>
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
