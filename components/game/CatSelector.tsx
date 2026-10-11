'use client';
import { Check } from 'lucide-react';
import { CAT_PROFILES, type CatProfile, type CatProfileId } from '@/lib/cat-profiles';
import type { Language, Messages } from '@/lib/i18n';
import type { CatMood } from '@/lib/cat-moments';

export function CatAvatar({
  profile,
  mood = 'awake',
  animated = false,
}: {
  profile: CatProfile;
  mood?: CatMood;
  animated?: boolean;
}) {
  const c = profile.colors;
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={`cat-avatar${animated ? ' cat-avatar-animated' : ''}`}
    >
      <path
        d="M10 28 8 7 26 19M38 19 56 7 54 28"
        fill={c.ear}
        stroke={c.ear}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M13 22 12 13 21 21M43 21 52 13 51 22" fill="#efb7ad" />
      <ellipse cx="32" cy="35" rx="25" ry="23" fill={c.head} />
      {profile.pattern === 'tabby' && (
        <path
          d="m23 15 2 8m7-9v8m9-7-2 8"
          stroke={c.markings}
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
      {profile.pattern === 'tuxedo' && <path d="m32 18-7 24h14Z" fill={c.muzzle} />}
      {profile.pattern === 'calico' && (
        <>
          <path d="M10 28c4-15 16-15 19-10v22H8Z" fill={c.markings} />
          <path d="M38 15c11 1 19 8 19 21H38Z" fill="#424b50" />
        </>
      )}
      <ellipse cx="32" cy="43" rx="14" ry="10" fill={c.muzzle} />
      {mood === 'sleepy' || mood === 'hungry' ? (
        <g fill="none" stroke={c.eyes} strokeWidth="2.4" strokeLinecap="round">
          <path d={mood === 'sleepy' ? 'M18 34q4 5 8 0' : 'M18 35h8'} />
          <path d={mood === 'sleepy' ? 'M38 34q4 5 8 0' : 'M38 35h8'} />
        </g>
      ) : (
        <g className="avatar-eyes">
          <ellipse cx="22" cy="34" rx="3" ry="4" fill={c.eyes} />
          <ellipse cx="42" cy="34" rx="3" ry="4" fill={c.eyes} />
          <circle cx="23" cy="33" r="1" fill="#fff" />
          <circle cx="43" cy="33" r="1" fill="#fff" />
        </g>
      )}
      {mood === 'sad' && (
        <>
          <path
            d="m17 28 9-2m12 0 9 2"
            fill="none"
            stroke={c.eyes}
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path className="avatar-tear" d="M46 40q-5 7 0 7t0-7" fill="#90cbd6" />
        </>
      )}
      <path d="m29 41 3 3 3-3Z" fill="#bd746e" />
      <path
        d={
          mood === 'sad'
            ? 'M32 44v2m-4 3q4-4 8 0'
            : mood === 'hungry'
              ? 'M29 48q3-4 6 0q-3 5-6 0'
              : 'M32 44v3m-4 0 4 2 4-2'
        }
        fill="none"
        stroke="#72574b"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="m8 40 12 2M7 46l13-1m24-3 12-2m-12 5 13 1"
        stroke="#72574b"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path d="M21 56h22" stroke={c.collar} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
export default function CatSelector({
  selected,
  language,
  locked,
  onSelect,
  text,
}: {
  selected: CatProfileId;
  language: Language;
  locked: boolean;
  onSelect: (id: CatProfileId) => void;
  text: Messages;
}) {
  return (
    <section className="cat-selector" aria-label={text.chooseCat}>
      <div className="cat-selector-heading">
        <h2>{text.chooseCat}</h2>
        <p>{locked ? text.catLocked : text.catHint}</p>
      </div>
      <div className="cat-options" role="group" aria-label={text.catProfiles}>
        {CAT_PROFILES.map((profile) => (
          <button
            key={profile.id}
            disabled={locked}
            aria-pressed={selected === profile.id}
            onClick={() => onSelect(profile.id)}
          >
            <CatAvatar profile={profile} />
            <span className="cat-profile-copy">
              <strong>{profile.name[language]}</strong>
              <small>{profile.description[language]}</small>
            </span>
            <span className="cat-choice-check">
              {selected === profile.id && <Check size={12} />}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
