import {
  Controller,
  Request,
  Post,
  Get,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('auth/login')
  async login(@Body() body) {
    const { email, password } = body;
    return this.authService.login(email, password);
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
