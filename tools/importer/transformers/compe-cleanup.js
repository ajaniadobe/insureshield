/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: comp-e prototype (template "comp-e", source
 * http://localhost:8811/ — MHTML snapshot of comp-e-production.up.railway.app)
 * site-wide cleanup.
 *
 * Selectors verified against migration-work/cleaned.html AND the live
 * rendered DOM of http://localhost:8811/ (the import runs on the live DOM).
 *
 * Live page shell:
 *   div#root > div#top._page_cwncx_6 >
 *     div._skip_cwncx_23            "Skip to content" link        -> removed
 *     header._header_iujfl_6        logo + in-page anchor nav,
 *                                   Menu + "Prototype" buttons    -> removed (nav fragment)
 *     main#main                     authorable content            -> kept
 *     footer._footer_5ea31_5        footer columns/legal          -> removed (footer fragment)
 *     aside._dock_3e6tw_5           floating "Get shipping
 *                                   insurance" button             -> removed
 *
 * ---------------------------------------------------------------------------
 * INLINE SVG HANDLING (approach (a): converted here, parsers only see <img>)
 * ---------------------------------------------------------------------------
 * The live DOM has ~124 inline <svg>s (all aria-hidden="true"). The scraper
 * exported each distinct one to migration-work/images/ and rewrote it to
 * <img src="./images/<name>.svg"> in cleaned.html, naming the files by kind
 * + content hash (see metadata.json `.images.inlineSvgExports`). The file
 * names are not derivable from the SVG markup at import time (sync hook, no
 * hashing), but the mapping is deterministic BY DOM ORDER within each
 * section: the content illustrations appear in the same order in the live
 * DOM and in cleaned.html. So in beforeTransform, for each section below we
 * take its top-level content SVGs (CONTENT_SVG_SELECTOR) in document order
 * and replace the n-th one with <img src="./images/<n-th file>">, i.e. the
 * exact same src string cleaned.html / page-structure.json use. Parsers
 * therefore just pick up <img> exactly as they see it in cleaned.html.
 *
 * Every OTHER inline SVG is purely decorative and is removed rather than
 * converted: arrow icons in CTAs/tiles (icon-arrow_forward/_outward/
 * _downward, ._cueIcon, ._corner), check icons (icon-check in the benefits
 * checklist, icon-check_circle in the comparison), calculator cube glyphs +
 * <defs> (svg._cube_1ggqz_179 / svg._defs_1ggqz_56 — the block renders its
 * own visualisation; the readable summary survives in the
 * div[role="img"][aria-label] next to it), and header/footer/aside icons.
 *
 * Integration logo tiles (#solutions li._logoCell_27cwx_322) are not SVGs
 * but empty span._logoMask_27cwx_327 elements painted with a CSS mask. They
 * are converted to <img> using the same ./images/ files page-structure.json
 * lists, keyed by the tile's visually-hidden name (Shopify, ShipStation...).
 *
 * The ./images/ srcs resolve against the page URL, i.e.
 * http://localhost:8811/images/<file>; the migration-work/images/ files
 * must be served there for the importer to fetch them.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

const IMG_DIR = './images/';

// Top-level content-illustration SVG classes (live DOM):
//   svg._header_o2xeh_2          stats card header art (in div._lattice_15dwb_111)
//   svg._illustrationSvg_15dwb_549  card illustrations (in div._illustration_15dwb_543)
//   svg._fill_o2xeh_10           CommerceShield card art (in div._mediaInner_n9mqh_403)
const CONTENT_SVG_SELECTOR = 'svg._header_o2xeh_2, svg._illustrationSvg_15dwb_549, svg._fill_o2xeh_10';

// Ordered exports per section (order == DOM order in live page and cleaned.html).
const SECTION_SVG_EXPORTS = [
  {
    section: '#stats',
    files: [
      'section-header-art-1c5de68bf2a9.svg',
      'section-header-art-41f080a125d0.svg',
      'section-header-art-b66fdb06d8ee.svg',
    ],
  },
  {
    section: '#standout',
    files: [
      'illustration-ca639c1e7e5a.svg',
      'illustration-234d5178f8c4.svg',
      'illustration-e01535e04ae3.svg',
    ],
  },
  {
    // Benefits section has no id
    section: '#main > section._section_cwncx_50:not([id])',
    files: ['illustration-cd25dd21c162.svg'],
  },
  {
    section: '#solutions',
    files: [
      'illustration-b1ca7420a837.svg',
      'svg-7bdb93bcc1fe.svg',
      'illustration-3d350cfdb6c5.svg',
      'illustration-cc4e5ab154a5.svg',
    ],
  },
  {
    section: '#difference',
    files: [
      'illustration-07c833e40d1a.svg',
      'illustration-aaf672e96773.svg',
      'illustration-c8bd71000c18.svg',
      'illustration-1682240576af.svg',
    ],
  },
];

// #solutions logo tiles: visually-hidden name -> exported logo file
// (from metadata.json `.images.mapping` / page-structure.json).
const LOGO_FILES = {
  shopify: 'eefd3b4505fd518b237dceedb803169e.png',
  shipstation: '8cec9a5cc70b48b2d3707e470908d9a0.png',
  'pirate ship': '4b440b93ac318facf0c5bca31d799006.png',
  aftership: 'aab7cf18b17c0cbf6b151f56f86ec5b4.png',
  woocommerce: 'logo-woocommerce.svg',
};

function makeImg(doc, file, alt) {
  const img = doc.createElement('img');
  img.setAttribute('src', `${IMG_DIR}${file}`);
  img.setAttribute('alt', alt || '');
  return img;
}

function isTopLevelSvg(svg) {
  return !(svg.parentElement && svg.parentElement.closest('svg'));
}

export default function transform(hookName, element, payload) {
  const doc = element.ownerDocument || document;

  if (hookName === TransformHook.beforeTransform) {
    // 1. Site chrome + overlays (live DOM, also present in cleaned.html).
    WebImporter.DOMUtils.remove(element, [
      'div._skip_cwncx_23', // "Skip to content" link (a[href="/#main"])
      'header._header_iujfl_6', // logo + anchor nav + Menu/"Prototype" buttons
      'footer._footer_5ea31_5', // footer -> footer fragment
      'aside._dock_3e6tw_5', // floating "Get shipping insurance" dock (inert)
    ]);

    // 2. Decorative canvases: band-pattern roots in #solutions/#stories
    //    (div._root_16xtn_5) and generated photo-pattern canvases in the
    //    story/solution cards (div._root_1eyyg_7). Not importable.
    WebImporter.DOMUtils.remove(element, [
      'div._root_16xtn_5',
      'div._root_1eyyg_7',
      'canvas',
    ]);

    // 3. Visually-hidden aria-live announcements that duplicate visible text:
    //    "Estimated monthly premium: $135 to $190 a month" (hero calculator)
    //    "$48,000 needed to recover losses" (#calculator result)
    //    and the sr-only "62M " / "$132M " / "97% " prefixes inside the
    //    #stats card labels (the figure is already visible in the card).
    WebImporter.DOMUtils.remove(element, [
      'span._root_1fklp_2[aria-live]',
      '#stats span._srOnly_15dwb_243',
    ]);

    // 4. Inline SVG illustrations -> <img> with the scraper's exported files.
    SECTION_SVG_EXPORTS.forEach(({ section, files }) => {
      const sectionEl = element.querySelector(section);
      if (!sectionEl) return;
      const svgs = [...sectionEl.querySelectorAll(CONTENT_SVG_SELECTOR)].filter(isTopLevelSvg);
      svgs.forEach((svg, i) => {
        if (i < files.length) svg.replaceWith(makeImg(doc, files[i], ''));
      });
    });

    // 5. CSS-mask logo tiles -> <img> (alt = tile's visually-hidden name).
    element.querySelectorAll('#solutions li._logoCell_27cwx_322 span._logoMask_27cwx_327').forEach((mask) => {
      const target = mask.closest('button, h4') || mask.parentElement;
      const nameEl = target && target.querySelector('span._root_1fklp_2');
      const name = nameEl ? nameEl.textContent.trim() : '';
      const file = LOGO_FILES[name.toLowerCase()];
      if (file) mask.replaceWith(makeImg(doc, file, name));
      else mask.remove();
    });

    // 6. Every remaining inline SVG is a decorative icon/glyph (arrows,
    //    checks, cubes, defs) — remove, never emit raw SVG.
    element.querySelectorAll('svg').forEach((svg) => {
      if (svg.isConnected) svg.remove();
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Leftover non-authorable elements (block parsers have already run).
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      'aside',
      'canvas',
      'svg',
      'noscript',
      'link',
      'iframe',
    ]);

    // Empty decorative wrappers left in default content
    // (aria-hidden spans/divs such as slider rails, shadows, lattice/
    // illustration wrappers whose content was not consumed by a parser).
    element.querySelectorAll('[aria-hidden="true"]').forEach((el) => {
      if (!el.isConnected) return;
      if (el.textContent.trim()) return;
      if (el.querySelector('img, picture, video')) return;
      el.remove();
    });

    // Strip React/react-aria runtime attributes from leftover markup.
    element.querySelectorAll('[data-rac], [data-react-aria-pressable]').forEach((el) => {
      el.removeAttribute('data-rac');
      el.removeAttribute('data-react-aria-pressable');
    });
  }
}
