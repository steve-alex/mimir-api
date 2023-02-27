import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { NotionService } from '../../services/notion.service';
import { InsightService } from '../../services/insight.service';
import { InisghtsModule } from '../../modules/insights.module';
import { NotionModule } from '../../modules/notion.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from './content.entity';

@Module({
  imports: [NotionModule, InisghtsModule, TypeOrmModule.forFeature([Content])],
  controllers: [ContentController],
  providers: [ContentService, NotionService, InsightService],
})
export class ContentModule {}
