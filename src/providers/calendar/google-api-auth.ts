/* eslint-disable @typescript-eslint/no-var-requires */
import { google } from 'googleapis';

function makeOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_REDIRECT_URL,
  );
}

export async function getToken() {
  const code = null;
  const refreshToken = null;

  const oauth2Client = makeOAuth2Client();
  console.log(
    '🚀 ~ file: google-api-auth.ts:17 ~ getToken ~ oauth2Client:',
    oauth2Client,
  );
  console.log(
    '🚀 ~ file: google-api-auth.ts:11 ~ makeOAuth2Client ~ process.env.GOOGLE_CALENDAR_CLIENT_ID:',
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
  );
  console.log(
    '🚀 ~ file: google-api-auth.ts:11 ~ makeOAuth2Client ~ process.env.GOOGLE_CALENDAR_CLIENT_SECRET:',
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
  );
  console.log(
    '🚀 ~ file: google-api-auth.ts:11 ~ makeOAuth2Client ~ process.env.GOOGLE_CALENDAR_REDIRECT_URL:',
    process.env.GOOGLE_CALENDAR_REDIRECT_URL,
  );

  console.log('GOOGLE_AUTH_URI =>', process.env.GOOGLE_AUTH_URI);

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
}
