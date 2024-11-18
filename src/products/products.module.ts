import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schema/product.schema';
import { OwnerEventConsumer } from '../rabbitmq/owner-event.consumer';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'ownerExchange', // Name of the exchange
          type: 'topic', // Exchange type (direct, topic, etc.)
        },
      ],
      uri: 'amqp://localhost:5672', // RabbitMQ server URI
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, OwnerEventConsumer],
  exports: [ProductsService],
})
export class ProductsModule {}
