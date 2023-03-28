import { Injectable } from '@nestjs/common';
import { AccountService } from '../models/accounts/account.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountService: AccountService,
    private readonly jwtService: JwtService,
  ) {}

  async validate(
    email: string,
    accountId: number,
  ): Promise<{ email: string } | null> {
    const account = await this.accountService.getAccount({
      email,
      id: accountId,
    });
    if (!account) return null;

    return { email: account.email };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const payload = { email, password };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
