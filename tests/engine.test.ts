import { describe, expect, test } from 'bun:test';
import { RunnerEngine, type Entity } from '../lib/engine';
import { parseRecords } from '../lib/storage';
const run = (e: RunnerEngine, seconds: number, hz = 60) => {
  for (let i = 0; i < Math.round(seconds * hz); i++) e.tick(1 / hz);
};
const clean = (mode: 'casual' | 'classic' = 'casual') => {
  const e = new RunnerEngine(42);
  e.start(mode);
  e.entities = [];
  return e;
};
const entity = (kind: Entity['kind'], lane = 1, z = 0): Entity => ({
  id: 0,
  kind,
  lane,
  z,
  active: true,
});
describe('runner simulation', () => {
  test('starts with three lives and resets run stats without erasing lifetime records', () => {
    const e = clean();
    e.setRecords({ highScore: 3000, totalMilk: 12, bestLevel: 4 });
    e.milk = 2;
    e.distance = 100;
    e.start();
    expect(e.lives).toBe(3);
    expect(e.energy).toBe(100);
    expect(e.score).toBe(0);
    expect(e.records.highScore).toBe(3000);
    expect(e.records.totalMilk).toBe(12);
  });
  test('holding space in casual mode extends flight but never enables air jumps', () => {
    const tap = clean(),
      hold = clean();
    tap.jump();
    hold.jump();
    hold.holding = true;
    run(tap, 0.5);
    run(hold, 0.5);
    const velocity = hold.vy;
    hold.jump();
    expect(hold.vy).toBe(velocity);
    run(tap, 0.4);
    run(hold, 0.4);
    expect(tap.y).toBe(0);
    expect(hold.y).toBeGreaterThan(0);
  });
  test('classic lanes interpolate smoothly, stay within bounds, and casual ignores lane/slide commands', () => {
    const e = clean('classic');
    e.move(-1);
    e.move(-1);
    run(e, 0.05);
    expect(e.lane).toBe(0);
    expect(e.x).toBeGreaterThan(-2.15);
    expect(e.x).toBeLessThan(0);
    run(e, 1);
    expect(e.x).toBeCloseTo(-2.15, 3);
    const c = clean();
    c.move(1);
    c.crouch();
    expect(c.lane).toBe(1);
    expect(c.slide).toBe(0);
  });
  test('grounded box costs a life; jumping clears it and a different lane remains safe', () => {
    const hit = clean();
    hit.entities = [entity('box')];
    run(hit, 0.02);
    expect(hit.lives).toBe(2);
    expect(hit.invulnerable).toBeGreaterThan(1.4);
    const jump = clean();
    jump.jump();
    run(jump, 0.25);
    jump.entities = [entity('box')];
    run(jump, 0.02);
    expect(jump.lives).toBe(3);
    const otherLane = clean();
    otherLane.entities = [entity('bin', 0)];
    run(otherLane, 0.02);
    expect(otherLane.lives).toBe(3);
  });
  test('only a slide clears hanging laundry', () => {
    const standing = clean('classic');
    standing.entities = [entity('branch')];
    run(standing, 0.02);
    expect(standing.lives).toBe(2);
    const sliding = clean('classic');
    sliding.crouch();
    sliding.entities = [entity('branch')];
    run(sliding, 0.02);
    expect(sliding.lives).toBe(3);
  });
  test('damage is blocked for 1.5 seconds, then three hits end the run', () => {
    const e = clean();
    e.entities = [entity('box'), { ...entity('fence'), id: 1 }];
    run(e, 0.02);
    expect(e.lives).toBe(2);
    e.entities = [];
    run(e, 1.6);
    e.entities = [entity('box')];
    run(e, 0.02);
    expect(e.lives).toBe(1);
    e.entities = [];
    run(e, 1.6);
    e.entities = [entity('box')];
    run(e, 0.02);
    expect(e.status).toBe('over');
    expect(e.lives).toBe(0);
  });
  test('milk restores 25%, increments lifetime total once, and fish heals up to three', () => {
    const e = clean();
    e.setRecords({ highScore: 0, totalMilk: 7, bestLevel: 1 });
    e.energy = 40;
    e.lives = 2;
    e.entities = [entity('milk')];
    run(e, 0.02);
    expect(e.energy).toBeCloseTo(65, 0);
    expect(e.milk).toBe(1);
    expect(e.records.totalMilk).toBe(8);
    run(e, 0.2);
    expect(e.milk).toBe(1);
    e.entities = [entity('fish')];
    run(e, 0.02);
    expect(e.lives).toBe(3);
    e.entities = [entity('fish')];
    run(e, 0.02);
    expect(e.lives).toBe(3);
  });
  test('golden paws award 100 points', () => {
    const e = clean();
    e.entities = [entity('paw')];
    run(e, 0.02);
    expect(e.bonus).toBe(100);
    expect(e.paws).toBe(1);
  });
  test('turbo above 90%, tired below 20%, zero energy ends the run', () => {
    const e = clean();
    run(e, 0.02);
    expect(e.speed).toBeCloseTo(12.32, 2);
    e.energy = 50;
    run(e, 0.02);
    expect(e.speed).toBe(11);
    e.energy = 19;
    run(e, 0.02);
    expect(e.speed).toBeCloseTo(6.82, 2);
    e.energy = 0.01;
    run(e, 0.02);
    expect(e.status).toBe('over');
    expect(e.speed).toBe(0);
  });
  test('pause freezes distance, stamina, immunity and jump physics', () => {
    const e = clean();
    e.jump();
    run(e, 0.2);
    e.invulnerable = 1;
    e.pause();
    const before = e.snapshot(),
      y = e.y;
    run(e, 10);
    expect(e.snapshot()).toEqual(before);
    expect(e.y).toBe(y);
    e.pause();
    run(e, 0.1);
    expect(e.distance).toBeGreaterThan(before.distance);
  });
  test('each 500m increases level and speed by ten percent', () => {
    const e = clean();
    e.distance = 500;
    e.energy = 50;
    run(e, 0.02);
    expect(e.level).toBe(2);
    expect(e.speed).toBeCloseTo(12.1, 3);
    expect(e.records.bestLevel).toBe(2);
    e.distance = 1500;
    run(e, 0.02);
    expect(e.level).toBe(4);
    expect(e.speed).toBeCloseTo(11 * 1.1 ** 3, 3);
  });
  test('fixed steps are consistent at 30 and 120 FPS', () => {
    const a = clean(),
      b = clean();
    a.jump();
    b.jump();
    run(a, 2, 30);
    run(b, 2, 120);
    expect(a.distance).toBeCloseTo(b.distance, 6);
    expect(a.energy).toBeCloseTo(b.energy, 6);
    expect(a.y).toBe(b.y);
  });
  test('entity pool remains bounded and one-button obstacles are always jumpable', () => {
    const e = new RunnerEngine();
    e.start();
    for (let i = 0; i < 1000; i++) {
      e.energy = 100;
      e.invulnerable = 2;
      e.tick(0.1);
    }
    expect(e.entities).toHaveLength(16);
    expect(
      e.entities.every((v) => v.lane === 1 && !['branch', 'bin', 'kennel'].includes(v.kind)),
    ).toBe(true);
    expect(Math.min(...e.entities.map((v) => v.z))).toBeGreaterThan(-300);
  });
});
describe('storage validation', () => {
  test('accepts saved records and rejects malformed or missing values', () => {
    expect(parseRecords('{"highScore":1500,"totalMilk":12,"bestLevel":4}')).toEqual({
      highScore: 1500,
      totalMilk: 12,
      bestLevel: 4,
    });
    for (const value of [
      null,
      '{',
      'null',
      '"hello"',
      '{"highScore":-5,"totalMilk":"900","bestLevel":0}',
    ])
      expect(parseRecords(value)).toEqual({ highScore: 0, totalMilk: 0, bestLevel: 1 });
  });
});
