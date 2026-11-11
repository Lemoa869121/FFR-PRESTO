import type { Quote } from '../types';

export const STORAGE_KEY = 'forstercalc.quotes.v1';

/** Minimal storage contract so that tests can inject an in-memory implementation. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export class StorageError extends Error {
  override name = 'StorageError';
}

export function createMemoryStore(initial: Record<string, string> = {}): KeyValueStore {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
  };
}

function defaultStore(): KeyValueStore {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  } catch {
    // localStorage can throw (private mode, disabled storage): fall back to memory.
  }
  return createMemoryStore();
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export class QuoteRepository {
  private readonly store: KeyValueStore;

  constructor(store: KeyValueStore = defaultStore()) {
    this.store = store;
  }

  list(): Quote[] {
    const raw = this.store.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new StorageError('Format de stockage inattendu.');
      return (parsed as Quote[]).slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } catch (error) {
      if (error instanceof StorageError) throw error;
      throw new StorageError('Les chiffrages enregistrés sont illisibles (données locales corrompues).');
    }
  }

  get(id: string): Quote | undefined {
    return this.list().find((q) => q.id === id);
  }

  save(quote: Quote): Quote {
    const quotes = this.list().filter((q) => q.id !== quote.id);
    const saved = { ...quote, updatedAt: new Date().toISOString() };
    this.write([saved, ...quotes]);
    return saved;
  }

  duplicate(id: string): Quote {
    const source = this.get(id);
    if (!source) throw new StorageError('Chiffrage introuvable.');
    const now = new Date().toISOString();
    const copy: Quote = {
      ...structuredClone(source),
      id: generateId(),
      project: { ...source.project, name: `${source.project.name} (copie)`, quoteReference: `${source.project.quoteReference}-COPIE` },
      createdAt: now,
      updatedAt: now,
    };
    this.write([copy, ...this.list()]);
    return copy;
  }

  remove(id: string): void {
    this.write(this.list().filter((q) => q.id !== id));
  }

  private write(quotes: Quote[]): void {
    try {
      this.store.setItem(STORAGE_KEY, JSON.stringify(quotes));
    } catch {
      throw new StorageError('Impossible d’enregistrer le chiffrage (stockage local plein ou indisponible).');
    }
  }
}
