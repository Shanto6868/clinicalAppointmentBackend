import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
 app.enableCors({
    origin: '*', // Allow all origins, you can restrict this to specific domains
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // if you need cookies/auth headers
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
