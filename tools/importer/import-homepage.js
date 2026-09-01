/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroCommerceParser from './parsers/hero-commerce.js';
import columnsLogosParser from './parsers/columns-logos.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import cardsStoryParser from './parsers/cards-story.js';
import embedAdaptiveFormParser from './parsers/embed-adaptive-form.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/insureshield-cleanup.js';
import sectionsTransformer from './transformers/insureshield-sections.js';
import dmImagesTransformer from './transformers/insureshield-dm-images.js';

// PARSER REGISTRY
const parsers = {
  'hero-commerce': heroCommerceParser,
  'columns-logos': columnsLogosParser,
  'cards-feature': cardsFeatureParser,
  'cards-story': cardsStoryParser,
  'embed-adaptive-form': embedAdaptiveFormParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'InsureShield homepage with hero, trusted-by logos, help cards, solutions cards, success stories carousel, and demo form',
  urls: [
    'https://www.insureshield.com/us/en/home.html',
  ],
  blocks: [
    {
      name: 'hero-commerce',
      instances: ['div.homepagehero.homepagehero-personalization.container-fluid.ups-teaser.ups-teaser__homepagehero.ups-teaser__content-left'],
    },
    {
      name: 'columns-logos',
      instances: ['div.logos'],
    },
    {
      name: 'cards-feature',
      instances: ['div.columncontrol.container.ups-columncontrol'],
    },
    {
      name: 'cards-story',
      instances: ['div.storycard.storycard-personalization'],
    },
    {
      name: 'embed-adaptive-form',
      instances: ['div.aemform'],
    },
  ],
  sections: [
    { id: 'hero', name: 'Hero', selector: 'div.homepagehero.homepagehero-personalization.container-fluid.ups-teaser.ups-teaser__homepagehero.ups-teaser__content-left', style: null, blocks: ['hero-commerce'], defaultContent: [] },
    { id: 'trusted-by', name: 'Trusted-by logos', selector: 'div.logos', style: null, blocks: ['columns-logos'], defaultContent: ['div.logos__text'] },
    { id: 'how-can-we-help', name: 'How Can We Help You Today', selector: 'div.columncontrol.container.ups-columncontrol', style: null, blocks: ['cards-feature'], defaultContent: ['div.title.container.text-center.title-padding-top.aem-GridColumn--default--12:nth-of-type(3)'] },
    { id: 'explore-solutions', name: 'Explore Our Solutions', selector: 'div.containerBackgroundColor.container.responsivegrid:nth-of-type(5)', style: 'grey', blocks: ['cards-feature'], defaultContent: ['div.title.container.text-center.title-padding-top:nth-of-type(6)'] },
    { id: 'success-stories', name: 'Our Success Stories', selector: 'div.storycard.storycard-personalization', style: null, blocks: ['cards-story'], defaultContent: ['div.title.container.text-center.title-padding-top:nth-of-type(6)', 'div.cta-link.container'] },
    { id: 'see-how-it-works', name: 'See How It Works (Demo Form)', selector: 'div.containerBackgroundColor.container.responsivegrid:nth-of-type(9)', style: 'grey', blocks: ['embed-adaptive-form'], defaultContent: [] },
    { id: 'legal-footnote', name: 'Legal footnote', selector: 'div.text.container.text--rte', style: null, blocks: [], defaultContent: ['div.text.container.text--rte'] },
  ],
};

// TRANSFORMER REGISTRY
// Order matters: cleanup first, then sections (adds <hr> breaks + metadata),
// then DM images (rewrites Scene7 <img> to carrier anchors in afterTransform).
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
  dmImagesTransformer,
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform transformers (section breaks/metadata + DM images)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (map root URL to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
