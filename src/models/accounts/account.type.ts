export interface AccountDTO {
  id?: number;
  name?: string;
  email?: string;
  password?: string;
}

export interface CreatAccountDTO {
  name: string;
  email?: string;
  password?: string;
}

export interface UpdateAccountDTO {
  name: string;
  email?: string;
}

export interface OAuthTokenDetails {
  accessToken?: string;
  refreshToken?: string;
}
