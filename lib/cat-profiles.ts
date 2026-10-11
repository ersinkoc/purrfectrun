import type { Language } from './i18n';

export type CatProfileId = 'marmalade' | 'olive' | 'mocha' | 'patches';
export type CatProfile = {
  id: CatProfileId;
  name: Record<Language, string>;
  description: Record<Language, string>;
  pattern: 'tabby' | 'tuxedo' | 'points' | 'calico';
  colors: {
    fur: string;
    head: string;
    chest: string;
    muzzle: string;
    paws: string;
    ear: string;
    eyes: string;
    markings: string;
    collar: string;
    tailTip: string;
  };
};
export const CAT_PROFILES: readonly CatProfile[] = [
  {
    id: 'marmalade',
    name: { tr: 'Mırmır', en: 'Marmalade' },
    description: { tr: 'Turuncu tekir · Meraklı', en: 'Ginger tabby · Curious' },
    pattern: 'tabby',
    colors: {
      fur: '#e6a268',
      head: '#edaf75',
      chest: '#ffddb5',
      muzzle: '#fff0d9',
      paws: '#fff0d9',
      ear: '#dc925c',
      eyes: '#32443e',
      markings: '#bd7948',
      collar: '#629d88',
      tailTip: '#fff0d9',
    },
  },
  {
    id: 'olive',
    name: { tr: 'Zeytin', en: 'Olive' },
    description: { tr: 'Smokin · Neşeli', en: 'Tuxedo · Playful' },
    pattern: 'tuxedo',
    colors: {
      fur: '#384047',
      head: '#444b52',
      chest: '#fff3df',
      muzzle: '#fff3df',
      paws: '#fff3df',
      ear: '#30373d',
      eyes: '#91cfa2',
      markings: '#fff3df',
      collar: '#d39391',
      tailTip: '#384047',
    },
  },
  {
    id: 'mocha',
    name: { tr: 'Moka', en: 'Mocha' },
    description: { tr: 'Siyam · Zarif', en: 'Siamese · Graceful' },
    pattern: 'points',
    colors: {
      fur: '#e5d5b6',
      head: '#786358',
      chest: '#f4e8cc',
      muzzle: '#ac9180',
      paws: '#786358',
      ear: '#5d4c45',
      eyes: '#77c5df',
      markings: '#786358',
      collar: '#918ac1',
      tailTip: '#5d4c45',
    },
  },
  {
    id: 'patches',
    name: { tr: 'Benek', en: 'Patches' },
    description: { tr: 'Üç renkli · Maceracı', en: 'Calico · Adventurous' },
    pattern: 'calico',
    colors: {
      fur: '#f3ebdc',
      head: '#fff2e0',
      chest: '#fff8e9',
      muzzle: '#fff8e9',
      paws: '#fff8e9',
      ear: '#d59360',
      eyes: '#516b59',
      markings: '#d59360',
      collar: '#c7a359',
      tailTip: '#424b50',
    },
  },
];
export const CAT_PROFILE_KEY = 'purrfect-run:cat:v1';
export function getCatProfile(value: string | null): CatProfile {
  return CAT_PROFILES.find((profile) => profile.id === value) ?? CAT_PROFILES[0];
}
export function loadCatProfile(): CatProfile {
  try {
    return getCatProfile(localStorage.getItem(CAT_PROFILE_KEY));
  } catch {
    return CAT_PROFILES[0];
  }
}
export function saveCatProfile(id: CatProfileId) {
  try {
    localStorage.setItem(CAT_PROFILE_KEY, id);
  } catch {
    /* Keep the selected companion for this session when storage is blocked. */
  }
}
