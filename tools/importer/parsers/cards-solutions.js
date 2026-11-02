/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-solutions. Base block: cards (existing project block).
 * Source: http://localhost:8811/ (comp-e MHTML snapshot), template "comp-e".
 * Instance selector: #solutions div._grid_n9mqh_10
 *
 * Block contract (blocks/cards-solutions/cards-solutions.js classifies rows by content;
 * _cards-solutions.json item model: image (reference), text (richtext)).
 * Every row has 2 cells [ image | text ]; text-only rows keep an EMPTY image cell so
 * xwalk field mapping stays image, then text:
 *   [ (empty)      | <h2>Our solutions</h2><p>intro</p> ]                     intro
 *   [ (empty)      | <h3>Direct integrations</h3> ]                            label
 *   [ logo img     | (empty) ]  x5 (alt = logo name)                           logo tiles
 *   [ illustration | <h3>title</h3><p>desc</p><ul><li>tag</li>…</ul>
 *                    <p><a href="#">Get a quote</a></p> ]  x4                  product cards
 *
 * Source DOM (block-context/cards-solutions/source.html + live DOM after compe-cleanup,
 * which turns CSS-mask logos and inline SVG art into <img>):
 *   div._intro_n9mqh_334 h2 (visually hidden) + p._solutionsLead_27cwx_307
 *   ul._contents_n9mqh_341 > li._tile_n9mqh_39
 *     [bleed tile] ul._grid_ > li._labelCell_ h3 | li._logoCell_ img[alt]
 *     [card tile]  ._media_ img, h3 (button, no href), ._body_, ul._tags_ li, ._cue_ "Get a quote"
 * Iterates block-level <li> tiles; logo names come from img alt / hidden span, never
 * from the inline <button>.
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
  const linkPara = (href, text) => {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = href || '#';
    a.textContent = text;
    p.append(a);
    return p;
  };

  const cells = [];

  // 1. Intro row: [ empty | h2 + lead ]
  const intro = element.querySelector(':scope > [class*="_intro_"]');
  if (intro) {
    const nodes = [];
    const h = intro.querySelector('h2, h1');
    if (h && clean(h.textContent)) nodes.push(make('h2', clean(h.textContent)));
    intro.querySelectorAll('p').forEach((p) => { if (clean(p.textContent)) nodes.push(make('p', clean(p.textContent))); });
    if (nodes.length) cells.push(['', hinted('text', nodes)]);
  }

  // 2. Tiles
  let tiles = [...element.querySelectorAll(':scope > ul[class*="_contents_"] > li')];
  if (!tiles.length) tiles = [...element.querySelectorAll(':scope > ul > li')];

  tiles.forEach((tile) => {
    const nested = [...tile.querySelectorAll(':scope > ul > li')];
    if (nested.length) {
      // Integrations group: label cell + logo cells
      nested.forEach((cellLi) => {
        const img = cellLi.querySelector('img');
        if (img && img.getAttribute('src')) {
          const hidden = cellLi.querySelector('[class*="_root_1fklp_"]');
          const name = clean(img.getAttribute('alt')) || clean(hidden && hidden.textContent) || clean(cellLi.textContent);
          img.setAttribute('alt', name);
          cells.push([hinted('image', [img]), '']);
          return;
        }
        const label = clean(cellLi.textContent);
        if (label) cells.push(['', hinted('text', [make('h3', label)])]);
      });
      return;
    }

    // Product card
    const img = tile.querySelector('[class*="_media_"] img, img');
    const image = img && img.getAttribute('src') ? hinted('image', [img]) : '';
    const nodes = [];
    const titleEl = tile.querySelector('h3, h2, h4');
    const title = clean(titleEl && titleEl.textContent);
    const titleLink = titleEl && titleEl.querySelector('a[href]');
    if (title) {
      const h3 = document.createElement('h3');
      if (titleLink) {
        const a = make('a', title);
        a.href = titleLink.getAttribute('href');
        h3.append(a);
      } else {
        h3.textContent = title;
      }
      nodes.push(h3);
    }
    const body = tile.querySelector('[class*="_body_"]');
    if (body && clean(body.textContent)) nodes.push(make('p', clean(body.textContent)));
    const tags = [...tile.querySelectorAll('ul[class*="_tags_"] > li, [class*="_extra_"] li')]
      .filter((li, i, arr) => arr.indexOf(li) === i);
    if (tags.length) {
      const ul = document.createElement('ul');
      tags.forEach((li) => { if (clean(li.textContent)) ul.append(make('li', clean(li.textContent))); });
      if (ul.children.length) nodes.push(ul);
    }
    const foot = tile.querySelector('[class*="_foot_"]');
    const ctaLink = (foot && foot.querySelector('a[href]')) || tile.querySelector(':scope a[href]');
    const ctaText = clean((ctaLink || foot || {}).textContent);
    if (ctaText) nodes.push(linkPara(ctaLink ? ctaLink.getAttribute('href') : (titleLink && titleLink.getAttribute('href')), ctaText));

    if (!image && !nodes.length) return;
    cells.push([image, hinted('text', nodes)]);
  });

  // Empty-block guard
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-solutions', cells });
  element.replaceWith(block);
}
