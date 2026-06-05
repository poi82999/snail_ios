import * as SecureStore from 'expo-secure-store';

export interface AuthTokens {
  access: string;
  refresh: string;
}

const ACCESS_TOKEN_KEY = 'snail.access';
const REFRESH_TOKEN_KEY = 'snail.refresh';

let accessToken: string | null = null;
let refreshToken: string | null = null;
let secureStoreWrite: Promise<void> = Promise.resolve();
let tokenMutationVersion = 0;

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

function enqueueSecureStoreWrite(write: () => Promise<void>): void {
  // SecureStore 쓰기는 비동기지만, set/clear 순서는 사용자의 마지막 액션과 맞아야 한다.
  secureStoreWrite = secureStoreWrite
    .catch(() => undefined)
    .then(write)
    .catch(() => undefined);
}

export function setTokens(tokens: AuthTokens): void {
  tokenMutationVersion += 1;
  accessToken = tokens.access;
  refreshToken = tokens.refresh;

  enqueueSecureStoreWrite(async () => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.access);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refresh);
  });
}

export function clearTokens(): void {
  tokenMutationVersion += 1;
  accessToken = null;
  refreshToken = null;

  enqueueSecureStoreWrite(async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  });
}

export async function loadPersistedTokens(): Promise<boolean> {
  await secureStoreWrite;
  const loadVersion = tokenMutationVersion;

  try {
    const [persistedAccessToken, persistedRefreshToken] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ]);

    if (tokenMutationVersion !== loadVersion) {
      return accessToken !== null && refreshToken !== null;
    }

    if (!persistedAccessToken || !persistedRefreshToken) {
      accessToken = null;
      refreshToken = null;
      return false;
    }

    accessToken = persistedAccessToken;
    refreshToken = persistedRefreshToken;
    return true;
  } catch {
    accessToken = null;
    refreshToken = null;
    return false;
  }
}
