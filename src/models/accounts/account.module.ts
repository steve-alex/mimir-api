import { Module } from '@nestjs/common';
import { AccountController } from './account.controler';
import { AccountService } from './account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './account.entity';
import { OAuth } from '../../entities/oauth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, OAuth])],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
