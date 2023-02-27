import { Module } from '@nestjs/common';
import { ContentService } from '../services/content.service';
import { ContentController } from '../controllers/content.controller';
import { NotionService } from '../services/notion.service';
import { InsightService } from '../services/insight.service';
import { InisghtsModule } from './insights.module';
import { NotionModule } from './notion.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from '../entities/content.entity';

@Module({
  imports: [NotionModule, InisghtsModule, TypeOrmModule.forFeature([Content])],
  controllers: [ContentController],
  providers: [ContentService, NotionService, InsightService],
})
export class ContentModule {}
