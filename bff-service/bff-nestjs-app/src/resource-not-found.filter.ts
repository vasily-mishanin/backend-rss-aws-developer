import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ResourceNotFoundException } from './not-found.exception';
import { VALID_RESOURCES } from './constants';

@Catch(HttpException)
export class ResourceNotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const request = ctx.getRequest();

    console.log(
      'ResourceNotFoundExceptionFilter',
      status,
      exception.constructor,
      request.url,
    );

    if (VALID_RESOURCES.includes(request.url.split('/')[1])) {
      response.status(status).json({
        statusCode: status,
        message: exception.message || 'Internal server error',
      });
    } else {
      response.status(HttpStatus.BAD_GATEWAY).json({
        message: 'Cannot process request',
        statusCode: HttpStatus.BAD_GATEWAY,
      });
    }
  }
}
