export interface ILogger {
  errorPath: string;
  logPath: string;
  serviceName?: string;
  loggelyConfig?: loggelyInterface;
  nodeEnv: string;
}

interface loggelyInterface {
  loggelyToken?: string;
  loggelySubdomain?: string;
  loggelyTags?: string;
}
