export interface JwtPayload {
  email: string;
  accountId: number;
}

export interface AccountLoginDTO {
  accessToken: string;
  accountId: number;
}

export interface authDTO {
  email: string;
  password: string;
}
