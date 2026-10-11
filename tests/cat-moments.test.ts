import { expect, test } from 'bun:test';
import { CAT_PROFILES, getCatProfile } from '../lib/cat-profiles';
import { getCatMoment } from '../lib/cat-moments';

test('pause uses a resting expression even if the previous reason was a collision', () => {
  const result = getCatMoment(getCatProfile('olive'), 'tr', 'paused', 'lives');
  expect(result.situation).toBe('pause');
  expect(result.mood).toBe('sleepy');
});

test('game over distinguishes exhausted milk from lost lives', () => {
  const profile = getCatProfile('mocha');
  const hunger = getCatMoment(profile, 'en', 'over', 'energy');
  const collision = getCatMoment(profile, 'en', 'over', 'lives');
  expect(hunger.mood).toBe('hungry');
  expect(hunger.situation).toBe('energy');
  expect(collision.mood).toBe('sad');
  expect(collision.situation).toBe('lives');
  expect(hunger.quote).not.toBe(collision.quote);
});

test('each companion speaks in the selected language with a different line for each moment', () => {
  for (const profile of CAT_PROFILES) {
    const rest = getCatMoment(profile, 'en', 'paused', '');
    const translated = getCatMoment(profile, 'tr', 'paused', '');
    const exhausted = getCatMoment(profile, 'en', 'over', 'energy');
    const hurt = getCatMoment(profile, 'en', 'over', 'lives');
    expect(rest.quote.length).toBeGreaterThan(0);
    expect(translated.quote).not.toBe(rest.quote);
    expect(new Set([rest.quote, exhausted.quote, hurt.quote]).size).toBe(3);
  }
});
