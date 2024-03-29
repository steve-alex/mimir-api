import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AccountDTO, OAuthTokenDetails } from './account.type';
import { OAuth, OAuthProvider } from '../../providers/calendar/oauth.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(OAuth)
    private oAuthRepository: Repository<OAuth>,
  ) {}

  async createAccount(details: AccountDTO): Promise<AccountDTO> {
    console.log(
      '🚀 ~ file: account.service.ts:19 ~ AccountService ~ createAccount ~ details:',
      details,
    );
    const { email, password } = details;
    const salt = 10;

    const hashedPassword = await bcrypt.hash(password, salt);
    const createResult = await this.accountRepository.insert({
      email,
      password: hashedPassword,
    });

    return { id: createResult.raw[0].id };
  }

  async getAccount(details: AccountDTO): Promise<AccountDTO> {
    const { id, name, email } = details;
    const searchParams: AccountDTO = {};

    if (id) searchParams.id = id;
    if (name) searchParams.name = name;
    if (email) searchParams.email = email;

    return this.accountRepository.findOneBy(searchParams);

    // TODO - enable sensitive param flag that deletes password
  }

  async updateAccount(details: AccountDTO): Promise<AccountDTO> {
    const updatedAccount = new Account();
    updatedAccount.id = details.id;
    if (details?.email) updatedAccount.email = details.email;
    if (details?.password) {
      const salt = 10;
      const hashedPassword = await bcrypt.hash(details?.password, salt);
      updatedAccount.password = hashedPassword;
    }

    const queryResult = await this.accountRepository
      .createQueryBuilder()
      .update(Account)
      .set(updatedAccount)
      .where('id = :id', { id: details.id })
      .returning('*')
      .execute();

    return this.encodeAccont(queryResult.raw[0]);
  }

  async deleteAccount(accountId: number): Promise<void> {
    await this.accountRepository
      .createQueryBuilder()
      .delete()
      .where('account = :accountId', { accountId })
      .execute();
  }

  private encodeAccont(accountDetails: Account): AccountDTO {
    const encodedAccount = Object.assign({}, accountDetails);
    return encodedAccount;
  }

  async storeAuthTokens(
    details: OAuthTokenDetails,
    accountId: number,
  ): Promise<void> {
    const insert = {
      refresh_token: details.refreshToken,
      access_token: details.accessToken,
      expiry_date: details.expiryDate,
      provider: OAuthProvider.GoogleCalendar,
      account: { id: accountId },
      valid: true,
    };

    await this.oAuthRepository
      .createQueryBuilder()
      .insert()
      .into(OAuth)
      .values(insert)
      .execute();
  }

  async getOauthTokens(accountId: number): Promise<OAuthTokenDetails> {
    const record = await this.oAuthRepository
      .createQueryBuilder('oauth')
      .leftJoin('oauth.account', 'account')
      .where('account.id = :accountId', { accountId })
      .andWhere('oauth.valid = :valid', { valid: true })
      .getOne();

    return {
      accessToken: record?.access_token,
      refreshToken: record?.refresh_token,
    };
  }
}
