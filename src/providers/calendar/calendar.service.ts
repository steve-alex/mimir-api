import { Inject, Injectable } from '@nestjs/common';
import { getToken } from './google-api-auth';
import { AccountService } from '../../models/accounts/account.service';
import { response } from 'express';

@Injectable()
export class CalendarService {
  constructor(@Inject(AccountService) private accountService: AccountService) {}

  async getScheduledEvents(availabilities: any[]) {
    const accessToken = await this.accountService.getOAuthCode(1);
    const calendarId = await this.getCalendarId(accessToken);

    const responses = await Promise.all(
      availabilities.map(async (a) => {
        const headers = new Headers({
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        });

        const timeMin = new Date(a.start).toISOString();
        const timeMax = new Date(a.end).toISOString();
        const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${timeMin}&timeMax=${timeMax}`;

        try {
          const response = await fetch(url, {
            headers,
          });

          return response;
        } catch (err) {
          console.error(err);
        }

        return response;
      }),
    );

    const data = await Promise.all(
      responses.map(async (response) => {
        const data = await response.json();
        return data;
      }),
    );

    const parsedData = data
      .map((d) => {
        if (d.items.length) {
          return d.items;
        }

        return false;
      })
      .filter((d) => d)
      .flat()
      .map((d) => {
        return {
          start: d.start,
          end: d.end,
        };
      });

    return parsedData;
  }

  async createEvent(req: any) {
    const accessToken = await this.accountService.getOAuthCode(1);
    const calendarId = await this.getCalendarId(accessToken);
    const { title, start, end } = req;
    // set the event details
    const event = {
      summary: title,
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
    return '';
  }

  async getValidationUrl() {
    const url = await getToken();
    return url;
  }

  private async getCalendarId(accessToken: string): Promise<string> {
    const url = `https://www.googleapis.com/calendar/v3/users/me/calendarList`;
    const headers = new Headers({
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok)
      throw new Error(`Failed to fetch calendar list: ${response.statusText}`);

    const data = await response.json();
    const primaryCalendar = data.items.find((item) => item.primary).id;

    if (!primaryCalendar)
      throw new Error(`Failed to fetch calendar list: ${response.statusText}`);

    return primaryCalendar.id;
  }
}
