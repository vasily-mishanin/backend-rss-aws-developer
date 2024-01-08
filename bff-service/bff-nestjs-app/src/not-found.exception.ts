import { HttpException, HttpStatus } from '@nestjs/common';

export class ResourceNotFoundException extends HttpException {
  constructor() {
    super('Cannot process request', HttpStatus.BAD_GATEWAY);
  }
}
