import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Observable } from 'rxjs';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  private readonly productService: ProductsService;

  constructor(productService: ProductsService) {
    this.productService = productService; //@Injectable
  }

  // GET /products
  @Get()
  getProducts() {
    const recipientUrl = `${process.env.product}/products`;
    console.log({ recipientUrl });
    return this.productService.getProducts(recipientUrl);
  }

  // GET /products/:id ---> {...}
  @Get(':id')
  getOneProduct(@Param('id') id: string) {
    const recipientUrl = `${process.env.product}/products`;
    try {
      const products = this.productService.getProduct(recipientUrl, id);
      return products;
    } catch (error) {
      return error;
    }
  }

  // POST /products/ ---> {...}
  @Post()
  createProduct(@Body() createProductDto: CreateProductDto) {
    const recipientUrl = `${process.env.product}/products`;
    try {
      const response = this.productService.createProduct(
        recipientUrl,
        createProductDto,
      );
      return response;
    } catch (error) {
      return error;
    }
  }
}
