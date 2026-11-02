import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Calculator (premium) -- shipping insurance premium estimator, matching the
 * insureshield.com shipping-insurance hero.
 *
 * 1. Per-package card (on the page): a package-value range slider over a
 *    histogram. Estimate = package value x rate / 100, at the low and high rate.
 * 2. Monthly estimate (side sheet opened by the card's CTA): package value and
 *    shipments-a-week range sliders. Estimate =
 *    shipments a week x 52 / 12 x package value x rate / 100.
 *    The sheet's package value starts from the card's range each time it opens.
 *
 * Content contract -- one row per item, cells: [ type | label/content | value ]
 *   heading          | <h2>What’s your average package value?</h2>      |
 *   value            | Package value                                    | $100 – $1,000
 *   result           | Estimated premium per package                    |
 *   cta              | Estimate monthly premium                         |
 *   disclaimer       | Estimate only. Actual pricing ...                |
 *   rates            | Rate per $100 of value                           | 0.80 – 1.05
 *   quote-heading    | Estimate monthly premium                         |
 *   quote-value      | Typical package value                            |
 *   quote-volume     | Shipments a week                                 | 50 – 250
 *   quote-result     | Estimated monthly premium                        |
 *   quote-disclaimer | A range ..., at {low} to {high} per $100 of value. |
 *   quote-cta        | <a href="...">Get your pricing</a>               |
 * Value cells hold "low – high" ranges, snapped to the nearest slider stop.
 * {low} / {high} in the quote disclaimer are replaced with the rates.
 * Without quote-* rows the CTA cell is rendered as-is (e.g. a plain link).
 */

const ROW_TYPES = [
  'heading', 'value', 'result', 'cta', 'disclaimer', 'rates',
  'quote-heading', 'quote-value', 'quote-volume', 'quote-result', 'quote-disclaimer', 'quote-cta',
];

// slider stops and defaults from the live site
const VALUE_STOPS = [
  50, 100, 150, 200, 300, 400, 500, 750, 1000, 1500, 2000,
  3000, 4000, 5000, 7500, 10000, 15000, 20000, 30000, 40000, 50000,
];
const VOLUME_STOPS = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
const DEFAULT_VALUE = [100, 1000];
const DEFAULT_VOLUME = [50, 250];
const DEFAULT_RATES = [0.8, 1.05];
const WEEKS_PER_MONTH = 52 / 12;
// decorative histogram behind the package-value slider, one bar per stop
const HISTOGRAM = VALUE_STOPS.map((_, i) => i + 2);
const ANNOUNCE_DELAY = 500;
const SLIDER_HINT = 'Handles can pass one another. Drag the selected band to move the whole range. Focus it and use arrow keys, Page Up or Page Down, Home or End.';

const ICONS = {
  info: '<svg class="calculator-premium-note-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" stroke-width="1.25"/><path d="M8 7.25v4M8 4.75v.01" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  arrow: '<svg class="calculator-premium-open-icon" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false"><path d="M4 10h11.5M11 5.5l4.5 4.5-4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  close: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
};

const usd = (digits) => new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', minimumFractionDigits: digits, maximumFractionDigits: digits,
});
const money0 = usd(0).format;
const money2 = usd(2).format;
const count = new Intl.NumberFormat('en-US').format;

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

/** Parse "low – high" into two numbers; a single number is used for both. */
function parseRange(text, fallback) {
  const nums = (text.match(/\d[\d,]*(?:\.\d+)?|\.\d+/g) || [])
    .map((s) => parseFloat(s.replace(/,/g, '')))
    .filter(Number.isFinite);
  if (!nums.length) return fallback;
  return [nums[0], nums[1] ?? nums[0]];
}

function nearestIndex(stops, n) {
  return stops.reduce((best, s, i) => (Math.abs(s - n) < Math.abs(stops[best] - n) ? i : best), 0);
}

/** Move a cell's inline content into target, unwrapping a lone <p> or heading. */
function moveContent(entry, target) {
  if (!entry) return target;
  moveInstrumentation(entry.row, target);
  const { label } = entry;
  const only = label.children.length === 1 ? label.firstElementChild : null;
  const source = only && /^(P|H[1-6])$/.test(only.tagName) ? only : label;
  target.append(...source.childNodes);
  return target;
}

