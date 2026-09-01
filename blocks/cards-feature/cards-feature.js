import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-feature-card-image';
      } else {
        div.className = 'cards-feature-card-body';
      }
    });

    const body = li.querySelector('.cards-feature-card-body');
    if (body) {
      // First paragraph is the card title.
      const firstP = body.querySelector('p:not(.button-container)');
      if (firstP) firstP.classList.add('cards-feature-title');

      // Gather CTA buttons (EDS decorates standalone <p><a> into .button-container).
      const buttonContainers = [...body.querySelectorAll('.button-container')];
      if (buttonContainers.length) {
        const actions = document.createElement('div');
        actions.className = 'cards-feature-actions';
        buttonContainers.forEach((container, i) => {
          const btn = container.querySelector('a.button');
          // First CTA stays primary; subsequent CTAs render as secondary/outlined.
          if (btn && i > 0) btn.classList.add('secondary');
          actions.append(container);
        });
        body.append(actions);
      }
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    // Only run EDS image optimization for same-origin (DAM) images. Cross-origin
    // icons (e.g. hosted on the source site) must keep their absolute URL.
    let sameOrigin = false;
    try {
      sameOrigin = new URL(img.src, window.location.href).origin === window.location.origin;
    } catch (e) {
      sameOrigin = false;
    }
    if (!sameOrigin) return;
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '150' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);
}
