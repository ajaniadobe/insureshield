import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards (stats) -- borderless stat items: large illustration (with the big
 * number baked into the artwork), title, description. Each item may carry two
 * optional trailing paragraphs: a footnote ("* See the statistics note ...")
 * and a text-link CTA ("Get pricing"); both are revealed on hover/focus on
 * pointer devices and always shown on touch devices.
 *
 * Content contract -- one row per item: [ image | <h3>title</h3><p>description</p>
 *   <p>* footnote</p><p><a>Get pricing</a></p> ]
 */

function decorateBody(body) {
  body.querySelectorAll(':scope > p').forEach((p) => {
    const text = p.textContent.trim();
    if (!text && !p.querySelector('img, picture')) {
      p.remove();
      return;
    }
    const link = p.querySelector('a');
    if (link && text === link.textContent.trim()) {
      // Render as a plain text link, not the global button style.
      p.classList.remove('button-container');
      p.classList.add('cards-stats-cta');
      link.classList.remove('button', 'primary', 'secondary');
    } else if (/^[*∗]/.test(text)) {
      p.classList.add('cards-stats-footnote');
    }
  });
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.querySelector('picture') && !div.textContent.trim()) {
        div.className = 'cards-stats-card-image';
      } else if (div.textContent.trim()) {
        div.className = 'cards-stats-card-body';
        decorateBody(div);
      } else {
        // empty cell (e.g. unused image field in Universal Editor)
        div.remove();
      }
    });

    if (li.querySelector('.cards-stats-footnote, .cards-stats-cta')) {
      li.classList.add('cards-stats-has-reveal');
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);
}
