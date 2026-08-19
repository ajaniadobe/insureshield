/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: InsureShield section breaks + section metadata.
 * Driven by payload.template.sections (from tools/importer/page-templates.json).
 *
 * Uses BOTH hooks: breaks are inserted in beforeTransform (while every
 * section boundary element still exists, before block parsers replace
 * them via element.replaceWith), anchored by a temporary marker <hr>.
 * Section Metadata blocks are inserted in afterTransform, anchored to the
 * surviving marker (or the original element for the first, marker-less
 * section). Sections are walked in reverse in each hook so inserts never
 * shift the position of a not-yet-processed section.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      // First section needs neither a leading break nor a marker anchor.
      if (i === 0 && !section.style) continue;
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue; // selector didn't match — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || element.querySelector(section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
