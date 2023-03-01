import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AccountDTO, CreatAccountDTO } from './account.type';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
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
