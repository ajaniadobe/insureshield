/*
 * Columns (comparison) -- bordered comparison grid, e.g. 3 columns x 5 rows:
 *   [ <h2>What’s covered?</h2> | <h3>Carrier liability</h3> | <h3>Shipping insurance</h3> ]
 *   [ <img><h3>topic</h3>      | carrier text              | insurance text ]  x N
 *
 * The first row is the header. In body rows the first cell is the row topic
 * (illustration + title), the last column is the "positive" option and gets a
 * check-circle icon. On mobile, rows stack and every value cell is prefixed
 * with its column label (taken from the header row via data-label).
 *
 * The authored row/cell elements are kept in place (only classes, ARIA roles
 * and a decorative icon are added), so Universal Editor instrumentation on the
 * rows and cells is preserved without moving it.
 */

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const [headerRow, ...bodyRows] = rows;
  const headerCells = [...headerRow.children];
  const cols = Math.max(...rows.map((r) => r.children.length), 1);
  block.style.setProperty('--columns-comparison-cols', cols);
  block.classList.add(`columns-comparison-${cols}-cols`);
  block.setAttribute('role', 'table');

  headerRow.classList.add('columns-comparison-header');
  headerRow.setAttribute('role', 'row');
  headerCells.forEach((cell, i) => {
    cell.classList.add(i === 0 ? 'columns-comparison-title' : 'columns-comparison-colhead');
    cell.setAttribute('role', 'columnheader');
  });

  const labels = headerCells.map((cell) => cell.textContent.trim());

  bodyRows.forEach((row) => {
    row.classList.add('columns-comparison-row');
    row.setAttribute('role', 'row');
    const cells = [...row.children];
    cells.forEach((cell, i) => {
      if (i === 0) {
        cell.classList.add('columns-comparison-topic');
        cell.setAttribute('role', 'rowheader');
        if (cell.querySelector('picture')) cell.classList.add('columns-comparison-has-image');
        return;
      }
      cell.classList.add('columns-comparison-value');
      cell.setAttribute('role', 'cell');
      if (labels[i]) cell.dataset.label = labels[i];
      if (i === cols - 1 && cells.length > 2 && cell.textContent.trim()) {
        cell.classList.add('columns-comparison-positive');
        const icon = document.createElement('span');
        icon.className = 'columns-comparison-icon';
        icon.setAttribute('aria-hidden', 'true');
        cell.prepend(icon);
      }
    });
  });
}
