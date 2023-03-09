import { Inject, Injectable } from '@nestjs/common';
import { getToken } from './google-api-auth';
import { AccountService } from '../../models/accounts/account.service';
import { CreateEventDetails } from './calendar.entity';
import { TimeSlot } from '../../types/types';

@Injectable()
export class CalendarService {
  constructor(@Inject(AccountService) private accountService: AccountService) {}

  async getScheduledEventTimeSlots(
    availabilities: TimeSlot[],
  ): Promise<TimeSlot[]> {
    const accessToken = await this.accountService.getOAuthCode(1);
    const calendarId = await this.getCalendarId(accessToken);

    const responses = await Promise.all(
      availabilities.map(async (a) => {
        const headers = new Headers({
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        });

        const timeMin = new Date(a.start).toISOString();
        const timeMax = new Date(a.end).toISOString();
        const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${timeMin}&timeMax=${timeMax}`;

        const response = await fetch(url, {
          headers,
        });

        if (response.ok) return response.json();
        else {
          console.error(
            `Unable to find events for calendar ${calendarId} between ${timeMin} and ${timeMax}`,
          );
          return null;
        }
      }),
    );

    const data = await Promise.all(responses);

    const parsedData = data
      .filter((r) => r !== null)
      .flatMap((d) => {
        if (d?.items.length) return d.items;
        else return false;
      })
      .filter((d) => d)
      .map((d) => {
        return {
          start: d.start.dateTime,
          end: d.end.dateTime,
        };
      });

    return removeDuplicatesByKey(parsedData, 'htmlLink');

    function removeDuplicatesByKey(array, key) {
      return array.filter((item, index) => {
        const firstIndex = array.findIndex(
          (element) => element[key] === item[key],
        );
        return index === firstIndex;
      });
    }
  }

  async createEvent(details: CreateEventDetails): Promise<void> {
    const { title, start, end } = details;
    const accessToken = await this.accountService.getOAuthCode(1);
    const calendarId = await this.getCalendarId(accessToken);
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

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(
        `Unable to create event with details - ${details} | Error Message: ${errorResponse.error.message}`,
      );
    }
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
    const primaryCalendar = data.items.find((item) => item.primary);

    if (!primaryCalendar)
      throw new Error(`Failed to fetch calendar list: ${response.statusText}`);

    return primaryCalendar.id;
  }
}
