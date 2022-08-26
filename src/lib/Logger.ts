import { CloudWatchLogger } from "./CloudWatchLogger";
import { CriticalLog, ErrorLog, InfoLog, Level, Log, SecurityLog, WarningLog } from "../types";

export class Logger {
  logger: CloudWatchLogger;

  constructor(
    /**
     * AWS CloudWatch Region
     */
    private region: string,
    /**
     * AWS CloudWatch Access key
     */
    private accessKeyId: string,
    /**
     * AWS CloudWatch Secret access key
     */
    private secretAccessKey: string,
    /**
     * AWS CloudWatch Log group name
     */
    private logGroupName: string,
    /**
     * AWS CloudWatch Log stream name.
     */
    private logStreamName: string,
    /**
     * Frequency to upload logs to AWS CloudWatch. Default is 2000ms.
     */
    public uploadFrequency: number = 2000
  ) {
    this.logger = new CloudWatchLogger(region, accessKeyId, secretAccessKey, logGroupName, logStreamName);
  }

  public log(level: Level, message: Log) {
    this.logger.log({ level: Level[level], ...message });
  }

  public critical(message: CriticalLog) {
    this.log(Level.Critical, message);
  }

  public error(message: ErrorLog) {
    this.log(Level.Error, message);
  }

  public warn(message: WarningLog) {
    this.log(Level.Warning, message);
  }

  public info(message: InfoLog) {
    this.log(Level.Info, message);
  }

  public security(message: SecurityLog) {
    this.log(Level.Security, message);
  }
}
