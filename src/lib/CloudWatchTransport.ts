import Transport from "winston-transport";
import { CloudWatchLogger } from "./CloudWatchLogger";
import TransportStream from "winston-transport";

export class CloudWatchTransport extends Transport {
  logger: CloudWatchLogger;

  constructor(opts?: TransportStream.TransportStreamOptions) {
    super(opts);

    this.logger = new CloudWatchLogger(
      process.env["REACT_APP_AWS_REGION"] || "",
      process.env["REACT_APP_AWS_ACCESS_KEY"] || "",
      process.env["REACT_APP_AWS_SECRET_ACCESS_KEY"] || "",
      "frontend",
      "winstonStream"
    );
  }

  log(log: object, next: () => void) {
    this.logger.log(log);

    next();
  }
}
