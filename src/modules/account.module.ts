import { Module } from '@nestjs/common';
import { AccountController } from '../controllers/account.controler';
import { AccountService } from '../services/account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../entities/account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account])],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [TypeOrmModule],
})
export class AccountModule {}
