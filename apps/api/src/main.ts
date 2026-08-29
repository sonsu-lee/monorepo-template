import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';

const DEFAULT_HOST = '0.0.0.0',
  DEFAULT_PORT = 3001,
  bootstrap = async (): Promise<void> => {
    const app = await NestFactory.create(AppModule);

    await app.listen(process.env.PORT ?? DEFAULT_PORT, process.env.HOST ?? DEFAULT_HOST);
  };

await bootstrap();
