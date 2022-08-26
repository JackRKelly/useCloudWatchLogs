There are two different methods of logging to CloudWatch here. 

lib/CloudWatchLogger.ts is the common class to interact with CloudWatch.

See App.tsx for the logging done without Winston.
 - lib/Logger.ts is a class to implement custom log levels to mock winston
 - LoggerContext.tsx is a logger context provider to support the singleton design pattern
 - types/index.ts defines the Schema per log level. These can be easily changed.

See Winston.tsx for logging with Winston.
 - lib/CloudWatchTranport.ts is a custom winston transport that interacts with lib/CloudWatchLogger.ts