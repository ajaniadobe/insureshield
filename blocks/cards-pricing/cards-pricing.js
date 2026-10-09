import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    // The single cell body holds: tier label (band), plan name (heading),
    // price (bold-only paragraph), price unit, feature list.
    const body = li.querySelector('div') || li.firstElementChild;
    if (body) {
      body.className = 'cards-pricing-card-body';
      // First paragraph = tier label band (e.g. "Fraud & Risk Intelligence")
      const first = body.querySelector('p');
      if (first) first.classList.add('cards-pricing-tier');
      // Heading = plan name (e.g. "Order Scoring")
      const title = body.querySelector('h1, h2, h3, h4, h5, h6');
      if (title) title.classList.add('cards-pricing-title');
      // Paragraph holding only bold text = the price (e.g. "$0.30 + 0.6%")
      const price = [...body.querySelectorAll('p')].find((p) => p.children.length === 1
        && p.firstElementChild.tagName === 'STRONG'
        && p.textContent.trim() === p.firstElementChild.textContent.trim());
      if (price) {
        price.classList.add('cards-pricing-price');
        const unit = price.nextElementSibling;
        if (unit && unit.tagName === 'P') unit.classList.add('cards-pricing-unit');
      }
    }
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);

  // Mark the recommended tier (middle card) for the highlighted header band.
  const items = [...ul.children];
  if (items.length === 3) items[1].classList.add('recommended');
}
