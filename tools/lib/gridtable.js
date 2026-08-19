/**
 * Grid-table markdown emitter for md2jcr.
 *
 * md2jcr's pandoc-style grid-table parser is strict about alignment: every
 * line in a table must share the exact same total width, and column-boundary
 * markers (`+` / `|`) must line up between separator and content rows. A single
 * content line even one character wider than the border silently collapses the
 * whole block to a raw text node. Hand-aligning tables is error-prone; these
 * helpers compute widths from the content so the output is always valid.
 */

/**
 * Build a single-column "stacked" grid table where each cell becomes its own
 * field row (used by block/model blocks such as hero-commerce and checklist).
 *
 * @param {string} name block title; may embed a variant, e.g. "Hero (split)"
 * @param {string[][]} cells ordered cells; each cell is an array of md lines
 * @returns {string} the grid-table markdown (no trailing newline)
 */
export function stackedGridTable(name, cells) {
  const lines = [name, ...cells.flat()];
  // inner width = longest line + a leading space + at least one trailing space
  const inner = Math.max(...lines.map((l) => l.length), 1) + 2;
  const border = `+${'-'.repeat(inner)}+`;
  const row = (text) => `|${` ${text}`.padEnd(inner)}|`;

  const out = [border, row(name), border];
  cells.forEach((cell) => {
    cell.forEach((line) => out.push(row(line)));
    out.push(border);
  });
  return out.join('\n');
}

/**
 * Build a multi-column grid table. Each body row is an array of cells; each
 * cell is an array of md lines. Column widths are the max line length in that
 * column across every row. The header (block name) spans the full width.
 *
 * @param {string} name block title
 * @param {string[][][]} rows body rows; row -> cell -> lines
 * @returns {string} the grid-table markdown (no trailing newline)
 */
export function gridTable(name, rows) {
  const numCols = Math.max(1, ...rows.map((r) => r.length));
  const colWidth = new Array(numCols).fill(0);
  rows.forEach((r) => r.forEach((cell, ci) => {
    cell.forEach((line) => { colWidth[ci] = Math.max(colWidth[ci], line.length); });
  }));
  // each column region = content width + leading + trailing space
  const region = colWidth.map((w) => w + 2);
  const innerTotal = region.reduce((a, b) => a + b, 0) + (numCols - 1);

  const fullBorder = `+${'-'.repeat(innerTotal)}+`;
  const colBorder = `+${region.map((r) => '-'.repeat(r)).join('+')}+`;
  const headerRow = `|${` ${name}`.padEnd(innerTotal)}|`;

  const bodyRow = (cells) => {
    // a row's tallest cell dictates how many physical lines it spans
    const height = Math.max(...cells.map((c) => c.length), 1);
    const physical = [];
    for (let li = 0; li < height; li += 1) {
      const parts = region.map((rw, ci) => {
        const text = (cells[ci] && cells[ci][li]) || '';
        return ` ${text}`.padEnd(rw);
      });
      physical.push(`|${parts.join('|')}|`);
    }
    return physical.join('\n');
  };

  const out = [fullBorder, headerRow, colBorder];
  rows.forEach((r) => {
    out.push(bodyRow(r));
    out.push(colBorder);
  });
  return out.join('\n');
}
