import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// Cards shown per page at each breakpoint (matches the source slick carousel:
// 1 on mobile, 2 on tablet, 3 on desktop).
function cardsPerView() {
  if (window.matchMedia('(min-width: 900px)').matches) return 3;
  if (window.matchMedia('(min-width: 600px)').matches) return 2;
  return 1;
}

/**
 * Wire up carousel paging for the story cards: prev/next arrows and
 * indicator dots that scroll the track by a page of cards.
 * @param {Element} block the cards-story block
 * @param {Element} viewport the scroll container wrapping the <ul> track
 * @param {Element} track the <ul> of cards
 */
function buildCarousel(block, viewport, track) {
  const controls = document.createElement('div');
  controls.className = 'cards-story-controls';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'cards-story-arrow cards-story-prev';
  prev.setAttribute('aria-label', 'Previous stories');

  const dots = document.createElement('div');
  dots.className = 'cards-story-dots';
  dots.setAttribute('role', 'tablist');

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'cards-story-arrow cards-story-next';
  next.setAttribute('aria-label', 'Next stories');

  controls.append(prev, dots, next);
  block.append(controls);

  const cards = [...track.children];
  let page = 0;

  function pageCount() {
    return Math.max(1, Math.ceil(cards.length / cardsPerView()));
  }

  function update() {
    const perView = cardsPerView();
    const total = pageCount();
    if (page > total - 1) page = total - 1;
    const firstCard = cards[page * perView];
    if (firstCard) {
      viewport.scrollTo({ left: firstCard.offsetLeft - track.offsetLeft, behavior: 'smooth' });
    }
    prev.disabled = page === 0;
    next.disabled = page >= total - 1;
    [...dots.children].forEach((d, i) => {
      if (i === page) d.setAttribute('aria-selected', 'true');
      else d.removeAttribute('aria-selected');
    });
  }

  function goTo(i) {
    page = Math.max(0, Math.min(i, pageCount() - 1));
    update();
  }

  function renderDots() {
    const total = pageCount();
    dots.textContent = '';
    for (let i = 0; i < total; i += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'cards-story-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      if (i === page) dot.setAttribute('aria-selected', 'true');
      dot.addEventListener('click', () => goTo(i));
      dots.append(dot);
    }
  }

  prev.addEventListener('click', () => goTo(page - 1));
  next.addEventListener('click', () => goTo(page + 1));

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderDots();
      update();
    }, 150);
  });

  renderDots();
  update();
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-story-card-image';
      else div.className = 'cards-story-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    // story cards are below the fold — lazy-load
    optimizedPic.querySelector('img').loading = 'lazy';
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';

  // Wrap the track in a scroll viewport and add carousel controls.
  const viewport = document.createElement('div');
  viewport.className = 'cards-story-viewport';
  viewport.append(ul);
  block.append(viewport);

  buildCarousel(block, viewport, ul);
}
