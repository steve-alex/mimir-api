import { Injectable } from '@nestjs/common';
import { CreateUserDTO, UpdateUserDTO, UserDTO } from '../types/types';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUser(id: number): Promise<UserDTO> {
    return this.userRepository.findOneBy({ id });
  }

  async createUser(userDetails: CreateUserDTO): Promise<UserDTO> {
    const createResult = await this.userRepository.insert({
      name: userDetails.name,
    });
    return { ...userDetails, id: createResult.raw[0].id };
  }

  async updateUser(update: UpdateUserDTO): Promise<UserDTO> {
    const user = await this.userRepository.findOneBy({ id: update.id });

    if (!user) {
      throw new Error(`Unable to find user | ${update}`); // TODO - format this information nicely
    }

    await this.userRepository.update(update.id, {
      name: update.name,
    });

    return { ...user, ...update };
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new Error(`Unable to find user | id: ${id}`); // TODO - format this information nicely
    }

    await this.userRepository.delete({ id });
  }
}
