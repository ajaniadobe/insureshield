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
    WebImporter.DOMUtils.remove(element, [
      '#__tealiumImplicitmodal',
      '.popover-ups',
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
    ]);

    // Safe leftover / non-authorable elements. Block parsers run before
    // this hook, so any iframe/link the parsers needed has already been
    // consumed; what remains (form embed iframe, clientlib <link>, etc.)
    // is not authorable page content.
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'link',
      'noscript',
    ]);

    // Strip inline event/tracking attributes where present in captured DOM.
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-cmp-data-layer');
    });
  }
}
