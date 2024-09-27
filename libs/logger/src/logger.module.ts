import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { ILogger } from './interface/logger.interface';
import loggerFunction from './logger.config';
@Module({
  imports: [],
  providers: [],
  exports: [],
})
export class Loggermodule {
  static forRoot(config: ILogger) {
    return WinstonModule.forRootAsync({
      useFactory: () => {
        const errorLogPath = `${process.cwd()}/${config.errorPath}`;
        const debugLogPath = `${process.cwd()}/${config.logPath}`;
        const params = {
          errorLogPath,
          debugLogPath,
          nodeEnv: config.nodeEnv,
        };
        const transports = loggerFunction(params);
        return {
          defaultMeta: { service: config.serviceName },
          transports: transports,
        };
      },
    });
  }
}
