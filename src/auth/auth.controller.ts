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
    console.log('signup!');
    const { email, password } = body;
    console.log(
      '🚀 ~ file: auth.controller.ts:21 ~ AuthController ~ signup ~ password:',
      password,
    );
    console.log(
      '🚀 ~ file: auth.controller.ts:21 ~ AuthController ~ signup ~ email:',
      email,
    );
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
    console.log("🚀 ~ file: auth.controller.ts:44 ~ AuthController ~ login ~ password:", password)
    console.log("🚀 ~ file: auth.controller.ts:44 ~ AuthController ~ login ~ email:", email)
    const data = await this.authService.login(email, password);
    return {
      data,
      message: 'Logged in successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Get('auth/test')
  async test(@Request() req) {
    try {
      return 'It works';
    } catch (err) {
      console.log('err =>', err);
    }
  }
}
