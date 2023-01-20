import { Module } from '@nestjs/common';
import { ContentService } from '../services/content.service';
import { ContentController } from '../controllers/content.controller';
import { NotionService } from '../services/notion.service';

@Module({
  imports: [],
  controllers: [ContentController],
  providers: [ContentService, NotionService],
})
export class ContentModule {}
