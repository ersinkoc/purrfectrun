export type Mode = 'casual' | 'classic';
export type Status = 'ready' | 'running' | 'paused' | 'over';
export type EndReason = '' | 'energy' | 'lives';
export type Kind = 'box' | 'fence' | 'branch' | 'bin' | 'kennel' | 'milk' | 'paw' | 'fish';
export type Entity = { id: number; kind: Kind; lane: number; z: number; active: boolean };
export type Records = { highScore: number; totalMilk: number; bestLevel: number };
export const EMPTY_RECORDS: Records = { highScore: 0, totalMilk: 0, bestLevel: 1 };
export const LANES = [-2.15, 0, 2.15];
export const THEMES = [
  {
    name: 'Gündüz',
    sky: '#c4e7e5',
    fog: '#c4e7e5',
    grass: '#8bbd89',
    sun: '#fff3d1',
    ambient: 1.8,
  },
  {
    name: 'Günbatımı',
    sky: '#f2bca7',
    fog: '#f2bca7',
    grass: '#9caa83',
    sun: '#ffb373',
    ambient: 1.3,
  },
  {
    name: 'Neon gece',
    sky: '#252d54',
    fog: '#252d54',
    grass: '#425b70',
    sun: '#bcb8ff',
    ambient: 1.1,
  },
];
export type Snapshot = {
  status: Status;
  mode: Mode;
  lives: number;
  energy: number;
  distance: number;
  score: number;
  level: number;
  milk: number;
  paws: number;
  speed: number;
  reason: EndReason;
  records: Records;
};
export const isPickup = (kind: Kind) => kind === 'milk' || kind === 'paw' || kind === 'fish';

