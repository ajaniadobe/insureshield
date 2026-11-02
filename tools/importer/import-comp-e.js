/* eslint-disable */
/* global WebImporter */

// Import script for the "comp-e" template — the comp-E prototype homepage,
// imported from a locally served MHTML snapshot (http://localhost:8811/).
// Output is always written to /us/en/comp-e (see TARGET_PATH).

// PARSER IMPORTS
import calculatorPremiumParser from './parsers/calculator-premium.js';
import cardsStatsParser from './parsers/cards-stats.js';
import cardsStandoutParser from './parsers/cards-standout.js';
import checklistParser from './parsers/checklist.js';
import cardsSolutionsParser from './parsers/cards-solutions.js';
import calculatorImpactParser from './parsers/calculator-impact.js';
import cardsCaseStudyParser from './parsers/cards-case-study.js';
import columnsComparisonParser from './parsers/columns-comparison.js';
import accordionParser from './parsers/accordion.js';

// TRANSFORMER IMPORTS — comp-e specific only (insureshield-* serve the homepage template)
import cleanupTransformer from './transformers/compe-cleanup.js';
import sectionsTransformer from './transformers/compe-sections.js';

// PARSER REGISTRY
const parsers = {
  'calculator-premium': calculatorPremiumParser,
  'cards-stats': cardsStatsParser,
  'cards-standout': cardsStandoutParser,
  'checklist': checklistParser,
  'cards-solutions': cardsSolutionsParser,
  'calculator-impact': calculatorImpactParser,
  'cards-case-study': cardsCaseStudyParser,
  'columns-comparison': columnsComparisonParser,
  'accordion': accordionParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "comp-e",
  "description": "comp-E prototype homepage (single-page site from MHTML snapshot); target /us/en/comp-e",
  "urls": [
    "http://localhost:8811/"
  ],
  "blocks": [
    {
      "name": "calculator-premium",
      "instances": [
        "#hero-section section._estimate_fyex6_5"
      ]
    },
    {
      "name": "cards-stats",
      "instances": [
        "#stats section._group_15dwb_6"
      ]
    },
    {
      "name": "cards-standout",
      "instances": [
        "#standout div._grid_n9mqh_10"
      ]
    },
    {
      "name": "checklist",
      "instances": [
        "#main > section._section_cwncx_50:not([id]) div._split_27cwx_416"
      ]
    },
    {
      "name": "cards-solutions",
      "instances": [
        "#solutions div._grid_n9mqh_10"
      ]
    },
    {
      "name": "calculator-impact",
      "instances": [
        "#calculator div._grid_n9mqh_10"
      ]
    },
    {
      "name": "cards-case-study",
      "instances": [
        "#stories ul._grid_n9mqh_10"
      ]
    },
    {
      "name": "columns-comparison",
      "instances": [
        "#difference ul._grid_n9mqh_10"
      ]
    },
    {
      "name": "accordion",
      "instances": [
        "#faq div._faq_27cwx_203"
      ]
    }
  ],
  "sections": [
    {
      "id": "hero",
      "name": "Hero",
      "selector": [
        "#hero-section"
      ],
      "style": "split",
      "blocks": [
        "calculator-premium"
      ],
      "defaultContent": [
        "#hero-section div._head_19lfv_53"
      ]
    },
    {
      "id": "stats",
      "name": "Stats - Delivering confidence",
      "selector": [
        "#stats"
      ],
      "style": null,
      "blocks": [
        "cards-stats"
      ],
      "defaultContent": [
        "#stats div._intro_1q9ch_5"
      ]
    },
    {
      "id": "standout",
      "name": "What makes us stand out",
      "selector": [
        "#standout"
      ],
      "style": null,
      "blocks": [
        "cards-standout"
      ],
      "defaultContent": []
    },
    {
      "id": "benefits",
      "name": "Benefits",
      "selector": [
        "#main > section._section_cwncx_50:not([id])"
      ],
      "style": null,
      "blocks": [
        "checklist"
      ],
      "defaultContent": []
    },
    {
      "id": "solutions",
      "name": "Our solutions",
      "selector": [
        "#solutions"
      ],
      "style": null,
      "blocks": [
        "cards-solutions"
      ],
      "defaultContent": []
    },
    {
      "id": "calculator",
      "name": "Estimate your business impact",
      "selector": [
        "#calculator"
      ],
      "style": null,
      "blocks": [
        "calculator-impact"
      ],
      "defaultContent": []
    },
    {
      "id": "stories",
      "name": "Read more stories",
      "selector": [
        "#stories"
      ],
      "style": null,
      "blocks": [
        "cards-case-study"
      ],
      "defaultContent": [
        "#stories div._intro_1q9ch_5"
      ]
    },
    {
      "id": "difference",
      "name": "What's covered? comparison",
      "selector": [
        "#difference"
      ],
      "style": null,
      "blocks": [
        "columns-comparison"
      ],
      "defaultContent": []
    },
    {
      "id": "faq",
      "name": "FAQ",
      "selector": [
        "#faq"
      ],
      "style": "split",
      "blocks": [
        "accordion"
      ],
      "defaultContent": [
        "#faq div._intro_1q9ch_5"
      ]
    }
  ]
};

// The source is a single-page site at "/", which would otherwise map to /index
// and overwrite the existing site root page.
const TARGET_PATH = '/us/en/comp-e';

// Images come from the temporary local server; point them at the copies kept
// next to the page (content/us/en/images/comp-e/) so they outlive that server.
const SOURCE_IMAGE_PREFIX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/images\//;
const LOCAL_IMAGE_PREFIX = './images/comp-e/';

function localizeImages(main) {
  main.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (SOURCE_IMAGE_PREFIX.test(src)) {
      img.setAttribute('src', src.replace(SOURCE_IMAGE_PREFIX, LOCAL_IMAGE_PREFIX));
    }
  });
}

// TRANSFORMER REGISTRY
// Order matters: cleanup first, then sections (<hr> breaks before parsing,
// section-metadata after).
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
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
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform transformers (cleanup, inline SVG -> <img>, section breaks)
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

    // 4. afterTransform transformers (final cleanup + section metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules. convertIcons is intentionally NOT used: it
    //    turns the .svg illustrations into :icon: text.
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    localizeImages(main);

    // 6. Fixed target path (see TARGET_PATH)
    const path = WebImporter.FileUtils.sanitizePath(TARGET_PATH);

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
