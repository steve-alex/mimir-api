import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../models/accounts/account.entity';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Ola Mundo!';
  }
}
