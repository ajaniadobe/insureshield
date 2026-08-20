# CommerceShield — Design Reference

**Authoritative visual reference:** the live original page
<https://www.insureshield.com/us/en/solutions/commerceshield.html>

The Figma frame (node 4015-3790) was confirmed by the user to **match this live
page** (hero-split "Grow with Confidence" card, teal dividers, connect-card
icons, section order). The Figma API is rate-limited, so use the **live URL
above** as the reference for any future visual comparison instead of Figma.

Migrated page (ours): <https://main--insureshield--ajaniadobe.aem.live/us/en/commerceshield>
Local preview: `http://localhost:3000/content/us/en/commerceshield`

---

## Section order (top → bottom)

1. **Hero (hero-split)** — text left, media right. Original uses an autoplay
   **video**; migration uses the Scene7 video thumbnail still (`CommerceShield -
   Video - 1080p with Thumbnail`). CTAs: "Talk with an Expert" (primary),
   "See How It Works" (secondary).
2. **The risk gap** — centered eyebrow + heading + subhead, full-width dark
   infographic (`postriskdelivery`).
3. **Risk signals should drive what happens next** — checklist block: image
   left, teal-check list right. Eyebrow "Merchant-controlled growth protection".
4. **Turn risk signals into the right next action** — centered eyebrow/heading,
   then **tabs** (5 tabs). NOTE: original lays the tab image *beside* compact
   text; migration stacks image above centered text.
5. **A risk control layer for the full "buy-to-deliver" journey** — full-width
   dark journey infographic (`Infographic 2 - June 19`).
6. **Turn data into better order decisions** — checklist `.swap` (image right).
7. **Simple ways to get connected** — 3 cards **WITH ICONS** (see below).
8. **No seats. No minimums.** — 3 pricing tiers, middle = "recommended".
9. **Speak with a risk expert** — embedded Adaptive Form.
10. **Insights & Resources** — story carousel. Original = 7 slides; migration
    currently = 1 story.
11. **Frequently Asked Questions** — accordion, 9 items.
12. **Turn risk signals into next actions** — teal CTA band, centered.

---

## Design tokens measured from the live original (1440px)

- **Section eyebrows** (e.g. "The risk gap"): `font-size:16px; font-weight:400;
  text-align:center; color:#121212`. Centered above centered headings.
- **Divider lines / separators**: horizontal rule, `width:656px` (constrained,
  centered), `1px` solid `#121212` (thin dark rule). The original renders **6**
  of these (`hr`/`role=separator`) — under eyebrows in the checklist + journey
  intro sections. Teal accent underline also appears under some headings.
- **Content max-width**: 1200px cap (matches our EDS convention).
- **Brand teal**: `rgb(63 162 157)` / `#3fa29d` (buttons, accents — kept per
  [[brand-teal-contrast-accepted]] even though it fails WCAG AA).

## Connect-card icons (Scene7, png-alpha)

| Card | Scene7 URL |
|------|-----------|
| Shopify App | `https://ups.scene7.com/is/image/upsprod/Shopify App?$UPSer_Preset$&wid=384&hei=216&fmt=png-alpha&fit=constrain` |
| Webhook | `https://ups.scene7.com/is/image/upsprod/Webhook?$UPSer_Preset$&wid=384&hei=216&fmt=png-alpha&fit=constrain` |
| API | `https://ups.scene7.com/is/image/upsprod/LynkUp API Icon?$UPSer_Preset$&wid=384&hei=216&fmt=png-alpha&fit=constrain` |

(URL-encode spaces as `%20` in HTML/JCR.)

---

## Known gaps vs. original (migration decisions / TODO)

- **Copy differs** — the Figma/migration copy is authoritative per the user; do
  NOT "fix" wording to match the original.
- **Tabs layout** — image-stacked vs. original's side-by-side (build-from-Figma
  choice; leave unless told otherwise).
- **Insights** — 1 story vs. original's 7-slide carousel (content decision).
- **Hero** — static thumbnail vs. original's autoplay video.
