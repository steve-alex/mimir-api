import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { AccountModule } from '../../models/accounts/account.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OAuth } from './oauth.entity';

@Module({
  imports: [AccountModule, TypeOrmModule.forFeature([OAuth])],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}
