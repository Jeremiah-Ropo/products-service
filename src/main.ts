import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: 'localhost:50051',
      package: 'product',
      protoPath: "./dist/proto/product.proto",
    }
    });
  await app.startAllMicroservices();
  await app.listen(3011);
  console.log('Running on port 3011')
  console.log('Microservice is listening...');
}
bootstrap();
