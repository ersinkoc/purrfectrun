import type { CatProfile, CatProfileId } from './cat-profiles';
import type { EndReason } from './engine';
import type { Language } from './i18n';

export type CatMood = 'awake' | 'sleepy' | 'sad' | 'hungry';
export type CatSituation = 'pause' | 'lives' | 'energy';
const lines: Record<CatProfileId, Record<Language, Record<CatSituation, string>>> = {
  marmalade: {
    tr: {
      pause: 'Bir güneş köşesi buldum. Biraz mırlama molası!',
      lives: 'Kutular sandığımdan sertmiş… Patilerimi toparlayıp geliyorum!',
      energy: 'Bir yudum süt olursa yine rüzgâr gibi koşarım!',
    },
    en: {
      pause: 'I found a sunny spot. Time for a purr break!',
      lives: 'Those boxes were tougher than I thought… Give my paws a moment!',
      energy: 'One sip of milk and I’ll be off like the wind!',
    },
  },
  olive: {
    tr: {
      pause: 'Smokinim yerinde, şimdi kısa bir güzellik uykusu.',
      lives: 'Sekiz canım daha yok mu? O zaman bir tur daha!',
      energy: 'Böyle şık bir kedi aç karnına koşamaz.',
    },
    en: {
      pause: 'My tuxedo is tidy. Now for a little beauty sleep.',
      lives: 'No eight lives left? Then let’s give it another run!',
      energy: 'A cat this stylish shouldn’t run on an empty stomach.',
    },
  },
  mocha: {
    tr: {
      pause: 'Derin bir nefes… Sonra zarif bir dönüş.',
      lives: 'Küçük bir tökezleme. Bir sonraki tur daha zarif olacak.',
      energy: 'Patiler hafif, süt deposu da biraz fazla hafif.',
    },
    en: {
      pause: 'One deep breath… Then a graceful comeback.',
      lives: 'A little stumble. The next run will be more graceful.',
      energy: 'Light paws, and a milk tank that’s a little too light.',
    },
  },
  patches: {
    tr: {
      pause: 'Beneklerimi sayıyorum. Macera biraz bekleyebilir.',
      lives: 'Her benekte bir macera var. Bu da onların biriydi!',
      energy: 'Süt molası verelim, sonra bütün sokakları keşfedelim!',
    },
    en: {
      pause: 'Counting my spots. Adventure can wait a moment.',
      lives: 'Every spot has an adventure. This was one of them!',
      energy: 'Let’s get some milk, then explore every street!',
    },
  },
};
export function getCatMoment(
  profile: CatProfile,
  language: Language,
  status: 'paused' | 'over',
  reason: EndReason,
) {
  const situation: CatSituation =
    status === 'paused' ? 'pause' : reason === 'energy' ? 'energy' : 'lives';
  const mood: CatMood =
    situation === 'pause' ? 'sleepy' : situation === 'energy' ? 'hungry' : 'sad';
  return { situation, mood, quote: lines[profile.id][language][situation] };
}
