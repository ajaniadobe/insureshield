/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: comp-e section breaks + section metadata.
 * Driven by payload.template.sections of the "comp-e" template in
 * tools/importer/page-templates.json (9 sections: hero, stats, standout,
 * benefits, solutions, calculator, stories, difference, faq; hero + faq
 * carry style "split").
 *
 * Section selectors (verified in cleaned.html and the live DOM of
 * http://localhost:8811/):
 *   #hero-section                               (inside main > div._host_8upgs_5)
 *   #stats, #standout, #solutions, #calculator, #difference, #faq (main > section)
 *   #main > section._section_cwncx_50:not([id])  benefits (no id)
 *   #stories                                    (inside main > div._host_8upgs_5)
 *
 * Uses BOTH hooks: breaks are inserted in beforeTransform (while every
 * section boundary element still exists, before block parsers replace
 * elements via element.replaceWith), with a temporary marker attribute on
 * the <hr> of styled sections. Section Metadata blocks are inserted in
 * afterTransform, anchored to that marker (or the original element for the
 * first section). Sections are walked in reverse in each hook so inserts
 * never shift a not-yet-processed section.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

// section.selector may be a string or an array of candidates (first match wins).
function querySection(root, selectors) {
  const list = Array.isArray(selectors) ? selectors : [selectors];
  for (const sel of list) {
    if (!sel) continue;
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

// #hero-section and #stories are each the only child of a wrapper
// div._host_8upgs_5 under main; place the break at main-child level so the
// <hr> is not nested inside a leftover wrapper div.
function breakAnchor(el) {
  let node = el;
  while (
    node.parentElement
    && node.parentElement.tagName !== 'MAIN'
    && node.parentElement.tagName !== 'BODY'
    && node.parentElement.children.length === 1
  ) {
    node = node.parentElement;
  }
  return node;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  const doc = element.ownerDocument || document;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      // First section needs neither a leading break nor a marker anchor unless styled.
      if (i === 0 && !section.style) continue;
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue; // no selector matched — skip, never guess

      const hr = doc.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      breakAnchor(sectionEl).before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(doc, {
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
