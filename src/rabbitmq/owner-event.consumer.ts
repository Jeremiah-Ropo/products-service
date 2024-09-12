import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OwnerEventConsumer {
  constructor(private readonly productsService: ProductsService) {}

  // This decorator makes the method listen to RabbitMQ messages from the specific routing key
  @RabbitSubscribe({
    exchange: 'ownerExchange',
    routingKey: 'owner.updated', // Routing key for the event
    queue: 'owner-updates-queue', // Queue name for owner updates
  })

  public async handleOwnerUpdateEvent(message: { ownerId: string; name: string; email: string }) {
    const { ownerId, name, email } = message;

    console.log(`Owner updated: ${ownerId}, Name: ${name}, Email: ${email}`);

    // Business logic to update the products based on the ownerId
    await this.productsService.updateProductsByOwner(ownerId, { name, email });
  }
}
