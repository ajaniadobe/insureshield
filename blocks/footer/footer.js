import { getMetadata } from '../../scripts/aem.js';

/**
 * Fetch the footer fragment HTML. Tries the local content path first
 * (localhost / `aem up`), then falls back to the block-metadata path
 * (DA / EDS production).
 * @returns {Promise<Document|null>} parsed footer document, or null on failure
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) {
    const footerMeta = getMetadata('footer');
    const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
    resp = await fetch(`${footerPath}.plain.html`);
  }
  if (!resp.ok) return null;
  const html = await resp.text();
  return new DOMParser().parseFromString(html, 'text/html');
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;

  const footer = document.createElement('div');
  footer.className = 'footer-inner';

  const sections = [...fragment.body.children];
  // Section order: 0-2 = link columns (This Site / Other UPS Sites / Connect),
  // 3 = legal bar, 4 = copyright.
  const columns = sections.slice(0, 3);
  const legal = sections[3];
  const copyright = sections[4];

  // Top area: the three link columns.
  const top = document.createElement('div');
  top.className = 'footer-columns';
  columns.forEach((col) => {
    col.classList.add('footer-column');
    // external links (http) open in a new tab
    col.querySelectorAll('a[href^="http"]').forEach((a) => {
      a.target = '_blank';
      a.rel = 'noopener';
    });
    // resolve relative fragment image paths (images/x.svg) to absolute
    col.querySelectorAll('img[src]').forEach((img) => {
      const src = img.getAttribute('src');
      if (src && !/^(https?:)?\/\//.test(src) && !src.startsWith('/')) {
        img.setAttribute('src', `/content/${src}`);
      }
      // footer is below the fold — lazy-load
      img.loading = 'lazy';
      // the adjacent text label already names the link, so the icon is
      // decorative — empty alt avoids redundant announcements.
      img.setAttribute('alt', '');
    });
    // mark the social column (its links contain images)
    if (col.querySelector('img')) col.classList.add('footer-social');
    top.append(col);
  });
  footer.append(top);

  if (legal) {
    legal.classList.add('footer-legal');
    legal.querySelectorAll('a[href^="http"]').forEach((a) => {
      a.target = '_blank';
      a.rel = 'noopener';
    });
    footer.append(legal);
  }

  if (copyright) {
    copyright.classList.add('footer-copyright');
    footer.append(copyright);
  }

  block.append(footer);
}
