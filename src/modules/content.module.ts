import { Module } from '@nestjs/common';
import { ContentService } from '../services/content.service';
import { ContentController } from '../controllers/content.controller';
import { NotionService } from '../services/notion.service';
import { InsightService } from '../services/insight.service';
import { OpenAIService } from '../services/openai.service';

@Module({
  imports: [],
  controllers: [ContentController],
  providers: [ContentService, NotionService, InsightService, OpenAIService],
})
export class ContentModule {}
