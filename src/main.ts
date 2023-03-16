import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import { AppModule } from './config/app/app.module';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const jsonLimit = '5mb'; // specifies the maximum size of JSON payloads
  app.use(json({ limit: jsonLimit }));
  const port = 3000;
  await app.listen(port);
}
bootstrap();
