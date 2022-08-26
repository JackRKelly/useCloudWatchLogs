import React from "react";
import ReactDOM from "react-dom";
import { LoggerContextProvider } from "./LoggerContext";
import { Logger } from "./lib/Logger";
import { App } from "./App";
import { Winston } from "./Winston";

const isWinston = false;

const logger = new Logger(
  process.env["REACT_APP_AWS_REGION"] || "",
  process.env["REACT_APP_AWS_ACCESS_KEY"] || "",
  process.env["REACT_APP_AWS_SECRET_ACCESS_KEY"] || "",
  "frontend",
  "appStream"
);

ReactDOM.render(
  <LoggerContextProvider logger={logger}>
    <React.StrictMode>{isWinston ? <Winston /> : <App />}</React.StrictMode>
  </LoggerContextProvider>,
  document.getElementById("root")
);
