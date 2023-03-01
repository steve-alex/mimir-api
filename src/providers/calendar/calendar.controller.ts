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
import { swapAuthorizationCodeForTokens } from './google-api-auth';

@Controller('calendar')
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly accountService: AccountService,
  ) {}

  @Get('oauth')
  async redirect(@Req() req: any) {
    const code = req.query.code;
    const tokens = await swapAuthorizationCodeForTokens(code);
    await this.accountService.storeAuthTokens(tokens, 1);
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

  @Get('login')
  async login(@Req() req: Request): Promise<Response<any>> {
    const url = await this.calendarService.getValidationUrl();
    return {
      statusCode: HttpStatus.OK,
      message: 'Retrieved calanedar events',
      data: url,
    };
  }
}
