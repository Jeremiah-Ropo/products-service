import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schema/product.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>
  ){}
  async create(createProductDto: CreateProductDto) {
    const product = await this.productModel.create(createProductDto);
    return product;
  }

  async findAll(query: any, {limit, page}) {
    const products = await this.productModel
      .find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .exec();
    return products;
  }

  async findById(id: string) {
    const product = await this.productModel.findById(id);
    return product;;
  }

  async findOne(query: any) {
    const product = await this.productModel.findOne(query);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate({ _id: id }, updateProductDto, { new: true })
      .exec();
    return updatedProduct;
  }

  async remove(id: string) {
    const deleteProduct = await this.productModel.findByIdAndDelete(id)
    return deleteProduct;
  }
  async updateProductsByOwner(ownerId, { name, email }) {
    const updatedOnwerDetailsProduct = await this.productModel
      .findOneAndUpdate({ ownerId }, {ownerName: name, ownerEmail: email}, { new: true })
      .exec();
    return updatedOnwerDetailsProduct;
  }
}
