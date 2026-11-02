# calculator-premium

Custom **calculator** block. Purpose: interactive-calculator.

Shipping insurance premium estimator, matching the calculator in the insureshield.com shipping-insurance hero:

- **Per-package card** (on the page): a package-value range slider over a histogram. Estimate = package value × rate ÷ 100, at the low and high rate.
- **Monthly estimate** (side sheet opened by the card's button): package value and shipments-a-week range sliders. Estimate = shipments a week × 52 ÷ 12 × package value × rate ÷ 100. The sheet's package value starts from the card's range each time it opens.

Sliders snap to fixed stops (package value $50–$50,000, shipments 1–10,000; the top stop reads "+"). Handles can pass one another, the band between them drags the whole range, and everything is keyboard operable (arrows, Page Up/Down, Home/End).

## Authoring

Model: `standalone`. One row per item, cells `[ type | label/content | value ]`:

| type | label / content | value |
| --- | --- | --- |
| `heading` | Card heading | |
| `value` | Package value slider label | Default range, e.g. `$100 – $1,000` |
| `result` | Per-package result label | |
| `cta` | Button label (opens the monthly estimate) | |
| `disclaimer` | Card note | |
| `rates` | Not shown | Rate per $100 of value, e.g. `0.80 – 1.05` |
| `quote-heading` | Sheet heading | |
| `quote-value` | Sheet package value slider label | |
| `quote-volume` | Shipments slider label | Default range, e.g. `50 – 250` |
| `quote-result` | Monthly result label | |
| `quote-disclaimer` | Sheet note; `{low}` / `{high}` are replaced with the rates | |
| `quote-cta` | Link(s) under the monthly result | |

Without any `quote-*` rows the `cta` cell is rendered as-is (e.g. a plain link) instead of a button opening the sheet.

Place the block in a section with style `split` to show it beside the section's text, as on the live site.

## Supported variations

No variations.

## Universal Editor fields

- Row type (select), Label / content (richtext), Default range or rates (text).
