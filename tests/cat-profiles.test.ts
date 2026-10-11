import { expect, test } from 'bun:test';
import {
  CAT_PROFILE_KEY,
  getCatProfile,
  loadCatProfile,
  saveCatProfile,
} from '../lib/cat-profiles';

test('saved companion is restored and invalid profile IDs use the default cat', () => {
  expect(getCatProfile('olive').name.en).toBe('Olive');
  expect(getCatProfile('mocha').pattern).toBe('points');
  for (const value of [null, '', 'unknown', '{broken'])
    expect(getCatProfile(value).id).toBe('marmalade');
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
    saveCatProfile('patches');
    expect(values.get(CAT_PROFILE_KEY)).toBe('patches');
    expect(loadCatProfile().id).toBe('patches');
    expect(values.get('purrfect-run:records:v1')).toBe('{"highScore":1250}');
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});

test('blocked storage does not prevent choosing a companion', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('Storage blocked');
    },
  });
  try {
    expect(loadCatProfile().id).toBe('marmalade');
    expect(() => saveCatProfile('olive')).not.toThrow();
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});
