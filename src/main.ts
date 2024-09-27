import { ValidationPipe } from '@nestjs/common';

import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { NestExpressApplication } from '@nestjs/platform-express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  const httpAdapterHost = app.get(HttpAdapterHost);

  // Create an instance of your AllExceptionsFilter and pass the HttpAdapterHost
  const allExceptionsFilter = new AllExceptionsFilter(httpAdapterHost);

  // Use the global exception filter
  app.useGlobalFilters(allExceptionsFilter);

  app.useStaticAssets('public', {
    prefix: '/public',
  });

  app.enableCors({
    exposedHeaders: ['content-disposition', 'custom-filename'],
    credentials: true,
    origin: (origin, callback) => {
      callback(null, true);
    },
  });

  app.setGlobalPrefix('api');

  const options = new DocumentBuilder()
    .setTitle('Admin Panel Apis')
    .setDescription('')
    .setVersion('1.0')
    .addTag('Admin Panel Apis')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    })
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('', app, document);

  app.get(WINSTON_MODULE_NEST_PROVIDER);

  await app.startAllMicroservices();
  await app.listen(process.env.PORT);
  console.log(`Application is running on: ${process.env.PORT}`);
}

bootstrap();
