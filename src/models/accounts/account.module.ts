import { Module } from '@nestjs/common';
import { AccountController } from './account.controler';
import { AccountService } from './account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account])],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [TypeOrmModule],
})
export class AccountModule {}
