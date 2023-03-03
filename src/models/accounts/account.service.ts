import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AccountDTO, CreatAccountDTO } from './account.type';
import { OAuth, OAuthProvider } from '../../providers/calendar/oauth.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(OAuth)
    private oAuthRepository: Repository<OAuth>,
  ) {}

  async getAccount(account: AccountDTO): Promise<AccountDTO> {
    const { id, name, email, password } = account;
    const searchParams: any = {};
    if (id) searchParams.id = id;
    if (name) searchParams.name = name;
    if (email) searchParams.email = email;
    if (password) searchParams.password = password;
    return this.accountRepository.findOneBy(searchParams);
  }

  async createAccount(userDetails: CreatAccountDTO): Promise<AccountDTO> {
    const { name, email, password } = userDetails;
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);

    const createResult = await this.accountRepository.insert({
      name,
      email,
      password: hashedPassword,
    });

    // TODO - According to REST what should I be passing here? Whatever it is, is it necessary?
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
    const record = await this.oAuthRepository.findOne({
      where: {
        account: {
          id: accountId,
        },
        valid: true,
      },
    });

    return record.access_token;
  }

  // async updateUser(update: UpdateUserDTO): Promise<UserDTO> {
  //   const user = await this.userRepository.findOneBy({ id: update.id });

  //   if (!user) {
  //     throw new Error(`Unable to find user | ${update}`); // TODO - format this information nicely
  //   }

  //   await this.userRepository.update(update.id, {
  //     name: update.name,
  //   });

  //   return { ...user, ...update };
  // }

  // async deleteUser(id: number): Promise<void> {
  //   const user = await this.userRepository.findOneBy({ id });

  //   if (!user) {
  //     throw new Error(`Unable to find user | id: ${id}`); // TODO - format this information nicely
  //   }

  //   await this.userRepository.delete({ id });
  // }
}
