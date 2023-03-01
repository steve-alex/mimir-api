import { Inject, Injectable } from '@nestjs/common';
import { getToken } from './google-api-auth';
import { AccountService } from '../../models/accounts/account.service';
import * as axios from 'axios';

@Injectable()
export class CalendarService {
  constructor(@Inject(AccountService) private accountService: AccountService) {}
  async getEvents(req: any) {
    const accessToken = await this.accountService.getOAuthCode(1);
    const calendarId = await this.getCalendarId(accessToken);
    // const token = await getToken();
    return '';
  }

  async getValidationUrl() {
    const url = await getToken();
    return url;
  }

  private async getCalendarId(accessToken: string): Promise<string> {
    const response1 = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${accessToken}`,
      {
        method: 'POST',
      },
    );

    const data1 = await response1.json();

    if (data1.ok) {
      // The token is valid, do something with the token information
      console.log(data1);
    } else {
      // The token is invalid or there was an error with the request
      console.error(data1);
      console.error(`Error validating token: ${data1}`);
    }

    // const url = `https://www.googleapis.com/calendar/v3/users/me/calendarList`;
    // const headers = new Headers({
    //   Authorization: `Bearer ${accessToken}`,
    //   Accept: 'application/json',
    // });
    // const response = await fetch(url, {
    //   method: 'GET',
    //   headers: headers,
    // });
    // const calendarId = await response.json();
    // console.log(
    //   '🚀 ~ file: calendar.service.ts:43 ~ CalendarService ~ getCalendarId ~ calendarId:',
    //   calendarId.error,
    // );
    return '';
  }
}
