import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
  InputLogEvent,
  DescribeLogGroupsCommand,
  DescribeLogStreamsCommand,
  CreateLogStreamCommand,
} from "@aws-sdk/client-cloudwatch-logs";

export class CloudWatchLogger {
  private logStream: Array<InputLogEvent> = [];

  private __sequenceToken?: string;

  private __isReady = false;

  private readonly __interval: NodeJS.Timeout;

  private __isDisabled = false;

  private client: CloudWatchLogsClient;

  private getLocalStorage(key: string): string | undefined {
    return window.localStorage.getItem(`CloudWatchLogger_${key}`) ?? undefined;
  }

  private setLocalStorage(key: string, value: string): void {
    window.localStorage.setItem(`CloudWatchLogger_${key}`, value);
  }

  private removeLocalStorage(key: string): void {
    window.localStorage.removeItem(`CloudWatchLogger_${key}`);
  }

  private createSequenceStorageKey(group: string, stream: string): string {
    return `sequenceToken-${group}:${stream}`;
  }

  private get sequenceToken(): string | undefined {
    if (!this.__sequenceToken?.length) {
      let sequenceStorageKey = this.createSequenceStorageKey(this.logGroupName, this.logStreamName);
      this.__sequenceToken = this.getLocalStorage(sequenceStorageKey);
    }

    return this.__sequenceToken;
  }

  private set sequenceToken(token) {
    if (token) {
      this.__sequenceToken = token;
      let sequenceStorageKey = this.createSequenceStorageKey(this.logGroupName, this.logStreamName);
      this.setLocalStorage(sequenceStorageKey, token);
    } else {
      console.warn("No new sequence token provided");
    }
  }

  private removeSequenceToken(): void {
    this.removeLocalStorage(this.createSequenceStorageKey(this.logGroupName, this.logStreamName));
  }

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
    this.client = new CloudWatchLogsClient({
      region: this.region,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });
    this.__interval = setInterval(this.upload.bind(this), this.uploadFrequency);
    this.log = this.log.bind(this);
    this.upload = this.upload.bind(this);
  }

  private async __initialize() {
    if (!this.__isReady && !this.__isDisabled) {
      await this.ensureGroupPresent(this.logGroupName);
      await this.ensureStreamPresent(this.logGroupName, this.logStreamName);
      this.__isReady = true;
    }
  }

  private async ensureGroupPresent(group: string): Promise<void> {
    if (!this.__isDisabled) {
      try {
        const describeResponse = await this.client.send(
          new DescribeLogGroupsCommand({
            logGroupNamePrefix: group,
            nextToken: this.__sequenceToken,
          })
        );

        const { logGroups } = describeResponse;

        console.log("Log groups retrieved", logGroups);

        if (logGroups?.length === 0 || logGroups?.[0].logGroupName !== group) {
          console.error("Log group not found, disabling cloudwatch functionality");
          this.__isDisabled = true;
        }
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  private async createStream(group: string, stream: string): Promise<void> {
    if (!this.__isDisabled) {
      try {
        const createResponse = await this.client.send(
          new CreateLogStreamCommand({
            logGroupName: group,
            logStreamName: stream,
          })
        );

        const {
          $metadata: { httpStatusCode },
        } = createResponse;

        if (httpStatusCode === 200) {
          console.log(`New log stream (${stream}) created in group (${group}).`);
        }
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  private async ensureStreamPresent(group: string, stream: string): Promise<void> {
    if (!this.__isDisabled) {
      try {
        const describeResponse = await this.client.send(
          new DescribeLogStreamsCommand({
            logGroupName: this.logGroupName,
            logStreamNamePrefix: this.logStreamName,
            nextToken: this.__sequenceToken,
          })
        );

        const { logStreams } = describeResponse;

        console.log("Log streams retrieved", logStreams);

        if (logStreams?.length === 0 || logStreams?.[0].logStreamName !== this.logStreamName) {
          await this.createStream(group, stream);
        }
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  public log(data: any): void {
    this.logStream.push({
      timestamp: new Date().getTime(),
      message: JSON.stringify(data),
    });
  }

  public async upload(): Promise<void> {
    await this.__initialize();
    if (this.__isDisabled) {
      clearInterval(this.__interval);
    }
    if (this.logStream && this.logStream.length >= 1 && !this.__isDisabled) {
      console.log(`Uploading logs to CloudWatch | ${this.logGroupName} > ${this.logStreamName}`, this.logStream);

      try {
        const uploadResponse = await this.client.send(
          new PutLogEventsCommand({
            logEvents: this.logStream,
            logGroupName: this.logGroupName,
            logStreamName: this.logStreamName,
            sequenceToken: this.sequenceToken,
          })
        );
        if (uploadResponse) {
          const { nextSequenceToken, rejectedLogEventsInfo } = uploadResponse;

          if (nextSequenceToken) {
            this.sequenceToken = nextSequenceToken;
          }

          if (rejectedLogEventsInfo) {
            const { expiredLogEventEndIndex, tooOldLogEventEndIndex, tooNewLogEventStartIndex } = rejectedLogEventsInfo;

            if (expiredLogEventEndIndex) {
              console.error(`Log event expired at index: ${expiredLogEventEndIndex}`);
            }
            if (tooOldLogEventEndIndex) {
              console.error(`Log event too old at index: ${tooOldLogEventEndIndex}`);
            }
            if (tooNewLogEventStartIndex) {
              console.error(`Log event too new at index: ${tooNewLogEventStartIndex}`);
            }
          } else {
            this.logStream = [];
          }
        }
      } catch (error) {
        if (error.name === "InvalidSequenceTokenException") {
          console.error(`Sequence token was invalid, setting token and retrying. ${error.expectedSequenceToken}`);

          if (error.expectedSequenceToken) {
            this.sequenceToken = error.expectedSequenceToken;
          } else {
            this.removeSequenceToken();
          }

          this.upload().then(null);
        } else if (error.name === "DataAlreadyAcceptedException") {
          console.error(`Batch already accepted, setting token and retrying. ${error.expectedSequenceToken}`);

          if (error.expectedSequenceToken) {
            this.sequenceToken = error.expectedSequenceToken;
          } else {
            this.removeSequenceToken();
          }

          this.upload().then(null);
        } else {
          throw new Error(error);
        }
      }
    }
  }
}
