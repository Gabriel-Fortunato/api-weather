import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true, // <-- Ativa a conversão automática de tipos (string -> number)
      transformOptions: {
        enableImplicitConversion: true, // <-- Força a conversão implícita com base nas anotações
      },
    }),
  );

  await app.listen(3000);
}
bootstrap();