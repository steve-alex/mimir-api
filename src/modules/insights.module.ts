import { Module } from '@nestjs/common';
import { OpenAIService } from '../services/openai.service';
import { InsightService } from '../services/insight.service';

@Module({
  imports: [],
  controllers: [],
  providers: [OpenAIService, InsightService],
})
export class InisghtsModule {}
