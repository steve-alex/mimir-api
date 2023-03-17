/* eslint-disable @typescript-eslint/no-var-requires */
import { google } from 'googleapis';
import { oAuthTokens } from './calendar.type';

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

export async function swapAuthorizationCodeForTokens(
  code: string,
): Promise<oAuthTokens> {
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
