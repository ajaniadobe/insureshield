/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-story. Base block: cards.
 * Source: https://www.insureshield.com/us/en/home.html
 * Model (card item): image (reference), imageAlt (collapsed), text (richtext).
 * Library structure: container block — one row per card, 2 cells per row:
 *   cell 1 = image (field:image), cell 2 = text content (field:text: eyebrow, title, text, link).
 * Each source card is an <a> wrapping a .image and a .description; the card link is
 * preserved as a CTA anchor built from the story href + "Read More" label.
 * Scene7/DM <img> lands in the image slot; the DM transformer handles the carrier anchor.
 * Generated: 2026-08-19
 */
export default function parse(element, { document }) {
  const cards = Array.from(element.querySelectorAll('.story-card--list__item'));

  // Empty-block guard
  if (cards.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cards.forEach((card) => {
    const link = card.querySelector('a[href]');
    const image = card.querySelector('.image picture, .image img, picture, img');

    const eyebrow = card.querySelector('.description__eyebrow');
    const title = card.querySelector('.description__title');
    const text = card.querySelector('.description__text');
    const linkLabel = card.querySelector('.description__link');

    // Image cell (field:image). Empty cell still gets the field comment.
    const imageCell = [document.createComment(' field:image ')];
    if (image) imageCell.push(image);

    // Text cell (field:text) — eyebrow, title, text, and a CTA anchor to the story
    const textCell = [document.createComment(' field:text ')];
    if (eyebrow) textCell.push(eyebrow);
    if (title) textCell.push(title);
    if (text) textCell.push(text);

    // Build a real anchor for the "Read More" CTA from the card link
    if (link && link.getAttribute('href')) {
      const cta = document.createElement('a');
      cta.setAttribute('href', link.getAttribute('href'));
      const labelText = linkLabel ? linkLabel.textContent.trim() : 'Read More';
      cta.textContent = labelText || 'Read More';
      textCell.push(cta);
    } else if (linkLabel) {
      textCell.push(linkLabel);
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-story', cells });
  element.replaceWith(block);
}
