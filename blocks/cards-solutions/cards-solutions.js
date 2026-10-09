import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Each row is classified by what it contains:
 * - text only, heading only  -> group label ("Direct integrations")
 * - text only                -> intro statement
 * - image only               -> logo tile (two per row on mobile)
 * - image + text             -> product card (illustration, title, copy, tags, CTA)
 */
function classifyItem(li) {
  const image = li.querySelector(':scope > .cards-solutions-card-image');
  const body = li.querySelector(':scope > .cards-solutions-card-body');
  if (image && body) return 'cards-solutions-card';
  if (image) return 'cards-solutions-logo';
  const onlyHeadings = body && [...body.children].every((el) => /^H[1-6]$/.test(el.tagName));
  return onlyHeadings ? 'cards-solutions-label' : 'cards-solutions-intro';
}

function decorateCta(body) {
  body.querySelectorAll(':scope > p').forEach((p) => {
    const link = p.querySelector('a');
    if (!link || p.textContent.trim() !== link.textContent.trim()) return;
    // Render as a plain text link with arrow, not the global button style.
    p.classList.remove('button-container');
    p.classList.add('cards-solutions-cta');
    link.classList.remove('button', 'primary', 'secondary');
  });
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.querySelector('picture')) {
        div.className = 'cards-solutions-card-image';
      } else if (div.textContent.trim()) {
        div.className = 'cards-solutions-card-body';
        // Rich text from AEM can wrap headings in <p>, leaving empty paragraphs.
        div.querySelectorAll(':scope > p').forEach((p) => {
          if (!p.textContent.trim() && !p.querySelector('img, picture')) p.remove();
        });
      } else {
        // Empty cells (e.g. unused image/text field in Universal Editor).
        div.remove();
      }
    });

    li.classList.add(classifyItem(li));
    const body = li.querySelector(':scope > .cards-solutions-card-body');
    if (body) decorateCta(body);
    ul.append(li);
  });

  ul.querySelectorAll('.cards-solutions-card picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);
}
