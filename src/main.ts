import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
 app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, 
  });

  app.useGlobalPipes(
  new ValidationPipe({
    transform: true, // Converts string to number automatically
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
);
  await app.listen(3000);
}
bootstrap();
