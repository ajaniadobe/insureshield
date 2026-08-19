import { getMetadata } from '../../scripts/aem.js';

// Media query that indicates desktop width (mobile menu below this).
const isDesktop = window.matchMedia('(min-width: 900px)');

<<<<<<< HEAD
function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
<<<<<<< HEAD
    if (!navSections) return;
=======
>>>>>>> 42e03a7 (Initial commit)
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
<<<<<<< HEAD
    if (!navSections) return;
=======
>>>>>>> 42e03a7 (Initial commit)
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
=======
/**
 * Fetch the nav fragment HTML. The nav lives under `/content/` when running
 * locally (`aem up` mirrors the AEM author tree) but at the site root on EDS
 * production (`/nav`). Try the environment's expected path first so production
 * page loads don't fire a guaranteed 404; fall back to the other path.
 * @returns {Promise<Document|null>} parsed nav document, or null on failure
 */
async function fetchNav() {
  const navMeta = getMetadata('nav');
  const prodPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const localPath = '/content/nav';
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const order = isLocal ? [localPath, prodPath] : [prodPath, localPath];

  let resp;
  for (let i = 0; i < order.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    resp = await fetch(`${order[i]}.plain.html`);
    if (resp.ok) break;
  }
  if (!resp || !resp.ok) return null;
  const html = await resp.text();
  return new DOMParser().parseFromString(html, 'text/html');
>>>>>>> cead38a (Add footer, header blocks)
}

/**
 * Close every open dropdown in the main nav.
 * @param {Element} navSections the main-nav container
 * @param {Element} [except] a section to leave open
 */
<<<<<<< HEAD
function toggleAllNavSections(sections, expanded = false) {
<<<<<<< HEAD
  if (!sections) return;
=======
>>>>>>> 42e03a7 (Initial commit)
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
=======
function closeAllDrops(navSections, except) {
  navSections.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((drop) => {
    if (drop !== except) drop.setAttribute('aria-expanded', 'false');
>>>>>>> cead38a (Add footer, header blocks)
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
<<<<<<< HEAD
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
<<<<<<< HEAD
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
=======
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
>>>>>>> 42e03a7 (Initial commit)
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
=======
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // collapse any open sub-menus when the drawer closes
  if (expanded) closeAllDrops(nav.querySelector('.nav-sections'));
>>>>>>> cead38a (Add footer, header blocks)
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
