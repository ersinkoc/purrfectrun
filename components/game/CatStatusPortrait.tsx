'use client';
import { Heart, Milk, Sparkles } from 'lucide-react';
import type { CatProfile } from '@/lib/cat-profiles';
import { getCatMoment } from '@/lib/cat-moments';
import type { EndReason } from '@/lib/engine';
import type { Language, Messages } from '@/lib/i18n';
import { CatAvatar } from './CatSelector';

export default function CatStatusPortrait({
  profile,
  language,
  status,
  reason,
  text,
  record = false,
}: {
  profile: CatProfile;
  language: Language;
  status: 'paused' | 'over';
  reason: EndReason;
  text: Messages;
  record?: boolean;
}) {
  const moment = getCatMoment(profile, language, status, reason);
  const c = profile.colors;
  const moodLabel =
    moment.situation === 'pause'
      ? text.catResting
      : moment.situation === 'energy'
        ? text.catHungry
        : text.catComfort;
  return (
    <div className={`cat-moment mood-${moment.mood}`} data-mood={moment.mood} data-cat={profile.id}>
      <div
        className="cat-portrait"
        role="img"
        aria-label={`${profile.name[language]} · ${moodLabel}`}
      >
        <div className="portrait-halo" />
        <svg className="portrait-body" viewBox="0 0 160 160" aria-hidden="true">
          <ellipse cx="80" cy="150" rx="43" ry="5" fill="#8ba387" opacity=".14" />
          <g className="portrait-tail">
            <path
              d="M109 126Q154 134 140 95"
              fill="none"
              stroke={c.fur}
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              d="M140 95q-3-7-8-10"
              fill="none"
              stroke={c.tailTip}
              strokeWidth="14"
              strokeLinecap="round"
            />
          </g>
          <g className="portrait-breath">
            <ellipse cx="80" cy="116" rx="35" ry="31" fill={c.fur} />
            <ellipse cx="80" cy="119" rx="21" ry="26" fill={c.chest} />
            {profile.pattern === 'calico' && (
              <ellipse cx="107" cy="116" rx="9" ry="15" fill={c.markings} />
            )}
          </g>
          <ellipse
            className="portrait-paw paw-left"
            cx="54"
            cy="144"
            rx="15"
            ry="9"
            fill={c.paws}
          />
          <ellipse
            className="portrait-paw paw-right"
            cx="106"
            cy="144"
            rx="15"
            ry="9"
            fill={c.paws}
          />
        </svg>
        <div className="portrait-head">
          <CatAvatar profile={profile} mood={moment.mood} animated />
          {moment.situation === 'lives' && (
            <span className="portrait-bandage" aria-hidden="true">
              ✚
            </span>
          )}
        </div>
        {moment.situation === 'pause' ? (
          <span className="portrait-symbol sleepy-symbol" aria-hidden="true">
            z<span>z</span>
            <small>z</small>
          </span>
        ) : moment.situation === 'energy' ? (
          <span className="portrait-symbol milk-symbol" aria-hidden="true">
            <Milk size={26} />
          </span>
        ) : (
          <span className="portrait-symbol heart-symbol" aria-hidden="true">
            <Heart size={21} fill="currentColor" />
          </span>
        )}
        {record && (
          <span className="portrait-record" aria-hidden="true">
            <Sparkles size={19} />
          </span>
        )}
      </div>
      <div className="cat-moment-name">
        {profile.name[language]}
        <span>{moodLabel}</span>
      </div>
      <p className="cat-moment-quote">“{moment.quote}”</p>
    </div>
  );
}
