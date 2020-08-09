import { NestFactory } from '@nestjs/core';
import { NextModule } from '@nestpress/next';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(compression());

  SwaggerModule.setup(
    'swagger', app, SwaggerModule.createDocument(
      app, new DocumentBuilder()
        .setTitle('KhazixMains Tracker')
        .addBearerAuth()
        .build()
    ),
  );

  await app.get(NextModule).prepare({
    dev: process.env.NODE_ENV !== 'production',
    dir: process.cwd(),
  });

  app.listen(3000, () => {
    console.log('> Ready on port 3000');
  });
}
bootstrap();
