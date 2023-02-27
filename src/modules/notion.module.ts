import { Module } from '@nestjs/common';
import { NotionService } from '../services/notion.service';
import { NotionController } from '../controllers/notion.controller';

@Module({
  imports: [],
  controllers: [NotionController],
  providers: [NotionService],
  exports: [NotionService],
})
export class NotionModule {}
