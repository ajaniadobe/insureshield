/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: InsureShield (insureshield.com) site-wide cleanup.
 * All selectors verified against migration-work/cleaned.html for the
 * homepage capture. Removes non-authorable site chrome (header/nav,
 * footer, breadcrumb, site alert banner), cookie/consent + widget
 * overlays, and analytics/tracking pixels & iframes.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / consent widgets that would otherwise interfere with
    // block matching. Verified in cleaned.html:
    //   #__tealiumImplicitmodal  -> "This website uses cookies" consent modal (line ~1180)
    //   .popover-ups             -> "Show Popover" toaster contact widget (line ~897)
    //   #onetrust-consent-sdk    -> OneTrust cookie banner + preference center
    //                               (injected at runtime; seen in the 2026-09 re-import)
    WebImporter.DOMUtils.remove(element, [
      '#__tealiumImplicitmodal',
      '.popover-ups',
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '#onetrust-pc-sdk',
      '.onetrust-pc-dark-filter',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome (verified in cleaned.html):
    //   .header-alerts-container -> top slick alert banner (line ~5)
    //   header                   -> header/nav experience fragment (line ~48)
    //   .breadcrumb              -> empty breadcrumb region (line ~301)
    //   footer                   -> footer experience fragment (line ~941)
    //   .menu-backdrop           -> mobile menu overlay (line ~1175)
    WebImporter.DOMUtils.remove(element, [
      '.header-alerts-container',
      'header',
      '.breadcrumb',
      'footer',
      '.menu-backdrop',
    ]);

    // Analytics / tracking pixels and sync iframes appended to the page
    // tail (verified in cleaned.html lines ~1177-1196). None authorable.
    WebImporter.DOMUtils.remove(element, [
      '#ttdUniversalPixelTag',
      '#db-sync',
      '#db_lr_pixel_ad',
      '#batBeacon810156720948',
      '#universal_pixel_9pcs9vu',
      '#ak_recent',
      '#runModeConfig',
      '#currentPageUrl',
      '#alert-json-data',
      'img[src*="bat.bing.com"]',
    ]);

    // DA project: drop the xwalk field-hint comments (<!-- field:x -->) the
    // block parsers emit; DA documents have no field model.
    const walker = element.ownerDocument.createTreeWalker(element, 128 /* SHOW_COMMENT */);
    const comments = [];
    while (walker.nextNode()) comments.push(walker.currentNode);
    comments.forEach((c) => c.remove());

    // Safe leftover / non-authorable elements. Block parsers run before
    // this hook, so any iframe/link the parsers needed has already been
    // consumed; what remains (form embed iframe, clientlib <link>, etc.)
    // is not authorable page content.
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'link',
      'noscript',
    ]);

    // Internal links: rewrite legacy AEM URLs to EDS paths —
    // /us/en/about/contact-us.html?ref=homepage_hero -> /us/en/about/contact-us
    // (drop .html, drop the onsite `ref` tracking param, lowercase the path).
    // Absolute insureshield.com links become site-relative. /content/* paths
    // (e.g. the embedded form path) and non-page assets are left untouched.
    element.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      let url;
      try {
        url = new URL(href, 'https://www.insureshield.com');
      } catch (e) {
        return;
      }
      if (!/^(www\.)?insureshield\.com$/.test(url.hostname)) return;
      if (url.pathname.startsWith('/content/')) return;
      if (!/^\/[a-z]{2}\/[a-z]{2}(\/|\.html$|$)/i.test(url.pathname)) return;
      let path = url.pathname.replace(/\.html$/i, '').toLowerCase();
      if (path.length > 1) path = path.replace(/\/$/, '');
      url.searchParams.delete('ref');
      const query = url.searchParams.toString();
      a.setAttribute('href', `${path}${query ? `?${query}` : ''}${url.hash}`);
    });

    // Strip inline event/tracking attributes where present in captured DOM.
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-cmp-data-layer');
    });
  }
}
