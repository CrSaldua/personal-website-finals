import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS so your frontend origin can talk to this API
  app.enableCors({
    origin: [
      'https://personal-website-finals-tp54.vercel.app',
      'https://personal-website-finals-ten-dusky.vercel.app',
      'http://localhost:5173'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`Witcher backend running on port ${port}`, 'Bootstrap');
}

bootstrap();