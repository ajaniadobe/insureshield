# CommerceShield — Image Manifest

The page HTML references these 11 images. Save each exported/attached asset to the
exact path below (all under `content/images/commerceshield/`). Once saved, the local
preview and the published page will resolve all images.

You already shared several of these in chat — match them to the filenames here and
export the rest from the Figma frame.

| # | Save as (path relative to repo root) | What it is (from the Figma frame) | Provided? |
|---|--------------------------------------|-----------------------------------|-----------|
| 1 | `content/images/commerceshield/hero-grow-with-confidence.png` | Teal "Grow with Confidence" hero card with upward arrow | ✅ shared |
| 2 | `content/images/commerceshield/risk-gap-timeline.png` | Black infographic: TRADITIONAL FRAUD TOOLS → THE RISK GAP (Order Placed…Resolution) | ✅ shared |
| 3 | `content/images/commerceshield/risk-signals-worker.png` | Warehouse worker in hi-vis vest at a laptop | ✅ shared |
| 4 | `content/images/commerceshield/journey-order-know-decide-control-recover.png` | Black infographic: ORDER → KNOW → DECIDE → CONTROL → RECOVER | ✅ shared |
| 5 | `content/images/commerceshield/turn-data-woman-phone.png` | Woman on phone holding a shipping box | ✅ shared |
| 6 | `content/images/commerceshield/insights-buru.png` | BURU branded kraft shipping boxes | ✅ shared |
| 7 | `content/images/commerceshield/tab-find-risk.png` | Tab-1 panel screenshot ("Find Risk Earlier" — order/checkout signals) | ⬜ export from Figma |
| 8 | `content/images/commerceshield/tab-full-picture.png` | Tab-2 panel image ("See The Full Picture") | ⬜ export |
| 9 | `content/images/commerceshield/tab-set-rules.png` | Tab-3 panel image ("Set Your Rules") | ⬜ export |
| 10 | `content/images/commerceshield/tab-automate.png` | Tab-4 panel image ("Automate Decisions") | ⬜ export |
| 11 | `content/images/commerceshield/tab-resolve.png` | Tab-5 panel image ("Resolve Faster") | ⬜ export |

## How to save the ones you already shared
The 6 "shared" images are the standalone assets you attached. Rename each to the
filename above and drop it into `content/images/commerceshield/`.

## How to export the 5 tab-panel images
In Figma, open the "Turn risk signals into the right next action" tabs section
(node under 4015-3790). For each of the 5 tab panels, select the panel's image/frame
→ Export → PNG 2x → save with the matching `tab-*.png` name above. If a tab shows only
a placeholder in the design, a simple placeholder image is fine for now.

## Notes
- All paths in the HTML are **relative** (`images/commerceshield/...`) so they work
  both in local preview and on the published `.aem.live` page.
- The hero card, timeline, and journey graphics are used **as-is** (per your choice),
  so text inside them is baked into the image.
