import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Calculator (impact) -- "Estimate your business impact" two-pane panel.
 *
 * STUB: this block renders author-editable static content only (intro, input
 * labels with default values, result labels/values, legend, summary,
 * disclaimer, CTA + note). No slider maths, cube visualisation or other
 * interactivity is implemented yet.
 *
 * Content contract -- one row per item, cells: [ type | label/content | value ]
 *   intro      | <h2>Estimate your business impact</h2><p>...</p> |
 *   input      | Shipments per month                              | 500
 *   result     | needed to recover losses                         | $48,000   (first = headline)
 *   result     | Packages lost a year                             | 120
 *   legend     | One cube = 10 shipments                          |
 *   summary    | Every lost package costs 4 new sales.            |
 *   disclaimer | Results are estimates only ...                   |
 *   cta        | <a href="...">Get your pricing</a>               | Many businesses pay ...
 * The type cell is required to tell input rows from result rows; without it,
 * two-cell rows are treated as inputs and the rest is inferred from content.
 *
 * Left pane: intro + inputs. Right pane: results, legend, summary,
 * disclaimer, CTA.
 */

const ROW_TYPES = ['intro', 'input', 'result', 'legend', 'summary', 'disclaimer', 'cta'];

function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

function isEmpty(cell) {
  return !cell || (!cell.textContent.trim() && !cell.querySelector('picture'));
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

function readRow(row) {
  const cells = [...row.children];
  const first = cellText(cells[0]).toLowerCase();
  if (ROW_TYPES.includes(first)) {
    return { type: first, cells: cells.slice(1) };
  }
  const filled = cells.filter((c) => !isEmpty(c));
  let type;
  if (row.querySelector('a')) type = 'cta';
  else if (row.querySelector('h1, h2, h3, h4, h5, h6')) type = 'intro';
  else if (filled.length >= 2) type = 'input';
  else type = 'disclaimer';
  return { type, cells: filled };
}

function parseNumber(value) {
  const n = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function buildInput(row, [labelCell, valueCell], id) {
  const wrapper = document.createElement('div');
  wrapper.className = 'calculator-impact-input';
  moveInstrumentation(row, wrapper);

  const label = moveContent(labelCell, document.createElement('label'));
  label.className = 'calculator-impact-input-label';
  label.htmlFor = id;

  const value = moveContent(valueCell, document.createElement('output'));
  value.className = 'calculator-impact-input-value';
  value.htmlFor = id;
  const defaultValue = value.textContent.trim();

  // Placeholder slider: disabled until the interactive behaviour is specified.
  const range = document.createElement('input');
  range.type = 'range';
  range.id = id;
  range.className = 'calculator-impact-range';
  const num = parseNumber(defaultValue);
  range.min = '0';
  range.max = String(num > 0 ? num * 4 : 100);
  range.value = String(num);
  range.disabled = true;
  range.dataset.default = defaultValue;

  wrapper.append(label, value, range);
  return wrapper;
}

function buildResult(row, [labelCell, valueCell], primary) {
  const wrapper = document.createElement('div');
  wrapper.className = primary
    ? 'calculator-impact-result calculator-impact-result-primary'
    : 'calculator-impact-result';
  moveInstrumentation(row, wrapper);

  const value = moveContent(valueCell, document.createElement('output'));
  value.className = 'calculator-impact-result-value';
  const label = moveContent(labelCell, document.createElement('span'));
  label.className = 'calculator-impact-result-label';

  if (primary) {
    // headline reads "<value> <label>", e.g. "$48,000 needed to recover losses"
    wrapper.append(value, label);
  } else {
    wrapper.append(label, value);
    // Placeholder for the generated cube visualisation (not authored).
    const viz = document.createElement('div');
    viz.className = 'calculator-impact-viz';
    viz.setAttribute('aria-hidden', 'true');
    wrapper.append(viz);
  }
  return wrapper;
}

function buildGeneric(row, type, cells) {
  const el = document.createElement('div');
  el.className = `calculator-impact-${type}`;
  moveInstrumentation(row, el);
  cells.forEach((cell) => {
    if (isEmpty(cell)) return;
    const part = document.createElement('div');
    moveInstrumentation(cell, part);
    part.append(...cell.childNodes);
    el.append(part);
  });
  return el;
}

let instanceCount = 0;

export default function decorate(block) {
  instanceCount += 1;
  const blockId = `calculator-impact-${instanceCount}`;

  const inputsPane = document.createElement('div');
  inputsPane.className = 'calculator-impact-inputs';
  const resultsPane = document.createElement('div');
  resultsPane.className = 'calculator-impact-results';
  resultsPane.setAttribute('aria-live', 'polite');

  let inputIndex = 0;
  let resultIndex = 0;
  [...block.children].forEach((row) => {
    const { type, cells } = readRow(row);
    if (type === 'input') {
      inputIndex += 1;
      inputsPane.append(buildInput(row, cells, `${blockId}-input-${inputIndex}`));
    } else if (type === 'result') {
      resultIndex += 1;
      resultsPane.append(buildResult(row, cells, resultIndex === 1));
    } else if (type === 'intro') {
      inputsPane.append(buildGeneric(row, type, cells));
    } else {
      resultsPane.append(buildGeneric(row, type, cells));
    }
  });

  block.textContent = '';
  block.append(inputsPane, resultsPane);

  // TODO(calculator): interactive behaviour goes here. Once specified:
  //  - enable each `.calculator-impact-range`, set its real min/max/step,
  //  - update the matching `.calculator-impact-input-value` on `input`,
  //  - recompute every `.calculator-impact-result-value` and the summary,
  //  - render the cubes into each `.calculator-impact-viz` (scale per legend).
}
