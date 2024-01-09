import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Observable, lastValueFrom } from 'rxjs';
import { CreateProductDto } from './dto/create-product.dto';
import ProductsCache from './products-cache';
const CASH_EXPIRE_TIME = 2 * 60000; // 2 minutes

@Controller('products')
export class ProductsController {
  private readonly productService: ProductsService;
  private readonly cache: ProductsCache;

  constructor(productService: ProductsService) {
    this.productService = productService; //@Injectable
    this.cache = new ProductsCache();
  }

  // GET /products
  @Get()
  async getProducts() {
    const recipientUrl = `${process.env.product}/products`;

    if (
      this.cache.cachedProducts.length &&
      Date.now() < this.cache.time + CASH_EXPIRE_TIME
    ) {
      console.log('GET CACHE: ', this.cache.cachedProducts);
      return this.cache.cachedProducts;
    }

    const products = await this.productService.getProducts(recipientUrl);
    this.cache.setProducts(products);
    return products;
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
