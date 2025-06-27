import { NestFactory } from '@nestjs/core';
import { AnswerModule } from './answer.module';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AnswerModule);
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      port: 8888,
    },
  });
  // await app.startAllMicroservices();
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(process.env.port ?? 3003);
}
bootstrap();
