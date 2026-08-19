/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-logos. Base block: columns.
 * Source: https://www.insureshield.com/us/en/home.html
 * Library structure: multi-column block. First row = block name; second row has as many
 * cells as columns, each cell holding inline content (here: logo images).
 * NOTE: Columns blocks do NOT use field hint comments (see hinting.md Rule 4 exception).
 * The intro text (.logos__text) is default content handled outside this block, so it is
 * excluded here — this parser only builds the logo columns.
 * Generated: 2026-08-19
 */
export default function parse(element, { document }) {
  // Each logo is its own <picture> inside .logos__assets — one column per logo
  const logos = Array.from(element.querySelectorAll('.logos__assets picture, .logos__asset picture'));

  // Empty-block guard
  if (logos.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // The caption (.logos__text, e.g. "Backed by the Reliability and Scale of
  // UPS® and Trusted by Major Brands:") sits above the logo strip. It lives
  // inside this block's source element, so it must be emitted here as default
  // content — otherwise it is lost when the element is replaced.
  const captionEl = element.querySelector('.logos__text');
  const captionText = captionEl ? captionEl.textContent.trim() : '';

  // Single row: one cell per logo (columns block — no field comments)
  const row = logos.map((pic) => pic);
  const cells = [row];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-logos', cells });

  if (captionText) {
    const caption = document.createElement('p');
    caption.textContent = captionText;
    element.replaceWith(caption, block);
  } else {
    element.replaceWith(block);
  }
}