/** Pure simulation. All lengths are meters and all clocks are active-play seconds. */
export class RunnerEngine {
  status: Status = 'ready';
  mode: Mode = 'casual';
  lives = 3;
  energy = 100;
  distance = 0;
  bonus = 0;
  milk = 0;
  paws = 0;
  x = 0;
  lane = 1;
  y = 0;
  vy = 0;
  slide = 0;
  holding = false;
  time = 0;
  invulnerable = 0;
  speed = 0;
  reason: EndReason = '';
  entities: Entity[] = [];
  records: Records = { ...EMPTY_RECORDS };
  private sequence = 0;
  private seed = 1;
  private accumulator = 0;
  private baseMilk = 0;
  constructor(seed = 2026) {
    this.seed = seed;
    this.populate();
  }
  get level() {
    return Math.floor(this.distance / 500) + 1;
  }
  get score() {
    return Math.floor(this.distance + this.bonus);
  }
  private random() {
    this.seed = (Math.imul(this.seed, 1664525) + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }
  setRecords(records: Records) {
    this.records = { ...records };
    this.baseMilk = records.totalMilk;
  }
  setMode(mode: Mode) {
    if (this.status === 'running' || this.status === 'paused') return;
    this.mode = mode;
    this.lane = 1;
    this.x = 0;
    this.sequence = 0;
    this.populate();
  }
  start(mode: Mode = this.mode) {
    this.mode = mode;
    this.status = 'running';
    this.lives = 3;
    this.energy = 100;
    this.distance =
      this.bonus =
      this.milk =
      this.paws =
      this.x =
      this.y =
      this.vy =
      this.slide =
      this.time =
      this.invulnerable =
      this.speed =
      this.accumulator =
        0;
    this.lane = 1;
    this.holding = false;
    this.reason = '';
    this.sequence = 0;
    this.baseMilk = this.records.totalMilk;
    this.populate();
  }
  private populate() {
    this.entities = Array.from({ length: 16 }, (_, id) => this.spawn(id, -20 - id * 13));
  }
  private spawn(id: number, z: number): Entity {
    const n = this.sequence++;
    let kind: Kind;
    if (n % 3 === 1) kind = 'milk';
    else if (n % 11 === 10) kind = 'fish';
    else if (n % 3 === 2) kind = 'paw';
    else {
      const types: Kind[] =
        this.mode === 'casual' ? ['box', 'fence'] : ['box', 'fence', 'branch', 'bin', 'kennel'];
      kind = types[Math.floor(this.random() * types.length)];
    }
    return {
      id,
      kind,
      lane: this.mode === 'casual' ? 1 : Math.floor(this.random() * 3),
      z,
      active: true,
    };
  }
  jump() {
    if (this.status === 'running' && this.y <= 0.001 && this.slide <= 0) this.vy = 8.8;
  }
  move(direction: number) {
    if (this.status === 'running' && this.mode === 'classic')
      this.lane = Math.max(0, Math.min(2, this.lane + direction));
  }
  crouch() {
    if (this.status === 'running' && this.mode === 'classic' && this.y <= 0.001) this.slide = 0.85;
  }
  pause() {
    if (this.status === 'running') {
      this.status = 'paused';
      this.holding = false;
    } else if (this.status === 'paused') this.status = 'running';
  }
  tick(delta: number) {
    if (this.status !== 'running') return;
    // Fixed steps keep physics/collision identical across rendering rates. Long gaps are paused by the UI.
    this.accumulator += Math.min(delta, 0.1);
    while (this.accumulator >= 1 / 120 && this.status === 'running') {
      this.step(1 / 120);
      this.accumulator -= 1 / 120;
    }
  }
  private step(dt: number) {
    this.time += dt;
    this.energy = Math.max(0, this.energy - 2.8 * dt);
    if (this.energy === 0) {
      this.end('energy');
      return;
    }
    const base = 11 * 1.1 ** (this.level - 1);
    this.speed = base * (this.energy < 20 ? 0.62 : this.energy > 90 ? 1.12 : 1);
    const travel = this.speed * dt;
    this.distance += travel;
    this.x += (LANES[this.lane] - this.x) * (1 - Math.exp(-14 * dt));
    if (this.vy !== 0 || this.y > 0) {
      const gravity = this.mode === 'casual' && this.holding && this.vy < 0 ? 8 : 22;
      this.vy -= gravity * dt;
      this.y = Math.max(0, this.y + this.vy * dt);
      if (this.y === 0) this.vy = 0;
    }
    this.slide = Math.max(0, this.slide - dt);
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    for (const entity of this.entities) {
      const oldZ = entity.z;
      entity.z += travel;
      if (entity.active && this.intersects(entity, oldZ)) {
        entity.active = false;
        if (isPickup(entity.kind)) this.collect(entity.kind);
        else if (this.invulnerable === 0) {
          this.lives--;
          this.invulnerable = 1.5;
          if (this.lives === 0) {
            this.end('lives');
            break;
          }
        }
      }
    }
    if (this.status === 'running')
      for (const entity of this.entities) {
        if (entity.z > 10) {
          const farthest = Math.min(...this.entities.map((e) => e.z));
          const spacing = (13 + this.random() * 3) * 1.1 ** (this.level - 1);
          Object.assign(entity, this.spawn(entity.id, farthest - spacing));
        }
      }
    this.updateRecords();
  }
  /** Swept world-space AABB: covers travel between previous and current positions. */
  private intersects(e: Entity, previousZ: number) {
    const pickup = isPickup(e.kind);
    const halfWidth = pickup ? 0.38 : e.kind === 'branch' ? 0.92 : 0.75;
    const bottom = e.kind === 'branch' ? 1.18 : pickup ? 0.4 : 0;
    const top =
      e.kind === 'branch'
        ? 2.5
        : pickup
          ? 1.1
          : e.kind === 'bin' || e.kind === 'kennel'
            ? 2.7
            : 0.85;
    const halfDepth = pickup ? 0.35 : 0.6;
    const catTop = this.y + (this.slide > 0 ? 0.68 : 1.55);
    return (
      Math.abs(this.x - LANES[e.lane]) < halfWidth + 0.36 &&
      this.y < top &&
      catTop > bottom &&
      previousZ - halfDepth < 0.55 &&
      e.z + halfDepth > -0.55
    );
  }
  private collect(kind: Kind) {
    if (kind === 'milk') {
      this.energy = Math.min(100, this.energy + 25);
      this.milk++;
      this.bonus += 50;
    }
    if (kind === 'paw') {
      this.paws++;
      this.bonus += 100;
    }
    if (kind === 'fish') {
      this.lives = Math.min(3, this.lives + 1);
      this.bonus += 150;
    }
  }
  private updateRecords() {
    this.records.highScore = Math.max(this.records.highScore, this.score);
    this.records.totalMilk = this.baseMilk + this.milk;
    this.records.bestLevel = Math.max(this.records.bestLevel, this.level);
  }
  private end(reason: EndReason) {
    this.status = 'over';
    this.reason = reason;
    this.holding = false;
    this.speed = 0;
    this.updateRecords();
  }
  snapshot(): Snapshot {
    return {
      status: this.status,
      mode: this.mode,
      lives: this.lives,
      energy: this.energy,
      distance: this.distance,
      score: this.score,
      level: this.level,
      milk: this.milk,
      paws: this.paws,
      speed: this.speed,
      reason: this.reason,
      records: { ...this.records },
    };
  }
}
