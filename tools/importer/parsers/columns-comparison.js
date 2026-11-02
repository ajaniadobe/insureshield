/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-comparison. Base block: columns.
 * Source: http://localhost:8811/ (comp-e MHTML snapshot), template "comp-e".
 * Instance selector: #difference ul._grid_n9mqh_10
 *
 * Block contract (blocks/columns-comparison/README.md + columns-comparison.js):
 * columns block (xwalk columns model: columns=3, rows=5) — NO field hints (columns
 * blocks hold default content only). Every row has 3 cells:
 *   [ <h2>What’s covered?</h2> | <h3>Carrier liability</h3> | <h3>Shipping insurance</h3> ]  header
 *   [ <img> + <h3>topic</h3>   | <p>carrier text</p>         | <p>insurance text</p> ]      x4
 * The per-cell mobile labels (span._answerTag_) duplicate the header and are NOT
 * authored — the decorator derives them from the header row.
 *
 * Source DOM (block-context/columns-comparison/source.html + live DOM after compe-cleanup):
 *   li._fullRowNarrow_ > ._headCell_ h2              title cell
 *   li._wideOnly_ h3 (x2)                            column headers
 *   li._fullRowNarrow_ > ._areaCell_ img + h3        topic cell (x4)
 *   li._answersSpan_ ._answer_ (x2)                  value cells: ._vsCarrier_ / ._vsOurs_
 * Rows are rebuilt by pairing each topic tile with the following answers tile.
 * Generated: 2026-10-09
 */
export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const make = (tag, t) => {
    const el = document.createElement(tag);
    el.textContent = t;
    return el;
  };

  let tiles = [...element.querySelectorAll(':scope > li')];
  if (!tiles.length) tiles = [...element.querySelectorAll('li[class*="_tile_"]')];

  const cells = [];
  const header = [];
  let current = null;

  tiles.forEach((tile) => {
    const headCell = tile.querySelector('[class*="_headCell_"]');
    const area = tile.querySelector('[class*="_areaCell_"]');
    const answers = [...tile.querySelectorAll('[class*="_answer_"]')]
      .filter((a) => !a.querySelector('[class*="_answer_"]'));

    if (headCell) {
      const h = headCell.querySelector('h2, h1, h3');
      header.push(make('h2', clean((h || headCell).textContent)));
      return;
    }
    if (area) {
      const topic = [];
      const img = area.querySelector('img');
      if (img && img.getAttribute('src')) {
        const p = document.createElement('p');
        p.append(img);
        topic.push(p);
      }
      const h = area.querySelector('h3, h4, h2');
      if (h && clean(h.textContent)) topic.push(make('h3', clean(h.textContent)));
      current = [topic, '', ''];
      cells.push(current);
      return;
    }
    if (answers.length) {
      const values = answers.map((ans) => {
        const valueEl = ans.querySelector('[class*="_vsCarrier_"], [class*="_vsOurs_"]');
        if (valueEl) return clean(valueEl.textContent);
        const tag = ans.querySelector('[class*="_answerTag_"]');
        const full = clean(ans.textContent);
        const tagText = clean(tag && tag.textContent);
        return tagText && full.startsWith(tagText) ? clean(full.slice(tagText.length)) : full;
      });
      if (!current) {
        current = ['', '', ''];
        cells.push(current);
      }
      values.slice(0, 2).forEach((v, i) => { current[i + 1] = v ? make('p', v) : ''; });
      current = null;
      return;
    }
    // Column header tile (h3 only)
    const h = tile.querySelector('h3, h2, h4');
    if (h && clean(h.textContent)) header.push(make('h3', clean(h.textContent)));
  });

  if (header.length) {
    while (header.length < 3) header.push('');
    cells.unshift(header.slice(0, 3));
  }

  // Empty-block guard
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-comparison', cells });
  element.replaceWith(block);
}
