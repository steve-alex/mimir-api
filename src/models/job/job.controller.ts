import { Controller, HttpStatus, Post, Req } from '@nestjs/common';
import { JobService } from './job.service';
import { Response } from '../../types/types';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  async job(@Req() req: Request): Promise<Response<any>> {
    const content = await this.jobService.scheduleContent(1);
    return {
      statusCode: HttpStatus.OK,
      message: 'Page successfully created',
      data: content,
    };
  }
}
