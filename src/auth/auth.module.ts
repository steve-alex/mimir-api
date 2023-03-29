import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Account } from '../models/accounts/account.entity';
import { OAuth } from '../providers/calendar/oauth.entity';
import { AccountService } from '../models/accounts/account.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccountModule } from '../models/accounts/account.module';
import { JwtMiddleware } from './jwt.auth';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, OAuth]),
    AccountModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SIGNING_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AccountService],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes('auth/test');
  }
}
