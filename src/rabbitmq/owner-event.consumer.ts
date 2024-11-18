import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { RabbitSubscribe, AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OwnerEventConsumer {
  constructor(
    private readonly productsService: ProductsService,
    private readonly amqpConnection: AmqpConnection,
  ) { }

  // This decorator makes the method listen to RabbitMQ messages from the specific routing key
  @RabbitSubscribe({
    exchange: 'ownerExchange',
    routingKey: 'owner.updated', // Routing key for the event
    queue: 'owner-updates-queue', // Queue name for owner updates
  })
  public async handleOwnerUpdateEvent(message) {
    try {

      const { id, name, email } = message;
      console.log(`Owner updated: ${id}, Name: ${name}, Email: ${email}`);

      // Business logic to update the products based on the ownerId
      await this.productsService.updateProductsByOwner(id, { name, email });
    } catch (error) {
      console.error('Error handling owner update event:', error);
      throw new HttpException(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

}
