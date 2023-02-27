import { Module } from '@nestjs/common';
import { NotionService } from '../services/notion.service';
import { NotionController } from '../controllers/notion.controller';
import { ContentService } from '../services/content.service';

@Module({
  imports: [],
  controllers: [NotionController],
  providers: [NotionService, ContentService],
})
export class NotionModule {}