/** Visually-hidden polite live region that announces a value after a pause. */
function createAnnouncer() {
  const region = el('div', 'calculator-premium-sr-only', { 'aria-live': 'polite' });
  let timer;
  let last = '';
  return {
    element: region,
    announce(text) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (text === last) return;
        last = text;
        region.textContent = text;
      }, ANNOUNCE_DELAY);
    },
    reset(text) {
      clearTimeout(timer);
      last = text;
    },
  };
}

let sliderCount = 0;

/**
 * Two-thumb range slider over a list of stops. Thumbs can pass one another,
 * the band between them drags the whole range, and every part is keyboard
 * operable (arrows, Page Up/Down, Home/End).
 */
function createRangeSlider({
  label, stops, start, format, openEnded = false, size = 'md', labelHidden = false,
  onChange = () => {},
}) {
  sliderCount += 1;
  const id = `calculator-premium-slider-${sliderCount}`;
  const last = stops.length - 1;
  const bigStep = Math.max(1, Math.round(last / 10));
  const thumbs = start.map((v) => nearestIndex(stops, v));

  const range = () => [Math.min(...thumbs), Math.max(...thumbs)];
  const valueText = (i) => `${format(stops[i])}${openEnded && i === last ? '+' : ''}`;
  const rangeText = ([lo, hi]) => `${format(stops[lo])} to ${valueText(hi)}`;

  const root = el('div', 'calculator-premium-slider', {
    role: 'group', 'aria-labelledby': `${id}-label`, 'data-size': size,
  });
  if (labelHidden) root.dataset.readout = 'alone';

  const head = el('div', 'calculator-premium-slider-head');
  const labelEl = el('span', `calculator-premium-slider-label${labelHidden ? ' calculator-premium-sr-only' : ''}`, { id: `${id}-label` });
  labelEl.textContent = label;
  const readout = el('output', 'calculator-premium-slider-readout calculator-premium-stable');
  const reserve = el('span', 'calculator-premium-reserve', { 'aria-hidden': 'true' });
  reserve.textContent = rangeText([last, last]);
  const current = el('span');
  readout.append(reserve, current);
  head.append(labelEl, readout);

  const hint = el('span', 'calculator-premium-sr-only', { id: `${id}-hint` });
  hint.textContent = SLIDER_HINT;

  const track = el('div', 'calculator-premium-slider-track');
  const railStart = el('span', 'calculator-premium-slider-rail', { 'data-side': 'start', 'aria-hidden': 'true' });
  const railEnd = el('span', 'calculator-premium-slider-rail', { 'data-side': 'end', 'aria-hidden': 'true' });
  const fill = el('button', 'calculator-premium-slider-fill', { type: 'button', 'aria-describedby': hint.id });
  const thumbEls = thumbs.map(() => {
    const thumb = el('div', 'calculator-premium-slider-thumb', {
      role: 'slider',
      tabindex: '0',
      'aria-valuemin': '0',
      'aria-valuemax': String(last),
      'aria-orientation': 'horizontal',
      'aria-describedby': hint.id,
    });
    thumb.append(el('span', 'calculator-premium-slider-bubble', { 'aria-hidden': 'true' }));
    return thumb;
  });
  track.append(railStart, railEnd, fill, ...thumbEls);
  root.append(head, hint, track);

  function render() {
    const [lo, hi] = range();
    const text = rangeText([lo, hi]);
    track.style.setProperty('--rs-start', String(lo / last));
    track.style.setProperty('--rs-end', String(hi / last));
    current.textContent = text;
    fill.setAttribute('aria-label', `Move entire ${label.toLowerCase()} range: ${text}`);
    fill.disabled = lo === hi;
    thumbEls.forEach((thumb, i) => {
      const v = thumbs[i];
      const other = thumbs[1 - i];
      const isMin = v < other || (v === other && i === 0);
      thumb.style.setProperty('--rs-pos', String(v / last));
      thumb.setAttribute('aria-label', `${isMin ? 'Minimum' : 'Maximum'} ${label}`);
      thumb.setAttribute('aria-valuenow', String(v));
      thumb.setAttribute('aria-valuetext', valueText(v));
      thumb.firstElementChild.textContent = valueText(v);
    });
  }

  function set(next, notify = true) {
    const clamped = next.map((v) => clamp(v, 0, last));
    const changed = clamped.some((v, i) => v !== thumbs[i]);
    clamped.forEach((v, i) => { thumbs[i] = v; });
    render();
    if (changed && notify) onChange(range());
  }

  // move both thumbs by delta stops, keeping the band inside the track
  function shifted(from, delta) {
    const d = clamp(delta, -Math.min(...from), last - Math.max(...from));
    return from.map((v) => v + d);
  }

  /** Pointer drag measured from where it started, in whole stops. */
  function startDrag(e, target, apply) {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    target.focus({ preventScroll: true });
    target.setPointerCapture(e.pointerId);
    target.dataset.dragging = '';
    const { width } = track.getBoundingClientRect();
    const startX = e.clientX;
    const from = [...thumbs];
    const move = (ev) => {
      if (!width) return;
      apply(from, Math.round(((ev.clientX - startX) / width) * last));
    };
    const end = () => {
      delete target.dataset.dragging;
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', end);
      target.removeEventListener('pointercancel', end);
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', end);
    target.addEventListener('pointercancel', end);
  }

  thumbEls.forEach((thumb, i) => {
    thumb.addEventListener('pointerdown', (e) => startDrag(e, thumb, (from, delta) => {
      const next = [...thumbs];
      next[i] = from[i] + delta;
      set(next);
    }));
    thumb.addEventListener('keydown', (e) => {
      const v = thumbs[i];
      const to = {
        ArrowRight: v + 1,
        ArrowUp: v + 1,
        ArrowLeft: v - 1,
        ArrowDown: v - 1,
        PageUp: v + bigStep,
        PageDown: v - bigStep,
        Home: 0,
        End: last,
      }[e.key];
      if (to === undefined) return;
      e.preventDefault();
      const next = [...thumbs];
      next[i] = to;
      set(next);
    });
  });

  fill.addEventListener('pointerdown', (e) => {
    if (fill.disabled) return;
    startDrag(e, fill, (from, delta) => set(shifted(from, delta)));
  });
  fill.addEventListener('keydown', (e) => {
    const [lo, hi] = range();
    const delta = {
      ArrowRight: 1,
      ArrowUp: 1,
      ArrowLeft: -1,
      ArrowDown: -1,
      PageUp: bigStep,
      PageDown: -bigStep,
      Home: -lo,
      End: last - hi,
    }[e.key];
    if (delta === undefined) return;
    e.preventDefault();
    set(shifted(thumbs, delta));
  });

  render();

  return {
    element: root,
    /** current [low, high] stop indices */
    range,
    /** current [low, high] stop values */
    values: () => range().map((i) => stops[i]),
    isOpenEnded: () => openEnded && range()[1] === last,
    setRange(indices, notify = true) { set(indices, notify); },
  };
}

function buildHistogram(bins) {
  const max = Math.max(1, ...bins);
  const histogram = el('div', 'calculator-premium-histogram', { 'aria-hidden': 'true' });
  const bars = bins.map((bin, i) => {
    const bar = el('span', 'calculator-premium-histogram-bar');
    bar.style.setProperty('--rh-h', String(bin / max));
    bar.style.setProperty('--rh-i', String(i));
    return bar;
  });
  histogram.append(...bars);
  return {
    element: histogram,
    update([lo, hi]) {
      bars.forEach((bar, i) => { bar.toggleAttribute('data-in-range', i >= lo && i <= hi); });
    },
  };
}

/** Result label + figure; the figure reserves room for its widest value. */
function buildResult(className, labelText, widest, labelId) {
  const result = el('div', className, { role: 'group', 'aria-labelledby': labelId });
  const label = el('span', `${className}-label`, { id: labelId });
  label.textContent = labelText;
  const figure = el('span', `${className}-figure calculator-premium-stable`);
  const reserve = el('span', 'calculator-premium-reserve', { 'aria-hidden': 'true' });
  reserve.textContent = widest;
  const current = el('span');
  figure.append(reserve, current);
  result.append(label, figure);
  return { element: result, set(text) { current.textContent = text; } };
}

function buildNote(entry, className) {
  const note = el('p', className);
  if (!entry) return note;
  const text = moveContent(entry, el('span'));
  note.innerHTML = ICONS.info;
  note.append(text);
  return note;
}

/** Side sheet with the monthly premium estimate. */
function buildQuoteSheet({
  blockId, rows, rates, valueLabel,
}) {
  const titleId = `${blockId}-quote-title`;
  const dialog = el('dialog', 'calculator-premium-sheet', { 'aria-labelledby': titleId });
  const panel = el('div', 'calculator-premium-sheet-panel');

  const header = el('div', 'calculator-premium-sheet-header');
  const title = moveContent(rows['quote-heading'], el('h2', 'calculator-premium-sheet-title', { id: titleId }));
  if (!title.textContent.trim()) title.textContent = 'Estimate monthly premium';
  const close = el('button', 'calculator-premium-sheet-close', { type: 'button', 'aria-label': 'Close' });
  close.innerHTML = ICONS.close;
  header.append(title, close);

  const resultLabel = cellText(rows['quote-result']?.label) || 'Estimated monthly premium';
  const announcer = createAnnouncer();
  const result = buildResult('calculator-premium-quote-result', resultLabel, '', `${blockId}-quote-result`);

  let valueSlider;
  let volumeSlider;
  const update = () => {
    const [valueLo, valueHi] = valueSlider.values();
    const [volumeLo, volumeHi] = volumeSlider.values();
    const low = volumeLo * WEEKS_PER_MONTH * ((valueLo * rates[0]) / 100);
    const high = volumeHi * WEEKS_PER_MONTH * ((valueHi * rates[1]) / 100);
    const orMore = valueSlider.isOpenEnded() || volumeSlider.isOpenEnded();
    const text = `${money0(low)} to ${money0(high)}${orMore ? '+' : ''}`;
    result.set(text);
    return text;
  };
  const onChange = () => announcer.announce(`${resultLabel}: ${update()}`);

  valueSlider = createRangeSlider({
    label: cellText(rows['quote-value']?.label) || valueLabel,
    stops: VALUE_STOPS,
    start: DEFAULT_VALUE,
    format: money0,
    openEnded: true,
    size: 'sm',
    onChange,
  });
  volumeSlider = createRangeSlider({
    label: cellText(rows['quote-volume']?.label) || 'Shipments a week',
    stops: VOLUME_STOPS,
    start: parseRange(cellText(rows['quote-volume']?.value), DEFAULT_VOLUME),
    format: count,
    openEnded: true,
    size: 'sm',
    onChange,
  });
  if (rows['quote-value']) moveInstrumentation(rows['quote-value'].row, valueSlider.element);
  if (rows['quote-volume']) moveInstrumentation(rows['quote-volume'].row, volumeSlider.element);
  if (rows['quote-result']) moveInstrumentation(rows['quote-result'].row, result.element);

  const body = el('div', 'calculator-premium-sheet-body');
  body.append(valueSlider.element, volumeSlider.element);

  const foot = el('div', 'calculator-premium-sheet-foot');
  const summary = el('div', 'calculator-premium-quote');
  summary.append(result.element);
  if (rows['quote-disclaimer']) {
    const note = moveContent(rows['quote-disclaimer'], el('p', 'calculator-premium-quote-note'));
    note.innerHTML = note.innerHTML
      .replace(/\{low\}/g, money2(rates[0]))
      .replace(/\{high\}/g, money2(rates[1]));
    summary.append(note);
  }
  foot.append(summary);
  if (rows['quote-cta']) {
    foot.append(moveContent(rows['quote-cta'], el('div', 'calculator-premium-sheet-actions')));
  }
  foot.append(announcer.element);

  panel.append(header, body, foot);
  dialog.append(panel);

  let trigger;
  let closeTimer;
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function finishClose() {
    clearTimeout(closeTimer);
    dialog.removeAttribute('data-state');
    if (dialog.open) dialog.close();
    trigger?.focus({ preventScroll: true });
  }

  function requestClose() {
    if (!dialog.open || dialog.dataset.state === 'closing') return;
    if (reduceMotion()) {
      finishClose();
      return;
    }
    dialog.dataset.state = 'closing';
    closeTimer = setTimeout(finishClose, 400);
    dialog.addEventListener('transitionend', (e) => {
      if (e.target === dialog && dialog.dataset.state === 'closing') finishClose();
    }, { once: true });
  }

  close.addEventListener('click', requestClose);
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    requestClose();
  });
  // clicks on the backdrop land on the dialog itself
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) requestClose();
  });

  return {
    dialog,
    open(valueRange, opener) {
      clearTimeout(closeTimer);
      trigger = opener;
      valueSlider.setRange(valueRange, false);
      announcer.reset(`${resultLabel}: ${update()}`);
      if (!dialog.open) dialog.showModal();
      requestAnimationFrame(() => requestAnimationFrame(() => { dialog.dataset.state = 'open'; }));
    },
  };
}

