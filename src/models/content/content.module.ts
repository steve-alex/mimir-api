import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { NotionService } from '../../providers/notion/notion.service';
import { InsightService } from '../../providers/insights/insight.service';
import { InisghtsModule } from '../../providers/insights/insights.module';
import { NotionModule } from '../../providers/notion/notion.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from './content.entity';

@Module({
  imports: [NotionModule, InisghtsModule, TypeOrmModule.forFeature([Content])],
  controllers: [ContentController],
  providers: [ContentService, NotionService, InsightService],
})
export class ContentModule {}
