/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-commerce. Base block: hero.
 * Source: https://www.insureshield.com/us/en/home.html
 * Model fields: image (reference), imageAlt (collapsed Alt), text (richtext).
 * Library structure: 1 column, up to 3 rows (block name, background image, text content).
 * Scene7/DM <img> lands in its natural image slot; the DM transformer rewrites it to a
 * carrier anchor in afterTransform, so no parser-side change is needed here.
 * Generated: 2026-08-19
 */
export default function parse(element, { document }) {
  // Background image (Scene7 DM) — lives in the teaser image wrapper
  const image = element.querySelector('.cmp-teaser__image picture, .cmp-teaser__image img, .cmp-image picture, .cmp-image img');

  // Text content: heading, description, CTAs
  const heading = element.querySelector('.cmp-teaser__title h1, .cmp-teaser__title h2, .cmp-teaser__title, h1, h2');
  const description = element.querySelector('.cmp-teaser__description');
  const ctaLinks = Array.from(element.querySelectorAll('.cmp-teaser__action-container a, a.cmp-teaser__action-link'));

  // Empty-block guard
  if (!heading && !description && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row: background image cell (field:image). imageAlt is collapsed into the img alt attribute.
  const imageCell = [];
  imageCell.push(document.createComment(' field:image '));
  if (image) imageCell.push(image);
  cells.push([imageCell]);

  // Row: text content cell (field:text)
  const textCell = [];
  textCell.push(document.createComment(' field:text '));
  if (heading) textCell.push(heading);
  if (description) textCell.push(description);
  ctaLinks.forEach((a) => textCell.push(a));
  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-commerce', cells });
  element.replaceWith(block);
}
