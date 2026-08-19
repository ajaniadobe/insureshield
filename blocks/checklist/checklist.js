export default function decorate(block) {
  // Each block renders two cells (rows): one holds the image, the other the
  // heading + checklist. Tag the image-only cell so the CSS can order/style it.
  // The `.swap` variant (authored via the block's classes field) reverses the
  // image/text order at desktop.
  [...block.children].forEach((row) => {
    const cell = row.firstElementChild;
    if (cell && cell.querySelector('picture') && cell.children.length === 1) {
      cell.classList.add('checklist-img-col');
    }
  });
}
