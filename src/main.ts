import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { json } from 'express';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: '.env' });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(json({ limit: '5mb' }));
  // app.use(urlencoded({ extended: true, limit: '100mb' }));
  await app.listen(3000);
}
bootstrap();
