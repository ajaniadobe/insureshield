/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-feature. Base block: cards.
 * Source: https://www.insureshield.com/us/en/home.html
 * Model (card item): image (reference), imageAlt (collapsed), text (richtext).
 * Library structure: container block — one row per card, 2 cells per row:
 *   cell 1 = image (field:image), cell 2 = text content (field:text: title, description, CTAs).
 * Generated: 2026-08-19
 */
export default function parse(element, { document }) {
  // Each card is a .teasercard within the column-control grid
  const cards = Array.from(element.querySelectorAll('.teasercard, .teasercard-personalization'))
    // de-dupe if both classes match the same node
    .filter((el, i, arr) => arr.indexOf(el) === i);

  // Empty-block guard
  if (cards.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cards.forEach((card) => {
    const image = card.querySelector('.cmp-teaser__image picture, .cmp-teaser__image img, .cmp-image picture, .cmp-image img');

    const title = card.querySelector('.cmp-teaser__title');
    const description = card.querySelector('.cmp-teaser__description');
    const ctaLinks = Array.from(card.querySelectorAll('.cmp-teaser__action-container a, a.cmp-teaser__action-link'));

    // Image cell (field:image). Empty cell still gets the field comment so the slot exists.
    const imageCell = [document.createComment(' field:image ')];
    if (image) imageCell.push(image);

    // Text cell (field:text) — title, description, CTAs as rich text
    const textCell = [document.createComment(' field:text ')];
    if (title) textCell.push(title);
    if (description) textCell.push(description);
    ctaLinks.forEach((a) => textCell.push(a));

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}
