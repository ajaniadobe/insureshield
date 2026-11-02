import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Calculator (premium) -- "Estimated monthly premium" card.
 *
 * STUB: this block renders author-editable static content only (heading, result
 * text, input labels with their default values, disclaimer and CTA). No slider
 * maths or interactivity is implemented yet.
 *
 * Content contract -- one row per item, cells: [ type | label/content | value ]
 *   heading    | Estimated monthly premium            |
 *   result     | $135 – $190 /mo                      |
 *   input      | Average shipments a month            | 100
 *   disclaimer | This is an estimate. ...             |
 *   cta        | <a href="...">Get your pricing</a>   |
 * When the type cell is missing, the row type is inferred from its content.
 */

const ROW_TYPES = ['heading', 'result', 'input', 'disclaimer', 'cta'];

function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

/** Move a cell's content into a target element, unwrapping a lone <p>. */
function moveContent(cell, target) {
  if (!cell) return target;
  moveInstrumentation(cell, target);
  const only = cell.children.length === 1 ? cell.firstElementChild : null;
  const source = only && only.tagName === 'P' && cell.textContent.trim() === only.textContent.trim()
    ? only : cell;
  target.append(...source.childNodes);
  return target;
}

/**
 * Read a row into { type, cells }. The first cell holds the row type keyword;
 * when it is absent, infer the type from the row's shape and position.
 */
function readRow(row, seenInput) {
  const cells = [...row.children];
  const first = cellText(cells[0]).toLowerCase();
  if (ROW_TYPES.includes(first)) {
    return { type: first, cells: cells.slice(1) };
  }
  const filled = cells.filter((c) => c.textContent.trim() || c.querySelector('picture'));
  const link = row.querySelector('a');
  let type;
  if (filled.length >= 2) type = 'input';
  else if (link && cellText(row) === link.textContent.trim()) type = 'cta';
  else if (seenInput) type = 'disclaimer';
  else type = 'heading';
  return { type, cells: filled };
}

function parseNumber(value) {
  const n = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function buildInput(row, cells, index, blockId) {
  const [labelCell, valueCell] = cells;
  const id = `${blockId}-input-${index}`;

  const wrapper = document.createElement('div');
  wrapper.className = 'calculator-premium-input';
  moveInstrumentation(row, wrapper);

  const label = moveContent(labelCell, document.createElement('label'));
  label.className = 'calculator-premium-input-label';
  label.htmlFor = id;

  const value = moveContent(valueCell, document.createElement('output'));
  value.className = 'calculator-premium-input-value';
  value.htmlFor = id;
  const defaultValue = value.textContent.trim();

  // Placeholder slider: disabled until the interactive behaviour is specified.
  const range = document.createElement('input');
  range.type = 'range';
  range.id = id;
  range.className = 'calculator-premium-range';
  const num = parseNumber(defaultValue);
  range.min = '0';
  range.max = String(num > 0 ? num * 4 : 100);
  range.value = String(num);
  range.disabled = true;
  range.dataset.default = defaultValue;

  wrapper.append(label, value, range);
  return wrapper;
}

let instanceCount = 0;

export default function decorate(block) {
  instanceCount += 1;
  const blockId = `calculator-premium-${instanceCount}`;

  const header = document.createElement('div');
  header.className = 'calculator-premium-header';
  const inputs = document.createElement('div');
  inputs.className = 'calculator-premium-inputs';
  const footer = document.createElement('div');
  footer.className = 'calculator-premium-footer';

  let inputIndex = 0;
  [...block.children].forEach((row) => {
    const { type, cells } = readRow(row, inputIndex > 0);
    if (type === 'input') {
      inputIndex += 1;
      inputs.append(buildInput(row, cells, inputIndex, blockId));
      return;
    }

    const el = document.createElement('div');
    el.className = `calculator-premium-${type}`;
    moveInstrumentation(row, el);
    cells.forEach((cell) => {
      if (!cell.textContent.trim() && !cell.querySelector('picture')) return;
      const part = document.createElement('div');
      moveInstrumentation(cell, part);
      part.append(...cell.childNodes);
      el.append(part);
    });
    if (type === 'result') el.setAttribute('aria-live', 'polite');

    if (type === 'heading' || type === 'result') header.append(el);
    else footer.append(el);
  });

  block.textContent = '';
  block.append(header, inputs, footer);

  // TODO(calculator): interactive behaviour goes here. Once specified:
  //  - enable each `.calculator-premium-range`, set its real min/max/step,
  //  - update the matching `.calculator-premium-input-value` on `input`,
  //  - recompute and write the estimate into `.calculator-premium-result`.
}
