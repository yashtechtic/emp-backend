import * as winston from 'winston';
// import { Loggly } from 'winston-loggly-bulk';
const { colorize, errors, splat, combine, timestamp, printf } = winston.format;

const parser = (param) => {
  if (!param) {
    return '';
  }
  if (typeof param === 'string') {
    return param;
  }
  return Object.keys(param).length ? JSON.stringify(param, undefined, 2) : '';
};

/**
 * Chose the aspect of your log customizing the log format.
 */
const consoleFormat = combine(
  errors({ stack: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  splat(),
  printf(
    ({ level, message, meta, stack, ...rest }) =>
      `[${rest.timestamp}] : ${level} > ${parser(message)} ${
        rest ? parser(rest) : ''
      } ${stack || ''}`
  )
);

const logFormat = combine(consoleFormat, winston.format.json());

const loggerFunction = (params) => {
  const { errorPath, debugPath, loggelyConfig, nodeEnv } = params;
  const transports = [];

  if (nodeEnv === 'development') {
    transports.push(
      new winston.transports.Console({
        format: combine(consoleFormat, colorize({ all: true })),
      })
    );
  }
  // const { loggelyToken, loggelySubdomain, loggelyTags } = loggelyConfig;
  // if (loggelyToken && loggelySubdomain && loggelyTags) {
  //   transports.push(
  //     new Loggly({
  //       token: loggelyToken,
  //       subdomain: loggelySubdomain,
  //       tags: [loggelyTags],
  //       json: true,
  //       networkErrorsOnConsole: true,
  //     })
  //   );
  // }

  if (errorPath) {
    transports.push(
      new winston.transports.File({
        filename: errorPath,
        format: logFormat,
        level: 'error',
      })
    );
  }
  if (debugPath) {
    transports.push(
      new winston.transports.File({
        filename: debugPath,
        format: logFormat,
        level: 'info',
      })
    );
  }
  return transports;
};

export default loggerFunction;
