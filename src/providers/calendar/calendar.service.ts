import { Inject, Injectable } from '@nestjs/common';
import { getToken } from './google-api-auth';
import { AccountService } from '../../models/accounts/account.service';

@Injectable()
export class CalendarService {
  constructor(@Inject(AccountService) private accountService: AccountService) {}

  async scheduleContent(timeSlots: any[], content: any) {
    return 'success';
  }

  async getCalendarEvents(start: string, end: string) {
    return [];
  }

  async getFreeTimeSlotsInAvailabilities(availabilities: any[]) {
    return [];
  }

  async createEvent(req: any) {
    const accessToken = await this.accountService.getOAuthCode(1);
    const calendarId = await this.getCalendarId(accessToken);
    const start = new Date('2023-03-02T09:00:00-08:00');
    const end = new Date('2023-03-02T10:00:00-08:00');
    // set the event details
    const event = {
      summary: 'Read stuff',
      start: {
        dateTime: start.toISOString(),
        timeZone: 'Europe/London',
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: 'Europe/London',
      },
    };
    const headers = new Headers({
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    });

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(event),
      },
    );
    console.log('response => ', response);
    // const token = await getToken();
    return '';
  }

  async getValidationUrl() {
    const url = await getToken();
    return url;
  }

  private async getCalendarId(accessToken: string): Promise<string> {
    try {
      const url = `https://www.googleapis.com/calendar/v3/users/me/calendarList`;
      const headers = new Headers({
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      });
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });
      const data = await response.json();
      const calendarId = data.items.find((item) => item.primary).id;
      return calendarId;
    } catch (err) {
      console.error(err);
    }
  }
}
