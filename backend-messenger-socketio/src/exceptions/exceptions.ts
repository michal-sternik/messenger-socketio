import { HttpException, HttpStatus } from '@nestjs/common';

export class PasswordNotMatchException extends HttpException {
  constructor() {
    super('Confirm password is not equal to password', HttpStatus.BAD_REQUEST);
  }
}
