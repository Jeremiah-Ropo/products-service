import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  NotFoundException,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { GrpcMethod } from '@nestjs/microservices';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const ownerExist = await this.productsService.findOne({
      name: createProductDto.name,
    });
    if (ownerExist) {
      throw new HttpException(
        'Product with this name already exist',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.productsService.create(createProductDto);
  }

  @GrpcMethod('ProductService', 'CreateProduct')
  async createProductGrpc(data: CreateProductDto) {
    const createdProduct = await this.productsService.create(data);
    return createdProduct;
  }

  @Get()
  async findAll(
    @Query('limit', ParseIntPipe) limit: number,
    @Query('page', ParseIntPipe) page: number,
    @Query('name') name?: string,
  ) {
    try {
      const query = {};
      if (name) query['name'] = name;
      limit = limit ?? 10;
      page = page ?? 1;
      return this.productsService.findAll(query, { page, limit });
    } catch (error) {
      throw new HttpException(error.message, error.statusCode);
    }
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @GrpcMethod('ProductService', 'FindProductById')
  async findProductByIdGrpc(data: { id: string }) {
    const product = await this.productsService.findOne(data.id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${data.id} not found`);
    }
    return product;
  }

  @Get()
  async findOne(@Query('field') field: string, @Query('value') value: string) {
    try {
      if (!field || !value) {
        throw new NotFoundException('Field or Value is missing');
      }

      const query = { [field]: value };
      const products = await this.productsService.findOne(query);
      if (!products) {
        throw new NotFoundException(
          `Product with ${field}: ${value} is not found`,
        );
      }
    } catch (error) {
      throw new HttpException(error.message, error.statusCode);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    try {
      const productId = await this.productsService.findById(id);
      if (productId) {
        throw new NotFoundException('Product is not found');
      }
      const updateProduct = await this.productsService.update(
        id,
        updateProductDto,
      );

      await this.amqpConnection.publish('productExchange', 'product.updated', {
        updateProduct, // send updated product data
      });
      return updateProduct;
    } catch (error) {
      throw new HttpException(error.message, error.statusCode);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return this.productsService.remove(id);
    } catch (error) {
      throw new HttpException(error.message, error.statusCode);
    }
  }
}
