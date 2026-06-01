export interface AuthTokens {
  access: string;
  refresh: string;
}

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export function setTokens(tokens: AuthTokens): void {
  accessToken = tokens.access;
  refreshToken = tokens.refresh;
}

export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
}
