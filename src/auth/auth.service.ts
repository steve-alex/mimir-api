import { Injectable } from '@nestjs/common';
import { AccountService } from '../models/accounts/account.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountService: AccountService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const payload = { email };
    // TODO - actually log the user in (LOL)
    const accessToken = this.jwtService.sign(payload, {
      privateKey: process.env.JWT_SIGNING_SECRET,
      expiresIn: '7 days',
    });
    return { accessToken };
  }
}
