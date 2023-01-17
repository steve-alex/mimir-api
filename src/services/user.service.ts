import { Injectable } from '@nestjs/common';
import { CreateUserDTO, UpdateUserDTO } from '../types/types';

@Injectable()
export class UserService {
  getUser(userID: number): string {
    console.log('userID =>', userID);
    return 'Ola Mundo!';
  }

  createUser(user: CreateUserDTO): string {
    console.log('userID =>', user);
    return 'Ola Mundo!';
  }

  updateUser(user: UpdateUserDTO): string {
    console.log('userID =>', user);
    return 'Ola Mundo!';
  }

  deleteUser(userID: number): string {
    console.log('userID =>', userID);
    return 'Ola Mundo!';
  }
}
