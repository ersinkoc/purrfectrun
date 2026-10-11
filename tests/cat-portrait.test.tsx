import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import CatStatusPortrait from '../components/game/CatStatusPortrait';
import { getCatProfile } from '../lib/cat-profiles';
import { messages } from '../lib/i18n';

test('portraits render the selected companion and the correct localized reaction', () => {
  const profile = getCatProfile('olive');
  const resting = renderToStaticMarkup(
    <CatStatusPortrait
      profile={profile}
      language="tr"
      status="paused"
      reason=""
      text={messages.tr}
    />,
  );
  const hurt = renderToStaticMarkup(
    <CatStatusPortrait
      profile={profile}
      language="en"
      status="over"
      reason="lives"
      text={messages.en}
    />,
  );
  const hungry = renderToStaticMarkup(
    <CatStatusPortrait
      profile={profile}
      language="en"
      status="over"
      reason="energy"
      text={messages.en}
    />,
  );
  expect(resting).toContain('Zeytin · Patiler dinleniyor');
  expect(resting).toContain('Smokinim yerinde');
  expect(hurt).toContain('Olive · A little comfort break');
  expect(hurt).toContain('portrait-bandage');
  expect(hungry).toContain('Olive · A milk break, please');
  expect(hungry).toContain('milk-symbol');
  expect(hungry).not.toContain('portrait-bandage');
});
