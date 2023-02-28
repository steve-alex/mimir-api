import { Injectable } from '@nestjs/common';
import { getToken } from './google-api-auth';

@Injectable()
export class CalendarService {
  async getEvents(req: any) {
    const token = await getToken();
    console.log(
      '🚀 ~ file: calendar.service.ts:8 ~ CalendarService ~ getEvents ~ token:',
      token,
    );
    return token;
  }
}