let instanceCount = 0;

export default function decorate(block) {
  instanceCount += 1;
  const blockId = `calculator-premium-${instanceCount}`;

  const rows = {};
  [...block.children].forEach((row) => {
    const [typeCell, label, value] = row.children;
    const type = cellText(typeCell).toLowerCase();
    if (ROW_TYPES.includes(type) && !rows[type]) rows[type] = { row, label, value };
  });

  const rates = parseRange(cellText(rows.rates?.value), DEFAULT_RATES);
  const valueLabel = cellText(rows.value?.label) || 'Package value';
  const resultLabel = cellText(rows.result?.label) || 'Estimated premium per package';
  const hasQuote = Object.keys(rows).some((type) => type.startsWith('quote-'));

  const titleId = `${blockId}-title`;
  const title = moveContent(rows.heading, el('h2', 'calculator-premium-title', { id: titleId }));

  // per-package estimate
  const lastValue = VALUE_STOPS[VALUE_STOPS.length - 1];
  const result = buildResult(
    'calculator-premium-result',
    resultLabel,
    `${money2((lastValue * rates[0]) / 100)} to ${money2((lastValue * rates[1]) / 100)}+`,
    `${blockId}-result`,
  );
  if (rows.result) moveInstrumentation(rows.result.row, result.element);
  const announcer = createAnnouncer();
  const histogram = buildHistogram(HISTOGRAM);

  let slider;
  const update = () => {
    const [lo, hi] = slider.values();
    const text = `${money2((lo * rates[0]) / 100)} to ${money2((hi * rates[1]) / 100)}${slider.isOpenEnded() ? '+' : ''}`;
    histogram.update(slider.range());
    result.set(text);
    return text;
  };
  slider = createRangeSlider({
    label: valueLabel,
    stops: VALUE_STOPS,
    start: parseRange(cellText(rows.value?.value), DEFAULT_VALUE),
    format: money0,
    openEnded: true,
    labelHidden: true,
    onChange: () => announcer.announce(`${resultLabel}: ${update()}`),
  });
  if (rows.value) moveInstrumentation(rows.value.row, slider.element);
  announcer.reset(`${resultLabel}: ${update()}`);

  const term = el('div', 'calculator-premium-term');
  term.append(histogram.element, slider.element);

  const outcome = el('div', 'calculator-premium-outcome');
  outcome.append(result.element);

  let sheet;
  if (hasQuote) {
    sheet = buildQuoteSheet({
      blockId, rows, rates, valueLabel,
    });
    const action = el('div', 'calculator-premium-action');
    const open = el('button', 'button calculator-premium-open', { type: 'button', 'aria-haspopup': 'dialog' });
    const openLabel = moveContent(rows.cta, el('span'));
    if (!openLabel.textContent.trim()) openLabel.textContent = 'Estimate monthly premium';
    else openLabel.textContent = openLabel.textContent.trim();
    open.append(openLabel);
    open.insertAdjacentHTML('beforeend', ICONS.arrow);
    open.addEventListener('click', () => sheet.open(slider.range(), open));
    action.append(open);
    outcome.append(action);
  } else if (rows.cta) {
    outcome.append(moveContent(rows.cta, el('div', 'calculator-premium-action')));
  }

  const equation = el('div', 'calculator-premium-equation');
  equation.append(term, outcome);

  const note = buildNote(rows.disclaimer, 'calculator-premium-note');

  block.setAttribute('role', 'region');
  block.setAttribute('aria-labelledby', titleId);
  block.textContent = '';
  block.append(title, equation, announcer.element, note);
  if (sheet) block.append(sheet.dialog);
}
