import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from './products/products.module';
import { databaseConfig } from './config/database.config';
import { DatabaseService } from './config/database.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ProductsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConfig,
      inject: [ConfigService]
    }),
    ClientsModule.register([
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.GRPC,
        options: {
          url: 'localhost:50051',
          package: 'product',
          protoPath: './dist/proto/product.proto',
        }
      }
    ]),
    
  ],
  exports: [MongooseModule],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
