import test from 'node:test';
import assert from 'node:assert/strict';
import {extractSection, parsePlans} from '../../scripts/sources/fetch-goteborg-open-plans.mjs';

test('Göteborg open-plan section tolerates markup and entities inside headings', () => {
  const html = `
    <main>
      <h2>Planer <span>öppna</span> för&nbsp;synpunkter</h2>
      <article>
        <a href="/plan/example">Centrum - Exempel på detaljplan för blandstad</a>
        <p>Synpunkter tas emot till och med 2099-12-31</p>
        <p>Planen är ute på samråd.</p>
      </article>
      <h2>Byggs <em>just</em> nu</h2>
      <a href="/bygg/example">Detta ska inte ingå</a>
    </main>`;

  const section = extractSection(html);
  assert.match(section, /Centrum - Exempel/);
  assert.doesNotMatch(section, /Detta ska inte ingå/);

  const items = parsePlans(section, '2099-01-01');
  assert.equal(items.length, 1);
  assert.equal(items[0].deadline, '2099-12-31');
  assert.match(items[0].sourceUrl, /goteborg\\.se\\/plan\\/example/);
});

test('Göteborg open-plan section still accepts plain-text headings', () => {
  const html = '<h2>Planer öppna för synpunkter</h2><p>samråd</p><h2>Markanvisningar</h2>';
  const section = extractSection(html);
  assert.match(section, /Planer öppna för synpunkter/);
  assert.doesNotMatch(section, /Markanvisningar/);
});
