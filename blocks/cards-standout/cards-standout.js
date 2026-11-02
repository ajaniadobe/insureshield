import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards (standout) -- one bordered panel split into equal cells: a heading
 * cell (text-only row, e.g. "What makes us stand out against competitors")
 * followed by illustrated items (illustration, title, description).
 *
 * Content contract -- one row per cell:
 *   [ (empty) | <h2>heading</h2> ]                 -> heading cell
 *   [ image   | <h3>title</h3><p>description</p> ] -> item cell (x N)
 */

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.querySelector('picture') && !div.textContent.trim()) {
        div.className = 'cards-standout-card-image';
      } else if (div.textContent.trim()) {
        div.className = 'cards-standout-card-body';
        // Rich text from AEM can leave empty paragraphs around headings.
        div.querySelectorAll(':scope > p').forEach((p) => {
          if (!p.textContent.trim() && !p.querySelector('img, picture')) p.remove();
        });
      } else {
        // empty cell (heading rows have no image)
        div.remove();
      }
    });

    const hasImage = li.querySelector('.cards-standout-card-image');
    li.classList.add(hasImage ? 'cards-standout-item' : 'cards-standout-heading');
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '600' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);
}
