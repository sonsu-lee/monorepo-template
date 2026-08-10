import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

import { AppModule } from './app.module';

const DEFAULT_HOST = '0.0.0.0';
const DEFAULT_PORT = 3001;

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  await app.listen(process.env.PORT ?? DEFAULT_PORT, process.env.HOST ?? DEFAULT_HOST);
};

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
