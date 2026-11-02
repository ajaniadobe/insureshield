/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion. Base block: accordion (existing project block).
 * Source: http://localhost:8811/ (comp-e MHTML snapshot), template "comp-e".
 * Instance selector: #faq div._faq_27cwx_203
 *
 * Block contract (blocks/accordion/README.md + _accordion.json, accordion-item model):
 * container block, one row per item, 2 cells:
 *   [ <!-- field:summary --> question | <!-- field:text --> <p>answer</p> ]
 * The snapshot only renders collapsed triggers — answer panels are not in the DOM —
 * so every answer is the placeholder "Answer to be supplied." unless a panel with
 * text is present.
 *
 * Source DOM (block-context/accordion/source.html + live DOM after compe-cleanup):
 *   div._disclosure_121oc_6._faqItem_27cwx_219        item (x8, block-level, iterated)
 *     h3 > button > span._label_121oc_52              question (read from the label span,
 *                                                    never iterating the inline <button>)
 *     [panel] #<aria-controls> / [role=region]        answer (absent in snapshot)
 * Generated: 2026-10-09
 */
export default function parse(element, { document }) {
  const PLACEHOLDER = 'Answer to be supplied.';
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const hinted = (field, nodes) => {
    const list = nodes.filter(Boolean);
    if (!list.length) return '';
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createComment(` field:${field} `));
    list.forEach((n) => frag.appendChild(n));
    return frag;
  };

  let items = [...element.querySelectorAll('[class*="_faqItem_"]')];
  if (!items.length) items = [...element.querySelectorAll('[class*="_disclosure_"]')];
  if (!items.length) items = [...element.querySelectorAll(':scope > div')];

  const cells = [];
  items.forEach((item) => {
    const labelEl = item.querySelector('[class*="_label_"]')
      || item.querySelector('h3, h2, h4')
      || item.querySelector('button');
    const question = clean(labelEl && labelEl.textContent);
    if (!question) return;

    // Answer panel, if rendered
    const trigger = item.querySelector('[aria-controls]');
    const panelId = trigger && trigger.getAttribute('aria-controls');
    let panel = panelId ? item.querySelector(`[id="${panelId}"]`) : null;
    if (!panel) panel = item.querySelector('[role="region"], [class*="_panel_"], [class*="_content_"]');
    const answerNodes = [];
    if (panel && clean(panel.textContent)) {
      const blocks = [...panel.querySelectorAll('p, ul, ol')].filter((n) => !n.parentElement.closest('p, ul, ol'));
      if (blocks.length) blocks.forEach((n) => answerNodes.push(n));
      else {
        const p = document.createElement('p');
        p.textContent = clean(panel.textContent);
        answerNodes.push(p);
      }
    } else {
      const p = document.createElement('p');
      p.textContent = PLACEHOLDER;
      answerNodes.push(p);
    }

    cells.push([
      hinted('summary', [document.createTextNode(question)]),
      hinted('text', answerNodes),
    ]);
  });

  // Empty-block guard
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
