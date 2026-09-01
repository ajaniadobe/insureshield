/* eslint-disable */
/* global WebImporter */
/**
 * Parser for embed-adaptive-form. Base block: embed.
 * Source: https://www.insureshield.com/us/en/home.html
 * Model field: formPath (aem-content) — the Adaptive Form path.
 * Library structure: 1 column, 2 rows (block name, then a single cell with a link/URL).
 * The block JS resolves the form from the first <a href> in the block, so the parser emits
 * an anchor pointing at the Adaptive Form path (from the iframe's data-form-page-path).
 * Generated: 2026-08-19
 */
export default function parse(element, { document }) {
  const iframe = element.querySelector('iframe[data-form-page-path], iframe[src]');

  // Prefer the authored Adaptive Form path; fall back to the iframe src pathname
  let formPath = iframe && iframe.getAttribute('data-form-page-path');
  if (!formPath && iframe && iframe.getAttribute('src')) {
    try {
      formPath = new URL(iframe.getAttribute('src'), 'https://www.insureshield.com').pathname;
    } catch (e) {
      formPath = iframe.getAttribute('src');
    }
  }

  // Empty-block guard
  if (!formPath) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Single cell with the form path link (field:formPath)
  const link = document.createElement('a');
  link.setAttribute('href', formPath);
  link.textContent = formPath;

  const contentCell = [document.createComment(' field:formPath '), link];
  const cells = [[contentCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-adaptive-form', cells });
  element.replaceWith(block);
}
