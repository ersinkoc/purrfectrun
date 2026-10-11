import { expect, test } from 'bun:test';
import { LANGUAGE_KEY, loadLanguage, parseLanguage, saveLanguage } from '../lib/i18n';

test('language preference accepts English and safely defaults to Turkish', () => {
  expect(parseLanguage('en')).toBe('en');
  expect(parseLanguage('tr')).toBe('tr');
  for (const value of [null, '', 'fr', 'EN', '{broken']) expect(parseLanguage(value)).toBe('tr');
});

test('language choice survives storage reload without touching game records', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const values = new Map([['purrfect-run:records:v1', '{"highScore":1250}']]);
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  });
  try {
    saveLanguage('en');
    expect(values.get(LANGUAGE_KEY)).toBe('en');
    expect(loadLanguage()).toBe('en');
    saveLanguage('tr');
    expect(loadLanguage()).toBe('tr');
    expect(values.get('purrfect-run:records:v1')).toBe('{"highScore":1250}');
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});

test('blocked browser storage does not crash language switching', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('Storage blocked');
    },
  });
  try {
    expect(loadLanguage()).toBe('tr');
    expect(() => saveLanguage('en')).not.toThrow();
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});
