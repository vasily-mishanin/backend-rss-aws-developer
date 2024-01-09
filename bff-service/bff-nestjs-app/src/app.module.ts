import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NinjasModule } from './ninjas/ninjas.module';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { ResourceNotFoundExceptionFilter } from './resource-not-found.filter';
import { APP_FILTER } from '@nestjs/core';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [ConfigModule.forRoot(), NinjasModule, ProductsModule, CartModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: ResourceNotFoundExceptionFilter,
    },
  ],
})
export class AppModule {}
