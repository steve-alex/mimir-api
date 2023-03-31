import { Injectable } from '@nestjs/common';
import { AccountService } from '../models/accounts/account.service';
import { JwtService } from '@nestjs/jwt';
import { AccountLoginDTO } from './auth.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountService: AccountService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(email: string, password: string): Promise<AccountLoginDTO> {
    const response = await this.accountService.createAccount({
      email,
      password,
    });
    console.log(
      '🚀 ~ file: auth.service.ts:18 ~ AuthService ~ signup ~ response:',
      response,
    );
    const payload = { email };
    const accessToken = this.jwtService.sign(payload, {
      privateKey: process.env.JWT_SIGNING_SECRET,
      expiresIn: '7 days',
    });
    return { accessToken, accountId: response.id };
  }

  async login(email: string, password: string): Promise<AccountLoginDTO> {
    const payload = { email };
    const account = await this.accountService.getAccount({ email });

    console.log(
      '🚀 ~ file: auth.service.ts:34 ~ AuthService ~ login ~ account:',
      account,
    );

    if (!account) throw new Error('Unable to login');

    const isPasswordMatch = await bcrypt.compare(password, account.password);
    console.log(
      '🚀 ~ file: auth.service.ts:43 ~ AuthService ~ login ~ isPasswordMatch:',
      isPasswordMatch,
    );

    if (!isPasswordMatch) throw new Error('Unable to login');

    const accessToken = this.jwtService.sign(payload, {
      privateKey: process.env.JWT_SIGNING_SECRET,
      expiresIn: '7 days',
    });
    const accountId = 1;
    return { accessToken, accountId };
  }
}
