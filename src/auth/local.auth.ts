import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  // TODO - make sure that this is working properly
  async validate(
    username: string,
    password: string,
  ): Promise<{ email: string }> {
    const account = await this.authService.validateAccount(username, password);
    if (!account) {
      throw new UnauthorizedException();
    }
    return { email: account.email };
  }
}
