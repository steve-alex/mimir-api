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

// TODO - strongly type this
export async function swapAuthorizationCodeForTokens(
  code: string,
): Promise<any> {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID; // replace with your Google API Console project's client ID
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET; // replace with your Google API Console project's client secret
  const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URL; // replace with your registered redirect URI

  const url = 'https://oauth2.googleapis.com/token'; // Google OAuth2 token endpoint

  // create a POST request to the Google OAuth2 token endpoint
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `client_id=${clientId}&client_secret=${clientSecret}&code=${code}&redirect_uri=${redirectUri}&grant_type=authorization_code`,
  };

  // send the POST request using the Fetch API
  const response = await fetch(url, options);
  const data = await response.json();
  console.log('🚀 ~ file: google-api-auth.ts:65 ~ data:', data);

  const accessToken = data?.access_token;
  const refreshToken = data?.refresh_token;

  return Object.assign(
    accessToken && { accessToken },
    refreshToken && { refreshToken },
  );
}
