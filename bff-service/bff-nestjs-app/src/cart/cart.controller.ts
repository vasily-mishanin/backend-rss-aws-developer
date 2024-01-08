import { Controller, Get } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  private readonly cartService: CartService;

  constructor(cartService: CartService) {
    this.cartService = cartService; //@Injectable
  }

  // GET /products
  @Get()
  getCart() {
    const recipientUrl = `${process.env.cart}/cart`;
    console.log({ recipientUrl });
    return this.cartService.getCart(recipientUrl);
  }
}
