import {
  Controller,
  Request,
  Post,
  Get,
  Body,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountLoginDTO } from './auth.entity';
import { Response } from '../types/types';
import { AllExceptionsFilter } from '../shared/exceptions';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseFilters(AllExceptionsFilter)
  @Post('auth/signup')
  async signup(@Body() body): Promise<Response<AccountLoginDTO>> {
    const { email, password } = body;
    const data = await this.authService.signup(email, password);
    return {
      data,
      message: 'Signed up successfully',
      statusCode: HttpStatus.CREATED,
    };
  }

  @UseFilters(AllExceptionsFilter)
  @Post('auth/login')
  async login(@Body() body): Promise<Response<AccountLoginDTO>> {
    const { email, password } = body;
    const data = await this.authService.login(email, password);
    return {
      data,
      message: 'Logged in successfully',
      statusCode: HttpStatus.OK,
    };
  }
}
