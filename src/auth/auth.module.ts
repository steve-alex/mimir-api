import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccountService } from '../models/accounts/account.service';
import { JwtModule } from '@nestjs/jwt';
import { Account } from '../models/accounts/account.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.auth';
import { JwtStrategy } from './jwt.auth';
import { AccountModule } from '../models/accounts/account.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    AccountModule,
    PassportModule,
    JwtModule.register({
      secret: 'SECRET_KEY', //TODO This should really be in your .env file
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AccountService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
