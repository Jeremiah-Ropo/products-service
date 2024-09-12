import { Controller, Get, Query, Post, Body,NotFoundException, HttpException, HttpStatus, ParseIntPipe, Patch, Param, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly amqpConnection: AmqpConnection,
  ) { }

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  async findAll(
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('name') name?: string,
  ) {
    try {
      const query = {};
      if (name) query['name'] = name;
      return this.productsService.findAll(query, {page, limit });
    } catch (error) {
      throw new HttpException(error.message, error.statusCode)
    }
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.productsService.findOne(+id);
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
        throw new NotFoundException(`Product with ${field}: ${value} is not found`);
      }
    } catch (error) {
      throw new HttpException(error.message, error.statusCode)
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    try {
      const productId = await this.productsService.findById(id);
      if (productId) {
        throw new NotFoundException("Product is not found")
      }
      const updateProduct = await this.productsService.update(id, updateProductDto);

      await this.amqpConnection.publish('productExchange', 'product.updated', {
        updateProduct // send updated product data
      });
      return updateProduct;
    } catch (error) {
      throw new HttpException(error.message, error.statusCode)
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return this.productsService.remove(id);
    } catch (error) {
      throw new HttpException(error.message, error.statusCode)
    }
  }
}
