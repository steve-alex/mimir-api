import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { InsightsModule } from '../../providers/insights/insights.module';
import { NotionModule } from '../../providers/notion/notion.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from './content.entity';
import { AvailabilityModule } from '../availability/availability.module';
import { CalendarModule } from '../../providers/calendar/calendar.module';

@Module({
  imports: [
    NotionModule,
    InsightsModule,
    AvailabilityModule,
    CalendarModule,
    TypeOrmModule.forFeature([Content]),
  ],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
