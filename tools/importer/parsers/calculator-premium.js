/* eslint-disable */
/* global WebImporter */
/**
 * Parser for calculator-premium. Base block: calculator (custom, STUB).
 * Source: http://localhost:8811/ (comp-e MHTML snapshot), template "comp-e".
 * Instance selector: #hero-section section._estimate_fyex6_5
 *
 * Block contract (blocks/calculator-premium/README.md + _calculator-premium.json):
 * container block, one row per item, 3 cells [ type | label | value ]
 *   heading    | Estimated monthly premium              |
 *   result     | $135 – $190 /mo                        |
 *   input      | <label text>                           | <default value>
 *   disclaimer | This is an estimate. ...               |
 *   cta        | <a href="...">Get your pricing</a>     |
 * UE model calculator-premium-row: type (select), label (richtext), value (text).
 *
 * Source DOM (validated against block-context/calculator-premium/source.html and
 * the live DOM after compe-cleanup):
 *   h2._label_fyex6_30                       heading
 *   p._figure_fyex6_36 (spans + ._unit_)     result range
 *   div._slider_fd9tn_7  > label + output    inputs (x3; iterated on the block-level
 *                                            slider group, not on inline nodes)
 *   p._note_fyex6_102                        disclaimer
 *   div._action_fyex6_108 a[href]            CTA
 * Generated: 2026-10-09
 */
export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

  // Cell with a field hint before the content; empty cell (no hint) when no content.
  const cell = (field, content) => {
    if (!content) return '';
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createComment(` field:${field} `));
    frag.appendChild(content);
    return frag;
  };
  const typeCell = (type) => cell('type', document.createTextNode(type));
  const para = (text) => {
    const p = document.createElement('p');
    p.textContent = text;
    return p;
  };

  const cells = [];

  // heading
  const headingEl = element.querySelector('[class*="_result_"] h2, [class*="_result_"] h3, h2, h3');
  const headingText = clean(headingEl && headingEl.textContent);
  if (headingText) {
    const h = document.createElement('h2');
    h.textContent = headingText;
    cells.push([typeCell('heading'), cell('label', h), '']);
  }

  // result: "$135 – $190 /mo"
  const figure = element.querySelector('p[class*="_figure_"], [class*="_result_"] p');
  if (figure) {
    const unitEl = figure.querySelector('[class*="_unit_"]');
    const unit = clean(unitEl && unitEl.textContent);
    const rangeHost = figure.querySelector('button') || figure;
    // Read every child node: the importer unwraps attribute-less <span>s into
    // bare text nodes before parsing, leaving only the dash as an element.
    const parts = [...rangeHost.childNodes]
      .filter((n) => n !== unitEl)
      .map((n) => clean(n.textContent))
      .filter(Boolean);
    let range = parts.length ? parts.join(' ') : clean(rangeHost.textContent);
    if (unit && range.endsWith(unit)) range = clean(range.slice(0, -unit.length));
    const resultText = clean(`${range} ${unit}`);
    if (resultText) cells.push([typeCell('result'), cell('label', para(resultText)), '']);
  }

  // inputs: label + default value per slider group
  let sliders = [...element.querySelectorAll('[class*="_slider_"][role="group"]')];
  if (!sliders.length) sliders = [...element.querySelectorAll('[role="group"]')];
  sliders.forEach((slider) => {
    const label = clean((slider.querySelector('label') || {}).textContent);
    const outputEl = slider.querySelector('output');
    const rangeInput = slider.querySelector('input[type="range"]');
    const value = clean(outputEl ? outputEl.textContent
      : (rangeInput && (rangeInput.getAttribute('aria-valuetext') || rangeInput.value)));
    if (!label && !value) return;
    cells.push([
      typeCell('input'),
      label ? cell('label', para(label)) : '',
      value ? cell('value', document.createTextNode(value)) : '',
    ]);
  });

  // disclaimer
  const note = element.querySelector('p[class*="_note_"]');
  const noteText = clean(note && note.textContent);
  if (noteText) cells.push([typeCell('disclaimer'), cell('label', para(noteText)), '']);

  // cta
  const ctaEl = element.querySelector('[class*="_action_"] a[href], a[data-variant="primary"][href], a[href]');
  if (ctaEl) {
    const labelEl = ctaEl.querySelector('[class*="_label_"]');
    const a = document.createElement('a');
    a.href = ctaEl.getAttribute('href');
    a.textContent = clean((labelEl || ctaEl).textContent);
    const p = document.createElement('p');
    p.append(a);
    cells.push([typeCell('cta'), cell('label', p), '']);
  }

  // Empty-block guard
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'calculator-premium', cells });
  element.replaceWith(block);
}
