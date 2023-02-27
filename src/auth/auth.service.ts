import { Injectable, NotAcceptableException } from '@nestjs/common';
import { AccountService } from '../models/accounts/account.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountService: AccountService,
    private jwtService: JwtService,
  ) {}
  async validateAccount(email: string, password: string): Promise<any> {
    const account = await this.accountService.getAccount({ email });
    if (!account) return null;
    const passwordValid = await bcrypt.compare(password, account.password);
    if (!account) {
      throw new NotAcceptableException('could not find the account');
    }
    if (account && passwordValid) {
      return account;
    }
    return null;
  }

  async login(email: string, password: string) {
    // TODO - What exactly should I be signing?
    const payload = { email, password };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}