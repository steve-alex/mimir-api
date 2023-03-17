import { Inject, Injectable } from '@nestjs/common';
import { AccountService } from '../../models/accounts/account.service';
import { CreateEventDetails } from './calendar.entity';
import { TimeSlot } from '../../types/types';
import { google } from 'googleapis';

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
    const code = null;
    const refreshToken = null;
    const oauth2Client = makeOAuth2Client();

    if (code) {
      return getRefreshToken(code);
    } else {
      return getAuthUrl();
    }

    async function getAuthUrl() {
      const url = oauth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',

        // scopes are documented here: https://developers.google.com/identity/protocols/oauth2/scopes#calendar
        scope: [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events',
        ],
      });

      return url;
    }

    async function getRefreshToken(code: string) {
      const token = await oauth2Client.getToken(code);
      return token;
    }

    function makeOAuth2Client() {
      return new google.auth.OAuth2(
        process.env.GOOGLE_CALENDAR_CLIENT_ID,
        process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
        process.env.GOOGLE_CALENDAR_REDIRECT_URL,
      );
    }
  }

  async swapAuthorizationCodeForTokens(code: string): Promise<oAuthTokens> {
    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URL;
    const oauthUrl = 'https://oauth2.googleapis.com/token';
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `client_id=${clientId}&client_secret=${clientSecret}&code=${code}&redirect_uri=${redirectUri}&grant_type=authorization_code`,
    };

    const response = await fetch(oauthUrl, options);
    const data = await response.json();

    const accessToken = data?.access_token;
    const refreshToken = data?.refresh_token;

    return Object.assign(
      accessToken && { accessToken },
      refreshToken && { refreshToken },
    );
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
