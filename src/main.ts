import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { NestApplicationOptions } from '@nestjs/common/interfaces/nest-application-options.interface';

async function bootstrap() {
  Logger.debug('Creating nest app');
  const factoryOptions: NestApplicationOptions = {
    cors: true,
  };
  if (process.env.SIMPLE_CONSOLE_LOGGER) {
    factoryOptions.logger = console;
  }
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    factoryOptions,
  );
  const port = process.env.PORT || 3000;
  Logger.log(`App will run on: http://localhost:${port}`);
  await app.listen(port);
}
bootstrap();
