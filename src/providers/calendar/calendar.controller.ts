import {
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Request,
} from '@nestjs/common';
import { Response } from '../../types/types';
import { CalendarService } from './calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('oauth')
  async redirect(@Req() req: any) {
    const code = req.query.code;
    console.log('code =>', code);
    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
    };
  }

  @Get()
  async getEvents(@Req() req: Request): Promise<Response<any>> {
    const events = await this.calendarService.getEvents(req);
    return {
      statusCode: HttpStatus.OK,
      message: 'Retrieved calanedar events',
      data: events,
    };
  }
}
