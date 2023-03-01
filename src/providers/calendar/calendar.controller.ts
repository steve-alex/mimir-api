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
import { AccountService } from '../../models/accounts/account.service';

@Controller('calendar')
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly accountService: AccountService,
  ) {}

  @Get('oauth')
  async redirect(@Req() req: any) {
    const code = req.query.code;
    await this.accountService.storeOAuthCode(code, 1); // TODO - get accountId from request eventually
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
