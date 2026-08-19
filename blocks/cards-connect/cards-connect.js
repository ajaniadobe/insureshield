import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      div.className = 'cards-connect-card-body';
    });

    const body = li.querySelector('.cards-connect-card-body');
    if (body) {
      // First paragraph is the card title.
      const firstP = body.querySelector('p:not(.button-container)');
      if (firstP) firstP.classList.add('cards-connect-title');

      // Gather CTA buttons (EDS decorates standalone <p><a> into .button-container).
      const buttonContainers = [...body.querySelectorAll('.button-container')];
      if (buttonContainers.length) {
        const actions = document.createElement('div');
        actions.className = 'cards-connect-actions';
        buttonContainers.forEach((container) => actions.append(container));
        body.append(actions);
      }
    }

    ul.append(li);
  });

  block.textContent = '';
  block.append(ul);
}
