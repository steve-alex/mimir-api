export interface AccountDTO {
  id?: number;
  name?: string;
  email?: string;
  password?: string;
}

export interface OAuthTokenDetails {
  accessToken?: string;
  refreshToken?: string;
}
