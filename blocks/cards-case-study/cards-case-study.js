import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards (case study) -- connected, bordered grid of customer-story cards:
 * image area on top (kept as a fixed-ratio placeholder when no image is
 * authored), linked title, description and a "Read more" text link pinned
 * to the bottom of the card.
 *
 * Content contract -- one row per card:
 *   [ image (optional) | <h3><a href=story>title</a></h3><p>description</p>
 *     <p><a href=story>Read more</a></p> ]
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
      p.classList.add('cards-case-study-cta');
      link.classList.remove('button', 'primary', 'secondary');
    }
  });
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);

    let image = null;
    let body = null;
    [...li.children].forEach((div) => {
      if (!body && div.querySelector('picture') && !div.textContent.trim()) {
        image = div;
      } else if (div.textContent.trim()) {
        body = div;
      } else if (!image && !body) {
        // empty first cell = image placeholder (image not authored yet)
        image = div;
      } else {
        div.remove();
      }
    });

    if (!image) {
      image = document.createElement('div');
      li.prepend(image);
    }
    image.className = 'cards-case-study-card-image';
    if (body) {
      body.className = 'cards-case-study-card-body';
      decorateBody(body);
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    // story cards sit below the fold -- lazy-load
    optimizedPic.querySelector('img').loading = 'lazy';
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);
}
