import { Injectable } from '@nestjs/common';
import { AccountService } from '../models/accounts/account.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthResult } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountService: AccountService,
    private readonly jwtService: JwtService,
  ) {}

  async validateAccount(
    email: string,
    password: string,
  ): Promise<{ email: string } | null> {
    const account = await this.accountService.getAccount({ email });
    if (!account) return null;

    const passwordValid = await bcrypt.compare(password, account.password);
    if (!passwordValid) return null;

    return { email: account.email };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const payload = { email, password };
    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }
}
