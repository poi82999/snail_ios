import { useCallback, useEffect, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

const RECENT_SEARCHES_KEY = 'snail.recentSearches';
const MAX_RECENT_SEARCHES = 10;

export interface UseRecentSearchesResult {
  recent: string[];
  add(term: string): void;
  remove(term: string): void;
  clear(): void;
}

function normalizeStoredSearches(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const item of value) {
    if (typeof item !== 'string') {
      continue;
    }

    const term = item.trim();
    if (!term || seen.has(term)) {
      continue;
    }

    seen.add(term);
    normalized.push(term);

    if (normalized.length >= MAX_RECENT_SEARCHES) {
      break;
    }
  }

  return normalized;
}

function parseStoredSearches(raw: string | null): string[] {
  if (!raw) {
    return [];
  }

  try {
    return normalizeStoredSearches(JSON.parse(raw));
  } catch {
    return [];
  }
}

function nextRecentSearches(current: string[], term: string): string[] {
  // 최근 검색어는 같은 검색어를 맨 앞으로 이동시키고 최대 10개만 유지한다.
  return [term, ...current.filter((item) => item !== term)].slice(0, MAX_RECENT_SEARCHES);
}

export function useRecentSearches(): UseRecentSearchesResult {
  const [recent, setRecent] = useState<string[]>([]);
  const recentRef = useRef<string[]>([]);
  const writeQueueRef = useRef<Promise<void>>(Promise.resolve());
  const mutationVersionRef = useRef<number>(0);

  const persist = useCallback((next: string[]): void => {
    const serialized = JSON.stringify(next);

    // SecureStore 비동기 쓰기 순서를 보장해 마지막 사용자 액션이 영속 상태에 남게 한다.
    writeQueueRef.current = writeQueueRef.current
      .catch(() => undefined)
      .then(() => SecureStore.setItemAsync(RECENT_SEARCHES_KEY, serialized))
      .catch(() => undefined);
  }, []);

  const commit = useCallback(
    (next: string[]): void => {
      recentRef.current = next;
      setRecent(next);
      persist(next);
    },
    [persist]
  );

  useEffect(() => {
    let isMounted = true;
    const loadVersion = mutationVersionRef.current;

    async function loadRecentSearches(): Promise<void> {
      try {
        await writeQueueRef.current;
        const stored = await SecureStore.getItemAsync(RECENT_SEARCHES_KEY);

        if (!isMounted || mutationVersionRef.current !== loadVersion) {
          return;
        }

        const loaded = parseStoredSearches(stored);
        recentRef.current = loaded;
        setRecent(loaded);
      } catch {
        if (isMounted && mutationVersionRef.current === loadVersion) {
          recentRef.current = [];
          setRecent([]);
        }
      }
    }

    void loadRecentSearches();

    return () => {
      isMounted = false;
    };
  }, []);

  const add = useCallback(
    (term: string): void => {
      const trimmed = term.trim();
      if (!trimmed) {
        return;
      }

      mutationVersionRef.current += 1;
      commit(nextRecentSearches(recentRef.current, trimmed));
    },
    [commit]
  );

  const remove = useCallback(
    (term: string): void => {
      const trimmed = term.trim();
      if (!trimmed) {
        return;
      }

      const next = recentRef.current.filter((item) => item !== trimmed);
      if (next.length === recentRef.current.length) {
        return;
      }

      mutationVersionRef.current += 1;
      commit(next);
    },
    [commit]
  );

  const clear = useCallback((): void => {
    mutationVersionRef.current += 1;
    commit([]);
  }, [commit]);

  return { recent, add, remove, clear };
}
