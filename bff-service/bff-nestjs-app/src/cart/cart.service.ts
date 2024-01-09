import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable, map } from 'rxjs';

@Injectable()
export class CartService {
  constructor(private readonly httpService: HttpService) {}

  getCart(serviceUrl: string): Observable<any[]> {
    const cart = this.httpService
      .get(serviceUrl)
      .pipe(map((response: AxiosResponse<any[]>) => response.data));
    console.log({ cart });
    return cart;
  }
}
