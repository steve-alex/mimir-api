import { Controller, HttpStatus, Post, Req, UseFilters } from '@nestjs/common';
import { JobService } from './job.service';
import { Response } from '../../types/types';
import { AllExceptionsFilter } from '../../shared/exceptions';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @UseFilters(AllExceptionsFilter)
  @Post('schedule-content')
  async scheduleContent(@Req() req: Request): Promise<Response<any>> {
    // const accountId = req.body.accountId;
    const content = await this.jobService.scheduleContent(1);
    return {
      statusCode: HttpStatus.OK,
      message: 'Scheduled content in inbox',
      data: content,
    };
  }
}
