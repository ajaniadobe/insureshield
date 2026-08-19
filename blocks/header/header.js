import { getMetadata } from '../../scripts/aem.js';

// Media query that indicates desktop width (mobile menu below this).
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Fetch the nav fragment HTML. Tries the local content path first
 * (localhost / `aem up`), then falls back to the block-metadata path
 * (DA / EDS production).
 * @returns {Promise<Document|null>} parsed nav document, or null on failure
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) {
    const navMeta = getMetadata('nav');
    const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
    resp = await fetch(`${navPath}.plain.html`);
  }
  if (!resp.ok) return null;
  const html = await resp.text();
  return new DOMParser().parseFromString(html, 'text/html');
}

/**
 * Close every open dropdown in the main nav.
 * @param {Element} navSections the main-nav container
 * @param {Element} [except] a section to leave open
 */
function closeAllDrops(navSections, except) {
  navSections.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((drop) => {
    if (drop !== except) drop.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Toggle the mobile menu open/closed.
 * @param {Element} nav the nav element
 * @param {Boolean} [force] force a specific state
 */
function toggleMenu(nav, force = null) {
  const expanded = force !== null ? !force : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = expanded || isDesktop.matches ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // collapse any open sub-menus when the drawer closes
  if (expanded) closeAllDrops(nav.querySelector('.nav-sections'));
}

/**
 * Wire hover (desktop) and click (all viewports) behavior for a nav item
 * that has a dropdown sub-menu.
 * @param {Element} li the top-level list item
 * @param {Element} navSections the main-nav container
 */
function decorateDrop(li, navSections) {
  li.classList.add('nav-drop');
  li.setAttribute('aria-expanded', 'false');

  // Desktop: open on hover.
  li.addEventListener('mouseenter', () => {
    if (isDesktop.matches) {
      closeAllDrops(navSections, li);
      li.setAttribute('aria-expanded', 'true');
    }
  });
  li.addEventListener('mouseleave', () => {
    if (isDesktop.matches) li.setAttribute('aria-expanded', 'false');
  });

  // Mobile: a chevron toggle button expands the accordion; the text link
  // still navigates (split-link pattern, matching the source).
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-drop-toggle';
  toggle.setAttribute('aria-label', 'Toggle submenu');
  toggle.addEventListener('click', (e) => {
    if (!isDesktop.matches) {
      e.preventDefault();
      e.stopPropagation();
      const open = li.getAttribute('aria-expanded') === 'true';
      closeAllDrops(navSections, li);
      li.setAttribute('aria-expanded', open ? 'false' : 'true');
    }
  });
  const topLink = li.querySelector(':scope > a');
  if (topLink) topLink.insertAdjacentElement('afterend', toggle);
}

/**
 * Build the expandable search control in the tools area.
 * @returns {Element} the search wrapper
 */
function buildSearch() {
  const wrapper = document.createElement('div');
  wrapper.className = 'nav-search';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-search-toggle';
  toggle.setAttribute('aria-label', 'Search');
  toggle.setAttribute('aria-expanded', 'false');

  const form = document.createElement('form');
  form.className = 'nav-search-form';
  form.setAttribute('role', 'search');
  form.action = '/us/en/search';

  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = 'Search';
  input.setAttribute('aria-label', 'Search');
  form.append(input);

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
    wrapper.classList.toggle('open', !open);
    if (!open) input.focus();
  });

  wrapper.append(toggle, form);
  return wrapper;
}

/**
 * Loads and decorates the header nav.
 * @param {Element} block the header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');

  const sections = [...fragment.body.children];
  // Section order in nav.plain.html: 0 = brand/logo, 1 = utility + locale, 2 = main nav.
  const [brandSrc, utilitySrc, mainSrc] = sections;

  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  if (brandSrc) while (brandSrc.firstElementChild) brand.append(brandSrc.firstElementChild);

  // nav.plain.html uses relative image paths (e.g. images/logo.svg) that resolve
  // against the nav fragment location, not the current page — rewrite to absolute.
  brand.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^(https?:)?\/\//.test(src) && !src.startsWith('/')) {
      img.setAttribute('src', `/content/${src}`);
    }
  });

  const utility = document.createElement('div');
  utility.className = 'nav-utility';
  if (utilitySrc) {
    const lists = [...utilitySrc.querySelectorAll(':scope > ul')];
    const [links, locale] = lists;
    if (links) {
      links.classList.add('nav-utility-links');
      utility.append(links);
    }
    if (locale) {
      // Build a locale dropdown from the list: first item is the current
      // selection, the rest are options revealed on click.
      const localeWrap = document.createElement('div');
      localeWrap.className = 'nav-locale';
      const current = locale.querySelector('li:first-child');
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'nav-locale-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = current ? current.textContent.trim() : 'Region';
      locale.classList.add('nav-locale-menu');
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
        localeWrap.classList.toggle('open', !open);
      });
      localeWrap.append(toggle, locale);
      utility.append(localeWrap);
    }
  }

  const navSections = document.createElement('div');
  navSections.className = 'nav-sections';
  if (mainSrc) {
    while (mainSrc.firstElementChild) navSections.append(mainSrc.firstElementChild);
    navSections.querySelectorAll(':scope > ul > li').forEach((li) => {
      if (li.querySelector(':scope > ul')) decorateDrop(li, navSections);
    });
  }

  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  tools.append(buildSearch());

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));

  nav.append(hamburger, brand, utility, navSections, tools);

  // close dropdowns / menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      closeAllDrops(navSections);
      nav.querySelectorAll('.nav-locale.open, .nav-search.open').forEach((el) => el.classList.remove('open'));
    }
  });

  // reset state when crossing the desktop/mobile breakpoint
  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, true);
    closeAllDrops(navSections);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
