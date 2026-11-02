/* eslint-disable */
/* global WebImporter */
/**
 * Parser for checklist. Base block: checklist (existing project block).
 * Source: http://localhost:8811/ (comp-e MHTML snapshot), template "comp-e".
 * Instance selector: #main > section._section_cwncx_50:not([id]) div._split_27cwx_416
 *
 * Block contract (blocks/checklist/README.md + _checklist.json):
 * simple block, model "checklist" fields: classes (skipped — default, no "swap"),
 * image (reference), text (richtext) -> one row per field, one cell each:
 *   row 1: <!-- field:image --> illustration
 *   row 2: <!-- field:text --> <h2>…</h2><ul><li><strong>title</strong> description</li>×4</ul>
 *          <p><a href="#solutions">Explore coverage options</a></p>
 *
 * Source DOM (block-context/checklist/source.html + live DOM after compe-cleanup):
 *   div._splitMedia_27cwx_428 img                    illustration
 *   div._splitCopy_27cwx_433 h2                      heading
 *   ul > li._item_1m043_15                           check items (x4)
 *     span._benefitTitle_27cwx_445 + sibling span    title + description
 *   button / a ("Explore coverage options")          CTA (button, no href -> #solutions)
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

  // image
  const img = element.querySelector('[class*="_splitMedia_"] img, img');

  // text: heading + checklist + CTA
  const copy = element.querySelector('[class*="_splitCopy_"]') || element;
  const textNodes = [];
  const headingEl = copy.querySelector('h2, h1, h3');
  if (headingEl && clean(headingEl.textContent)) {
    const h2 = document.createElement('h2');
    h2.textContent = clean(headingEl.textContent);
    textNodes.push(h2);
  }

  const items = [...copy.querySelectorAll('ul > li')];
  if (items.length) {
    const ul = document.createElement('ul');
    items.forEach((li) => {
      const titleEl = li.querySelector('[class*="_benefitTitle_"], strong, b');
      const title = clean(titleEl && titleEl.textContent);
      const full = clean(li.textContent);
      const desc = title && full.startsWith(title) ? clean(full.slice(title.length)) : (title ? '' : full);
      const nli = document.createElement('li');
      if (title) {
        const strong = document.createElement('strong');
        strong.textContent = title;
        nli.append(strong);
        if (desc) nli.append(document.createTextNode(` ${desc}`));
      } else {
        nli.textContent = desc;
      }
      if (clean(nli.textContent)) ul.append(nli);
    });
    if (ul.children.length) textNodes.push(ul);
  }

  const ctaEl = copy.querySelector('a[href], button');
  if (ctaEl) {
    const labelEl = ctaEl.querySelector('[class*="_label_"]');
    const label = clean((labelEl || ctaEl).textContent);
    if (label) {
      const a = document.createElement('a');
      a.href = ctaEl.getAttribute('href') || '#solutions';
      a.textContent = label;
      const p = document.createElement('p');
      p.append(a);
      textNodes.push(p);
    }
  }

  // Empty-block guard
  if (!img && !textNodes.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [
    [img ? hinted('image', [img]) : ''],
    [hinted('text', textNodes)],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'checklist', cells });
  element.replaceWith(block);
}
