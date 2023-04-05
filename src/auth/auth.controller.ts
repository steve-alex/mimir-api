import { Controller, Post, Body, UseFilters, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountLoginDTO, authDTO } from './auth.entity';
import { Response } from '../types/types';
import { AllExceptionsFilter } from '../shared/exceptions';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseFilters(AllExceptionsFilter)
  @Post('signup')
  async signup(@Body() body: authDTO): Promise<Response<AccountLoginDTO>> {
    const { email, password } = body;
    const data = await this.authService.signup(email, password);
    return {
      data,
      message: 'Signed up successfully',
      statusCode: HttpStatus.CREATED,
    };
  }

  @UseFilters(AllExceptionsFilter)
  @Post('login')
  async login(@Body() body: authDTO): Promise<Response<AccountLoginDTO>> {
    const { email, password } = body;
    const data = await this.authService.login(email, password);
    return {
      data,
      message: 'Logged in successfully',
      statusCode: HttpStatus.OK,
    };
  }
}
