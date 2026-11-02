/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-case-study. Base block: cards.
 * Source: http://localhost:8811/ (comp-e MHTML snapshot), template "comp-e".
 * Instance selector: #stories ul._grid_n9mqh_10
 *
 * Block contract (blocks/cards-case-study/README.md + _cards-case-study.json):
 * container block, one row per story card, 2 cells:
 *   [ image (optional, field:image) |
 *     <h3><a href=story>title</a></h3><p>description</p><p><a href=story>Read more</a></p> (field:text) ]
 * The image area is an empty canvas placeholder in the snapshot (removed by
 * compe-cleanup), so the image cell is left empty (no hint) unless an <img> exists.
 *
 * Source DOM (block-context/cards-case-study/source.html + live DOM after compe-cleanup):
 *   li._tile_n9mqh_39                      card (x3; block-level, iterated)
 *     ._media_n9mqh_76 img (none here)     image
 *     h3._title_n9mqh_176 > a[href]        linked title (story URL)
 *     div._body_n9mqh_193                  description
 *     ._foot_n9mqh_210 ._cue_              "Read more" (span; href taken from the title link)
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
  const link = (href, t) => {
    const a = document.createElement('a');
    a.href = href || '#';
    a.textContent = t;
    return a;
  };

  let tiles = [...element.querySelectorAll(':scope > li[class*="_tile_"]')];
  if (!tiles.length) tiles = [...element.querySelectorAll(':scope > li')];

  const cells = [];
  tiles.forEach((tile) => {
    const img = tile.querySelector('[class*="_media_"] img, img');
    const image = img && img.getAttribute('src') ? hinted('image', [img]) : '';

    const nodes = [];
    const titleEl = tile.querySelector('h3, h2, h4');
    const titleLink = (titleEl && titleEl.querySelector('a[href]')) || tile.querySelector('a[href]');
    const href = titleLink ? titleLink.getAttribute('href') : '';
    const title = clean(titleEl && titleEl.textContent);
    if (title) {
      const h3 = document.createElement('h3');
      h3.append(href ? link(href, title) : document.createTextNode(title));
      nodes.push(h3);
    }
    const body = tile.querySelector('[class*="_body_"]');
    if (body) {
      const ps = [...body.querySelectorAll('p')];
      const texts = ps.length ? ps.map((p) => clean(p.textContent)) : [clean(body.textContent)];
      texts.filter(Boolean).forEach((t) => {
        const p = document.createElement('p');
        p.textContent = t;
        nodes.push(p);
      });
    }
    const foot = tile.querySelector('[class*="_foot_"]');
    const footLink = foot && foot.querySelector('a[href]');
    const ctaText = clean(foot && foot.textContent);
    if (ctaText) {
      const p = document.createElement('p');
      p.append(link(footLink ? footLink.getAttribute('href') : href, ctaText));
      nodes.push(p);
    }

    if (!image && !nodes.length) return;
    cells.push([image, hinted('text', nodes)]);
  });

  // Empty-block guard
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-case-study', cells });
  element.replaceWith(block);
}
