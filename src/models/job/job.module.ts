import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './job.entity';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { ContentModule } from '../content/content.module';
import { AvailabilityModule } from '../availability/availability.module';
import { CalendarModule } from '../../providers/calendar/calendar.module';
import { NotionModule } from '../../providers/notion/notion.module';

@Module({
  imports: [
    ContentModule,
    AvailabilityModule,
    CalendarModule,
    NotionModule,
    TypeOrmModule.forFeature([Job]),
  ],
  controllers: [JobController],
  providers: [JobService],
})
export class JobModule {}
