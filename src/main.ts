import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
const cookieSession = require('cookie-session');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    cookieSession({
      keys: ['asdfdfd'],
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ensures that additional fields are ignored, only specified fields will be considered
    }),
  );
  await app.listen(3000);
}
bootstrap();
