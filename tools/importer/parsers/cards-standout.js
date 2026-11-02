/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-standout. Base block: cards.
 * Source: http://localhost:8811/ (comp-e MHTML snapshot), template "comp-e".
 * Instance selector: #standout div._grid_n9mqh_10
 *
 * Block contract (blocks/cards-standout/README.md + _cards-standout.json):
 * container block, one row per panel cell, 2 cells [ image | text ]:
 *   [ (empty)                | <h2>heading</h2> ]                  heading cell
 *   [ image (field:image)    | <h3>title</h3><p>description</p> ]  item cell (x3)
 * UE model cards-standout-item: image (reference), text (richtext).
 * The heading row keeps an EMPTY first cell so xwalk maps image, then text.
 *
 * Source DOM (block-context/cards-standout/source.html + live DOM after compe-cleanup):
 *   div._intro_n9mqh_334 > h2               heading
 *   ul._contents_n9mqh_341 > li._tile_n9mqh_39   items (x3, iterationSafe)
 *     ._media_n9mqh_76 img                  illustration (decorative, alt "")
 *     h3._title_n9mqh_176                   title
 *     div._body_n9mqh_193                   description (plain text in a div)
 * Generated: 2026-10-09
 */
export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const hinted = (field, nodes) => {
    const list = nodes.filter(Boolean);
    if (!list.length) return '';
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createComment(` field:${field} `));
    list.forEach((n) => frag.appendChild(n));
    return frag;
  };
  const make = (tag, text) => {
    const el = document.createElement(tag);
    el.textContent = text;
    return el;
  };

  const cells = [];

  // Heading row: [ empty | h2 ]
  const heading = element.querySelector('[class*="_intro_"] h2, :scope > h2, h2');
  const headingText = clean(heading && heading.textContent);
  if (headingText) cells.push(['', hinted('text', [make('h2', headingText)])]);

  // Item rows
  let tiles = [...element.querySelectorAll('li[class*="_tile_"]')];
  if (!tiles.length) tiles = [...element.querySelectorAll('ul > li')];
  tiles.forEach((tile) => {
    const img = tile.querySelector('[class*="_media_"] img, img');
    const image = img && img.getAttribute('src') ? hinted('image', [img]) : '';

    const titleEl = tile.querySelector('h3, h4, [class*="_title_"]');
    const title = clean(titleEl && titleEl.textContent);
    const bodyEl = tile.querySelector('[class*="_body_"]');
    const textNodes = [];
    if (title) textNodes.push(make('h3', title));
    if (bodyEl) {
      const ps = [...bodyEl.querySelectorAll('p')];
      if (ps.length) ps.forEach((p) => { const t = clean(p.textContent); if (t) textNodes.push(make('p', t)); });
      else if (clean(bodyEl.textContent)) textNodes.push(make('p', clean(bodyEl.textContent)));
    }
    if (!image && !textNodes.length) return;
    cells.push([image, hinted('text', textNodes)]);
  });

  // Empty-block guard
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-standout', cells });
  element.replaceWith(block);
}
