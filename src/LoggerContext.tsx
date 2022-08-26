import { Logger } from "./lib/Logger";
import { createContext, ReactNode, useContext } from "react";

export const context = createContext<Logger | null>(null);

export function LoggerContextProvider(props: { children: ReactNode; logger: Logger }) {
  const logger = props.logger;

  return <context.Provider value={logger}>{props.children}</context.Provider>;
}

export function useLogger() {
  const logger = useContext(context);

  if (!logger) {
    throw new Error("You cannot use useLogger without a <LoggerContextProvider />");
  }

  return logger;
}
