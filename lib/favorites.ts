export type FavoriteType = 'experts' | 'trials' | 'publications';

const KEY = 'favorites';

type FavoritesStore = {
  experts: string[];
  trials: string[];
  publications: string[];
};

function load(): FavoritesStore {
  if (typeof window === 'undefined') return { experts: [], trials: [], publications: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { experts: [], trials: [], publications: [] };
}

function save(data: FavoritesStore) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
}

export function getFavorites(kind: FavoriteType): string[] {
  const store = load();
  return store[kind] || [];
}

export function toggleFavorite(kind: FavoriteType, id: string): boolean {
  const store = load();
  const list = new Set(store[kind] || []);
  let added = false;
  if (list.has(id)) {
    list.delete(id);
  } else {
    list.add(id);
    added = true;
  }
  store[kind] = Array.from(list);
  save(store);
  // Best-effort server sync
  if (typeof window !== 'undefined') {
    const controller = new AbortController();
    const payload = JSON.stringify({ kind, itemId: id });
    const fetchOpts: RequestInit = {
      method: added ? 'POST' : 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      signal: controller.signal,
    };
    // Fire and forget
    fetch('/api/favorites', fetchOpts).catch(() => controller.abort());
  }
  return added; // true if added, false if removed
}
