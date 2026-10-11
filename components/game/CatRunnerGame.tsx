'use client';
import dynamic from 'next/dynamic';
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronRight,
  Fish,
  Flag,
  Gamepad2,
  Keyboard,
  Leaf,
  Milk,
  MoonStar,
  Pause,
  PawPrint,
  Play,
  RotateCcw,
  Sparkles,
  Sun,
  Trophy,
  X,
} from 'lucide-react';
import { RunnerEngine, type Mode } from '@/lib/engine';
import { loadRecords, saveRecords } from '@/lib/storage';
import CatSelector from './CatSelector';
import CatStatusPortrait from './CatStatusPortrait';
import {
  CAT_PROFILES,
  getCatProfile,
  loadCatProfile,
  saveCatProfile,
  type CatProfileId,
} from '@/lib/cat-profiles';
const GameScene = dynamic(() => import('./GameScene'), { ssr: false });
import { messages, loadLanguage, saveLanguage, type Language, type Messages } from '@/lib/i18n';
class SceneBoundary extends Component<
  { children: ReactNode; text: Messages },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="scene-fallback">
        <PawPrint size={40} />
        <h3>{this.props.text.sceneError}</h3>
        <p>{this.props.text.sceneErrorHint}</p>
        <button className="primary-button" onClick={() => location.reload()}>
          {this.props.text.retry}{' '}
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function CatRunnerGame() {
  const [catProfile, setCatProfile] = useState(CAT_PROFILES[0]);
  useEffect(() => {
    setCatProfile(loadCatProfile());
  }, []);
  const [language, setLanguage] = useState<Language>('tr');
  const [languageLoaded, setLanguageLoaded] = useState(false);
  const t = messages[language];
  const format = (value: number) =>
    Math.floor(value).toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US');
  useEffect(() => {
    setLanguage(loadLanguage());
    setLanguageLoaded(true);
  }, []);
  useEffect(() => {
    if (!languageLoaded) return;
    document.documentElement.lang = language;
    saveLanguage(language);
  }, [language, languageLoaded]);
  const [engine] = useState(() => new RunnerEngine());
  const [state, setState] = useState(() => engine.snapshot());
  const [ready, setReady] = useState(false);
  const [help, setHelp] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const lastSave = useRef(0);
  const recordToBeat = useRef(0);
  const lastStatus = useRef(engine.status);
  const gesture = useRef<{ x: number; y: number; id: number } | null>(null);
  const helpDialog = useRef<HTMLDivElement>(null);
  const gameDialog = useRef<HTMLDivElement>(null);
  const sync = useCallback(() => {
    setState(engine.snapshot());
    const now = performance.now();
    if (now - lastSave.current > 1000 || lastStatus.current !== engine.status) {
      setStorageAvailable(saveRecords(engine.records));
      lastSave.current = now;
    }
    lastStatus.current = engine.status;
  }, [engine]);
  const start = useCallback(() => {
    if (!ready) return;
    recordToBeat.current = engine.records.highScore;
    engine.start();
    (document.activeElement as HTMLElement)?.blur();
    sync();
  }, [engine, ready, sync]);
  const pause = useCallback(() => {
    engine.pause();
    (document.activeElement as HTMLElement)?.blur();
    sync();
  }, [engine, sync]);
  const sceneReady = useCallback(() => setReady(true), []);
  const selectMode = (mode: Mode) => {
    engine.setMode(mode);
    sync();
  };
  useEffect(() => {
    engine.setRecords(loadRecords());
    setState(engine.snapshot());
    const flush = () => {
      saveRecords(engine.records);
    };
    const deactivate = () => {
      engine.holding = false;
      if (engine.status === 'running') {
        engine.pause();
        sync();
      }
      flush();
    };
    const visibility = () => {
      if (document.hidden) deactivate();
    };
    window.addEventListener('blur', deactivate);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      flush();
      window.removeEventListener('blur', deactivate);
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [engine, sync]);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest('input, select, textarea, a, [contenteditable="true"]') || help) return;
      // Keep native Space activation on focused buttons; P and R still control the game.
      if (target?.closest('button') && e.code === 'Space') return;
      const key = e.code;
      if (
        ![
          'Space',
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'KeyA',
          'KeyD',
          'KeyS',
          'KeyP',
          'KeyR',
          'Escape',
        ].includes(key)
      )
        return;
      e.preventDefault();
      if (e.repeat) return;
      if (key === 'KeyP' || key === 'Escape') {
        pause();
        return;
      }
      if (key === 'KeyR' && engine.status === 'over') {
        start();
        return;
      }
      if (key === 'Space') {
        if (engine.status === 'ready') start();
        else {
          engine.holding = true;
          engine.jump();
        }
      }
      if (engine.mode === 'classic') {
        if (key === 'ArrowUp') engine.jump();
        if (key === 'ArrowLeft' || key === 'KeyA') engine.move(-1);
        if (key === 'ArrowRight' || key === 'KeyD') engine.move(1);
        if (key === 'ArrowDown' || key === 'KeyS') engine.crouch();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') engine.holding = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      engine.holding = false;
    };
  }, [engine, help, pause, start]);
  useEffect(() => {
    if (!help) return;
    const previous = document.activeElement as HTMLElement | null;
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setHelp(false);
      }
      if (event.key === 'Tab') {
        const buttons = helpDialog.current?.querySelectorAll<HTMLButtonElement>('button');
        if (!buttons?.length) return;
        const first = buttons[0],
          last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('keydown', key);
      previous?.focus();
    };
  }, [help]);
  const theme = (state.level - 1) % 3;
  useEffect(() => {
    if (help || (state.status !== 'paused' && state.status !== 'over')) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = gameDialog.current;
    dialog?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    // This dialog covers the stage; language and sidebar controls stay reachable.
    return () => {
      previous?.focus({ preventScroll: true });
    };
  }, [state.status, help]);
  const playing = state.status === 'running';
  const locked = playing || state.status === 'paused';
  const selectCat = (id: CatProfileId) => {
    if (engine.status === 'running' || engine.status === 'paused') return;
    setCatProfile(getCatProfile(id));
    saveCatProfile(id);
  };
  return (
    <main className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label={t.home}>
          <span className="brand-mark">
            <PawPrint size={24} fill="currentColor" />
          </span>
          <span>
            purrfect<span className="brand-light">run</span>
            <span className="brand-dot">.</span>
          </span>
        </a>
        <span className="header-note">
          <span /> {t.headerNote}{' '}
        </span>
        <div className="header-actions">
          <div className="language-switch" role="group" aria-label={t.language}>
            <button
              lang="tr"
              aria-label="Türkçe"
              aria-pressed={language === 'tr'}
              onClick={() => setLanguage('tr')}
            >
              TR
            </button>
            <button
              lang="en"
              aria-label="English"
              aria-pressed={language === 'en'}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
          </div>
          <button
            className="help-button"
            onClick={() => {
              if (playing) pause();
              setHelp(true);
            }}
          >
            <Gamepad2 size={17} /> {t.howTo} <ArrowUpRight size={15} />
          </button>
        </div>
      </header>
      <section className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="tiny-line" /> {t.eyebrow}{' '}
          </div>
          <h1>
            {t.titleFirst} <span>{t.titleSecond}</span>
          </h1>
          <p>{t.subtitle}</p>
        </div>
        <div className="adventure-badge">
          <Leaf size={16} />
          <span>
            {t.cozyWorld} <br />
            <strong>{t.endlessAdventure}</strong>
          </span>
        </div>
      </section>
      <CatSelector
        selected={catProfile.id}
        language={language}
        locked={locked}
        onSelect={selectCat}
        text={t}
      />
      <div className="game-layout">
        <section
          className={`game-stage theme-${theme}`}
          aria-label={t.gameLabel}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest('button, a, .modal-card') || !playing) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            gesture.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
            if (engine.mode === 'casual') {
              engine.holding = true;
              engine.jump();
            }
          }}
          onPointerUp={(e) => {
            engine.holding = false;
            const g = gesture.current;
            gesture.current = null;
            if (!g || g.id !== e.pointerId || engine.mode !== 'classic') return;
            const dx = e.clientX - g.x,
              dy = e.clientY - g.y;
            if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) engine.move(dx > 0 ? 1 : -1);
            else if (dy > 30) engine.crouch();
            else engine.jump();
          }}
          onPointerCancel={() => {
            engine.holding = false;
            gesture.current = null;
          }}
        >
          <div className="scene-container">
            <SceneBoundary text={t}>
              <GameScene
                fallbackText={t.sceneFallback}
                catProfile={catProfile}
                engine={engine}
                onUpdate={sync}
                onReady={sceneReady}
              />
            </SceneBoundary>
          </div>
          {!ready && (
            <div className="loading-indicator">
              <PawPrint className="animate-pulse" /> {t.loading}{' '}
            </div>
          )}
          <div className="hud-top">
            <div className="life-card">
              <div className="hud-label">{t.livesTitle}</div>
              <div
                className="lives"
                role="img"
                aria-label={`${format(state.lives)} ${t.livesRemaining}`}
              >
                {[0, 1, 2].map((i) => (
                  <PawPrint
                    key={i}
                    size={23}
                    className={i < state.lives ? 'alive' : 'lost'}
                    fill={i < state.lives ? 'currentColor' : 'none'}
                  />
                ))}
                <span>
                  {state.lives}
                  <small>/3</small>
                </span>
              </div>
            </div>
            <div className="energy-card">
              <div className="energy-title">
                <span>
                  <Milk size={15} /> {t.energyTitle}{' '}
                </span>
                <strong>
                  {Math.ceil(state.energy)}
                  <small>%</small>
                </strong>
              </div>
              <div
                className="energy-track"
                role="progressbar"
                aria-label={t.energyLabel}
                aria-valuenow={Math.ceil(state.energy)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={state.energy < 20 ? 'low' : ''}
                  style={{ width: `${state.energy}%` }}
                />
              </div>
              <div className="energy-caption">
                {state.energy > 90 ? (
                  <>
                    <Sparkles size={11} /> {t.turbo}{' '}
                  </>
                ) : state.energy < 20 ? (
                  t.lowEnergy
                ) : (
                  t.energyHint
                )}
              </div>
            </div>
            {locked && (
              <button
                className="pause-button"
                onClick={pause}
                aria-label={playing ? t.pause : t.resume}
              >
                {playing ? <Pause size={19} /> : <Play size={19} />}
              </button>
            )}
          </div>
          {locked && (
            <div className="live-score">
              <span>
                {t.score} <strong>{format(state.score)}</strong>
              </span>
              <i />
              <span>
                {t.distance}{' '}
                <strong>
                  {format(state.distance)}
                  <small> m</small>
                </strong>
              </span>
            </div>
          )}
          {state.status === 'ready' && (
            <div className="intro-card">
              <div className="intro-tag">
                <span /> {t.hello}{' '}
              </div>
              <h2>
                {t.introFirst} <br />
                {t.introSecond}{' '}
              </h2>
              <p>
                {t.introDescriptionFirst} <br />
                {t.introDescriptionSecond}{' '}
              </p>
              <button className="primary-button" disabled={!ready} onClick={start}>
                <Play size={16} fill="currentColor" /> {t.start} <ArrowRight size={18} />
              </button>
              <span className="intro-hint">
                <Keyboard size={13} /> {state.mode === 'casual' ? t.casualHint : t.classicHint}
              </span>
            </div>
          )}
          {state.status === 'paused' && (
            <div className="modal-scrim">
              <div
                className="modal-card character-modal"
                ref={gameDialog}
                role="dialog"
                aria-labelledby="pause-title"
              >
                <CatStatusPortrait
                  profile={catProfile}
                  language={language}
                  status="paused"
                  reason={state.reason}
                  text={t}
                />
                <div className="eyebrow">{t.pauseTag}</div>
                <h2 id="pause-title">{t.pauseTitle}</h2>
                <p>{t.pauseDescription}</p>
                <button className="primary-button" onClick={pause}>
                  <Play size={17} fill="currentColor" /> {t.resume}{' '}
                </button>
                <span className="modal-hint">{t.resumeHint}</span>
              </div>
            </div>
          )}
          {state.status === 'over' && (
            <div className="modal-scrim">
              <div
                className="modal-card character-modal"
                ref={gameDialog}
                role="dialog"
                aria-labelledby="over-title"
              >
                <CatStatusPortrait
                  profile={catProfile}
                  language={language}
                  status="over"
                  reason={state.reason}
                  text={t}
                  record={state.score > recordToBeat.current}
                />
                <div className="eyebrow">{t.overTag}</div>
                <h2 id="over-title">{t.overTitle}</h2>
                <p>{state.reason === 'energy' ? t.energyOver : t.livesOver}</p>
                <div className="end-score">
                  {format(state.score)}
                  <small>{t.totalScore}</small>
                </div>
                <div className="end-stats">
                  <span>{format(state.distance)} m</span>
                  <span>
                    {state.milk} {t.milkWord}
                  </span>
                  <span>
                    {t.levelWord} {state.level}
                  </span>
                </div>
                {state.score > recordToBeat.current && (
                  <div className="new-record">
                    <Trophy size={14} /> {t.newRecord}{' '}
                  </div>
                )}
                <button className="primary-button" onClick={start}>
                  <RotateCcw size={17} /> {t.restart}{' '}
                </button>
                <span className="modal-hint">{t.modeEndHint}</span>
              </div>
            </div>
          )}
          <div className="stage-bottom">
            <span className="location-pill">
              {theme === 2 ? <MoonStar size={14} /> : <Sun size={14} />}{' '}
              {[t.day, t.sunset, t.night][theme]} <span>·</span> {t.neighborhood}{' '}
            </span>
            <span className="level-pill">
              {t.level} <strong>{String(state.level).padStart(2, '0')}</strong>
            </span>
          </div>
          {playing && state.mode === 'classic' && (
            <div className="touch-controls">
              <button aria-label={t.leftLane} onClick={() => engine.move(-1)}>
                <ArrowLeft />
              </button>
              <button aria-label={t.jump} onClick={() => engine.jump()}>
                <ArrowUp />
              </button>
              <button aria-label={t.slide} onClick={() => engine.crouch()}>
                <ArrowDown />
              </button>
              <button aria-label={t.rightLane} onClick={() => engine.move(1)}>
                <ArrowRight />
              </button>
            </div>
          )}
        </section>
        <aside className="sidebar">
          <section className="records-card">
            <div className="card-heading">
              <span className="icon-chip">
                <Trophy size={18} />
              </span>
              <h2>{t.journal}</h2>
              <span className="record-dot" />
            </div>
            <div className="high-score">
              <span>{t.highScore}</span>
              <strong>{format(state.records.highScore).padStart(4, '0')}</strong>
              <div>
                <span>{t.chaseBest}</span>
                <ArrowUpRight size={16} />
              </div>
            </div>
            <div className="record-grid">
              <div>
                <Milk size={19} />
                <strong>{format(state.records.totalMilk)}</strong>
                <span>{t.totalMilk}</span>
              </div>
              <div>
                <Flag size={19} />
                <strong>{String(state.records.bestLevel).padStart(2, '0')}</strong>
                <span>{t.bestLevel}</span>
              </div>
            </div>
            <div className="saved-note">
              <span /> {storageAvailable ? t.saved : t.notSaved}
            </div>
          </section>
          <section className="mode-card">
            <div className="card-heading">
              <span className="icon-chip">
                <Gamepad2 size={18} />
              </span>
              <h2>{t.playStyle}</h2>
            </div>
            <p>{t.styleDescription}</p>
            <div className="mode-options" role="group" aria-label={t.controlMode}>
              <button
                aria-pressed={state.mode === 'casual'}
                disabled={locked}
                className={state.mode === 'casual' ? 'selected' : ''}
                onClick={() => selectMode('casual')}
              >
                <span className="mode-icon">
                  <PawPrint size={19} />
                </span>
                <span>
                  <strong>{t.casual}</strong>
                  <small>{t.casualDescription}</small>
                </span>
                <span className="radio-circle">
                  {state.mode === 'casual' && <Check size={11} />}
                </span>
              </button>
              <button
                aria-pressed={state.mode === 'classic'}
                disabled={locked}
                className={state.mode === 'classic' ? 'selected' : ''}
                onClick={() => selectMode('classic')}
              >
                <span className="mode-icon">
                  <Gamepad2 size={19} />
                </span>
                <span>
                  <strong>{t.classic}</strong>
                  <small>{t.classicDescription}</small>
                </span>
                <span className="radio-circle">
                  {state.mode === 'classic' && <Check size={11} />}
                </span>
              </button>
            </div>
            <div className="mode-help">
              <Keyboard size={15} />
              <span>
                {locked ? t.modeLocked : state.mode === 'casual' ? t.casualKeys : t.classicKeys}
              </span>
            </div>
          </section>
          <section className="tip-card">
            <span className="tip-art">
              <Milk size={31} />
              <Sparkles size={14} />
            </span>
            <div>
              <h3>{t.tipTitle}</h3>
              <p>
                {t.tipFirst} <br />
                {t.tipSecond}{' '}
              </p>
            </div>
          </section>
        </aside>
      </div>
      <section className="guide-strip" aria-label={t.tipsLabel}>
        <div>
          <span className="guide-icon mint">
            <Milk size={22} />
          </span>
          <span>
            <strong>{t.milkTip}</strong>
            <small>{t.milkBonus}</small>
          </span>
        </div>
        <div>
          <span className="guide-icon gold">
            <PawPrint size={22} />
          </span>
          <span>
            <strong>{t.pawTip}</strong>
            <small>{t.pawBonus}</small>
          </span>
        </div>
        <div>
          <span className="guide-icon peach">
            <Fish size={22} />
          </span>
          <span>
            <strong>{t.fishTip}</strong>
            <small>{t.fishBonus}</small>
          </span>
        </div>
        <div className="guide-level">
          <span>{t.everyLevel}</span>
          <strong>
            {t.levelTip} <ChevronRight size={15} />
          </strong>
        </div>
      </section>
      <footer className="site-footer">
        <span>{t.footerFirst}</span>
        <span>
          <PawPrint size={12} /> {t.footerSecond}{' '}
        </span>
      </footer>
      {help && (
        <div className="help-scrim" onClick={() => setHelp(false)}>
          <div
            ref={helpDialog}
            className="help-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="help-close"
              autoFocus
              onClick={() => setHelp(false)}
              aria-label={t.closeHelp}
            >
              <X size={20} />
            </button>
            <span className="modal-icon">
              <Gamepad2 size={30} />
            </span>
            <h2 id="help-title">{t.helpTitle}</h2>
            <p>{t.helpIntro} </p>
            <div className="help-row">
              <strong>{t.casual}</strong>
              <span>
                <kbd>Space</kbd> {t.helpJump} <br />
                {t.helpGlide}{' '}
              </span>
            </div>
            <div className="help-row">
              <strong>{t.classic}</strong>
              <span>
                <kbd>A</kbd> <kbd>D</kbd> {t.helpLane} <br />
                <kbd>Space</kbd> {t.helpJumpSlide} <kbd>S</kbd> {t.helpSlide} <br />
                {t.helpMobile}{' '}
              </span>
            </div>
            <div className="help-row">
              <strong>{t.obstacles}</strong>
              <span>{t.helpObstacles} </span>
            </div>
            <div className="help-row">
              <strong>{t.explore}</strong>
              <span>
                <kbd>P</kbd>
                {t.helpPause} <br />
                {t.helpLevel} <br />
                {t.helpPoints}{' '}
              </span>
            </div>
            <button className="primary-button" onClick={() => setHelp(false)}>
              {t.helpDone} <ArrowRight size={17} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
