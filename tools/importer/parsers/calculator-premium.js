/* eslint-disable */
/* global WebImporter */
/**
 * Parser for calculator-premium. Base block: calculator (custom).
 * Source: http://localhost:8811/ (comp-e MHTML snapshot), template "comp-e".
 * Instance selector: #hero-section section._estimate_fyex6_5
 *
 * Block contract (blocks/calculator-premium/README.md + _calculator-premium.json):
 * container block, one row per item, 3 cells [ type | label | value ]
 *   heading          | <h2>What’s your average package value?</h2>      |
 *   value            | Package value                                    | $100 – $1,000
 *   result           | Estimated premium per package                    |
 *   cta              | Estimate monthly premium                         |
 *   disclaimer       | Estimate only. Actual pricing ...                |
 *   rates            | Rate per $100 of value                           | 0.80 – 1.05
 *   quote-heading    | Build a quote                                    |
 *   quote-value      | Typical package value                            |
 *   quote-volume     | Shipments a week                                 | 50 – 250
 *   quote-result     | Estimated monthly premium                        |
 *   quote-disclaimer | A range ..., at {low} to {high} per $100 of value. |
 *   quote-cta        | <a href="...">Get your pricing</a>               |
 *   quote-form       | Placeholder notice shown on Continue             |
 * UE model calculator-premium-row: type (select), label (richtext), value (text).
 *
 * The block now matches the live insureshield.com shipping-insurance calculator
 * (per-package card + monthly estimate sheet), which the comp does not have:
 * the comp only shows a static "Estimated monthly premium" card with three
 * placeholder inputs. So the copy, default ranges and rates below come from the
 * live site, and the comp element is used only as the anchor for the block and
 * for its CTA link (div._action_fyex6_108 a[href], "Get your pricing").
 * Generated: 2026-10-09, updated 2026-11-02 for the live-site calculator.
 */

// copy, default ranges and rates from the live shipping-insurance calculator
const LIVE_ROWS = [
  ['heading', { heading: 'What’s your average package value?' }],
  ['value', 'Package value', '$100 – $1,000'],
  ['result', 'Estimated premium per package'],
  ['cta', 'Estimate monthly premium'],
  ['disclaimer', 'Estimate only. Actual pricing and availability depend on the shipment, customer, coverage option, and applicable policy terms.'],
  ['rates', 'Rate per $100 of value', '0.80 – 1.05'],
  ['quote-heading', 'Build a quote'],
  ['quote-value', 'Typical package value'],
  ['quote-volume', 'Shipments a week', '50 – 250'],
  ['quote-result', 'Estimated monthly premium'],
  ['quote-disclaimer', 'A range from your package values and weekly shipments, at {low} to {high} per $100 of value.'],
  ['quote-cta', { link: true }],
  ['quote-form', 'This quote form is a placeholder. Nothing you entered has been sent.'],
];

const FALLBACK_CTA = { href: 'https://signup-eagle.upscapital.com/en/sign-up', text: 'Get your pricing' };

export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

  // Cell with a field hint before the content; empty cell (no hint) when no content.
  const cell = (field, content) => {
    if (!content) return '';
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createComment(` field:${field} `));
    frag.appendChild(content);
    return frag;
  };
  const para = (text) => {
    const p = document.createElement('p');
    p.textContent = text;
    return p;
  };

  // CTA link from the comp: "Get your pricing" (falls back to the sign-up URL)
  const ctaEl = element.querySelector('[class*="_action_"] a[href], a[data-variant="primary"][href], a[href]');
  const ctaLabel = ctaEl && (ctaEl.querySelector('[class*="_label_"]') || ctaEl);
  const cta = {
    href: (ctaEl && ctaEl.getAttribute('href')) || FALLBACK_CTA.href,
    text: clean(ctaLabel && ctaLabel.textContent) || FALLBACK_CTA.text,
  };

  const cells = LIVE_ROWS.map(([type, label, value]) => {
    // plain strings are text labels; objects mark the heading and the CTA link
    // (checked by type: strings have a built-in String.prototype.link)
    let content;
    if (typeof label === 'string') {
      content = para(label);
    } else if (label.heading) {
      content = document.createElement('h2');
      content.textContent = label.heading;
    } else {
      const a = document.createElement('a');
      a.href = cta.href;
      a.textContent = cta.text;
      content = document.createElement('p');
      content.append(a);
    }
    return [
      cell('type', document.createTextNode(type)),
      cell('label', content),
      value ? cell('value', document.createTextNode(value)) : '',
    ];
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'calculator-premium', cells });
  element.replaceWith(block);
}
