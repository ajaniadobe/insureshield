/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-stats. Base block: cards.
 * Source: http://localhost:8811/ (comp-e MHTML snapshot), template "comp-e".
 * Instance selector: #stats section._group_15dwb_6
 *
 * Block contract (blocks/cards-stats/README.md + _cards-stats.json):
 * container block, one row per stat item, 2 cells:
 *   [ image (field:image, alt collapsed into imageAlt) |
 *     <h3>title</h3><p>description</p><p>* footnote</p><p><a>Get pricing</a></p> (field:text) ]
 *
 * Source DOM (block-context/cards-stats/source.html + live DOM after compe-cleanup,
 * which converts the inline header SVG art to <img src="./images/...">):
 *   div._raised_15dwb_44 > article._card_15dwb_48     one per item (x3, structure.json)
 *     div._header_15dwb_76 img                        illustration
 *     h3._label_15dwb_148                             title
 *     p._body_15dwb_154                               description
 *     p._hoverNote_15dwb_166                          footnote
 *     ._foot_15dwb_193 button/a                       "Get pricing" (button, no href in source)
 * Iterates the block-level <article> (not inline/button nodes).
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

  // Image alts from the authoring analysis (source <img> alt is empty — the figure
  // is baked into the artwork). Fallback: the item title without the footnote marker.
  const ALT_BY_FILE = {
    'section-header-art-1c5de68bf2a9.png': '62M packages insured',
    'section-header-art-41f080a125d0.svg': '$132M claims paid',
    'section-header-art-b66fdb06d8ee.svg': '97% within 5 days',
  };

  let items = [...element.querySelectorAll('article[class*="_card_"]')];
  if (!items.length) items = [...element.querySelectorAll('article')];
  if (!items.length) items = [...element.querySelectorAll('[class*="_raised_15dwb_"]')];

  const cells = [];
  items.forEach((item) => {
    const titleEl = item.querySelector('h3, h2, h4');
    const title = clean(titleEl && titleEl.textContent);

    // image cell
    let image = '';
    const img = item.querySelector('[class*="_header_"] img, img');
    if (img && img.getAttribute('src')) {
      const file = img.getAttribute('src').split('/').pop();
      const alt = clean(img.getAttribute('alt')) || ALT_BY_FILE[file] || title.replace(/\*+$/, '').trim();
      img.setAttribute('alt', alt);
      image = hinted('image', [img]);
    }

    // text cell
    const textNodes = [];
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title;
      textNodes.push(h3);
    }
    item.querySelectorAll('p').forEach((p) => {
      const t = clean(p.textContent);
      if (!t) return;
      const np = document.createElement('p');
      np.textContent = t;
      textNodes.push(np);
    });
    const action = item.querySelector('[class*="_foot_"] a, [class*="_foot_"] button, a[href], button');
    if (action) {
      const labelEl = action.querySelector('[class*="_label_"]');
      const label = clean((labelEl || action).textContent);
      if (label) {
        const a = document.createElement('a');
        a.href = action.getAttribute('href') || '#';
        a.textContent = label;
        const p = document.createElement('p');
        p.append(a);
        textNodes.push(p);
      }
    }

    if (!image && !textNodes.length) return;
    cells.push([image, hinted('text', textNodes)]);
  });

  // Empty-block guard
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-stats', cells });
  element.replaceWith(block);
}
