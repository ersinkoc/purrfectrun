import { EMPTY_RECORDS, type Records } from './engine';
export const STORAGE_KEY = 'purrfect-run:records:v1';
export function parseRecords(raw: string | null): Records {
  try {
    const value: unknown = JSON.parse(raw ?? '{}');
    if (!value || typeof value !== 'object') return { ...EMPTY_RECORDS };
    const data = value as Record<string, unknown>;
    const number = (key: string, fallback: number) =>
      typeof data[key] === 'number' && Number.isFinite(data[key]) && data[key] >= fallback
        ? Math.floor(data[key])
        : fallback;
    return {
      highScore: number('highScore', 0),
      totalMilk: number('totalMilk', 0),
      bestLevel: number('bestLevel', 1),
    };
  } catch {
    return { ...EMPTY_RECORDS };
  }
}
export function loadRecords(): Records {
  try {
    return parseRecords(localStorage.getItem(STORAGE_KEY));
  } catch {
    return { ...EMPTY_RECORDS };
  }
}
export function saveRecords(records: Records): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}
