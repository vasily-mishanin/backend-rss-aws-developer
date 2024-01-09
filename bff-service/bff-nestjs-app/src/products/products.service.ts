import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable, lastValueFrom, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly httpService: HttpService) {}

  async getProducts(serviceUrl: string) {
    const productsObservable = this.httpService
      .get(serviceUrl)
      .pipe(map((response: AxiosResponse<any[]>) => response.data));
    console.log({ productsObservable });
    try {
      const products = await lastValueFrom(productsObservable);
      console.log({ products });
      return products;
    } catch (error) {
      // Handle errors if necessary
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  getProduct(serviceUrl: string, productId: string): Observable<any[]> {
    const product = this.httpService.get(`${serviceUrl}/${productId}`).pipe(
      map((response: AxiosResponse<any[]>) => response.data),
      catchError((error) => {
        // Log or handle the error as needed
        console.log('getProduct -> ', error.response.data);
        // Forward the error to the controller
        if (error.response && error.response.status === 404) {
          throw new NotFoundException(error.response.data.message);
        }
        return throwError(() => error);
      }),
    );
    console.log({ product });
    return product;
  }

  createProduct(
    serviceUrl: string,
    createProductDto: CreateProductDto,
  ): Observable<any[]> {
    const result = this.httpService.post(serviceUrl, createProductDto).pipe(
      map((response: AxiosResponse<any[]>) => response.data),
      catchError((error) => {
        console.log('createProduct -> ', error.response.data);
        // Forward the error to the controller
        if (error.response && error.response.status === 404) {
          throw new NotFoundException(error.response.data.message);
        }
        return throwError(() => error);
      }),
    );

    return result;
  }
}
