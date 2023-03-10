import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AccountDTO, UpdateAccountDTO } from './account.type';
import { OAuth, OAuthProvider } from '../../providers/calendar/oauth.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(OAuth)
    private oAuthRepository: Repository<OAuth>,
  ) {}

  async getAccount(details: AccountDTO): Promise<AccountDTO> {
    const { id, name, email } = details;
    const searchParams: any = {};

    if (id) searchParams.id = id;
    if (name) searchParams.name = name;
    if (email) searchParams.email = email;

    const account = await this.accountRepository.findOneBy(searchParams);

    return this.encodeAccont(account);
  }

  async createAccount(details: AccountDTO): Promise<AccountDTO> {
    const { name, email, password } = details;
    const salt = 10;

    const hashedPassword = await bcrypt.hash(password, salt);
    const createResult = await this.accountRepository.insert({
      name,
      email,
      password: hashedPassword,
    });

    return { name, id: createResult.raw[0].id };
  }

  async storeAuthTokens(tokens: any, accountId: number): Promise<void> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    const oAuth = new OAuth();
    oAuth.refresh_token = tokens.refreshToken;
    oAuth.access_token = tokens.accessToken;
    oAuth.provider = OAuthProvider.GoogleCalendar;
    oAuth.account = account;
    oAuth.valid = true;

    await this.oAuthRepository.save(oAuth);
  }

  async getOAuthCode(accountId: number): Promise<string> {
    const record = await this.oAuthRepository
      .createQueryBuilder('oauth')
      .leftJoin('oauth.account', 'account')
      .where('account.id = :accountId', { accountId })
      .andWhere('oauth.valid = :valid', { valid: true })
      .getOne();

    return record.access_token;
  }

  async updateAccount(details: AccountDTO): Promise<AccountDTO> {
    const updatedAccount = new Account();
    updatedAccount.id = details.id;
    if (details?.name) updatedAccount.name = details.name;
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

  private encodeAccont(accountDetails: Account): AccountDTO {
    const encodedAccount = Object.assign({}, accountDetails);
    delete encodedAccount.password;
    return encodedAccount;
  }

  async deleteAccount(userDetails: AccountDTO): Promise<void> {
    // TODO - implement this function
    return;
  }
}
