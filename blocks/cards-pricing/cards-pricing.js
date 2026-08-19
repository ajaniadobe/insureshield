export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    // The single cell body holds: tier label (band), price, subtitle, feature list.
    const body = li.querySelector('div') || li.firstElementChild;
    if (body) {
      body.className = 'cards-pricing-card-body';
      // First paragraph = tier label band (e.g. "BASE LAYER", "ADD-ON • RECOMMENDED")
      const first = body.querySelector('p');
      if (first) first.classList.add('cards-pricing-tier');
      // A heading = the price (e.g. "$0.30", "0.6%", "Separate")
      const price = body.querySelector('h1, h2, h3, h4');
      if (price) price.classList.add('cards-pricing-price');
    }
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);

  // Mark the recommended tier (middle card) for the teal header band.
  const items = [...ul.children];
  if (items.length === 3) items[1].classList.add('recommended');
}
