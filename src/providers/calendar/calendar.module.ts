import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';

@Module({
  imports: [],
  controllers: [],
  providers: [CalendarService],
  exports: [],
})
export class CalendarModule {}
