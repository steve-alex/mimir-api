import { Module } from '@nestjs/common';
import { OpenAIService } from '../openai/openai.service';
import { InsightService } from './insight.service';

@Module({
  imports: [],
  controllers: [],
  providers: [OpenAIService, InsightService],
  exports: [InsightService, OpenAIService],
})
export class InsightsModule {}
