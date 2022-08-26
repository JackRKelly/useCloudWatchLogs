interface LogBase {
  message: string;
  stack: string;
  correlationId: string;
}

export interface CriticalLog extends LogBase {}

export interface ErrorLog extends LogBase {}

export interface SecurityLog extends LogBase {}

export interface WarningLog extends LogBase {}

export interface InfoLog extends LogBase {
  query?: string;
}

export enum Level {
  Critical,
  Error,
  Security,
  Warning,
  Info,
}

export type Log = CriticalLog | ErrorLog | SecurityLog | WarningLog | InfoLog;
