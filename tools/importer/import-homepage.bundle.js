/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-commerce.js
  function parse(element, { document: document2 }) {
    const image = element.querySelector(".cmp-teaser__image picture, .cmp-teaser__image img, .cmp-image picture, .cmp-image img");
    const heading = element.querySelector(".cmp-teaser__title h1, .cmp-teaser__title h2, .cmp-teaser__title, h1, h2");
    const description = element.querySelector(".cmp-teaser__description");
    const ctaLinks = Array.from(element.querySelectorAll(".cmp-teaser__action-container a, a.cmp-teaser__action-link"));
    if (!heading && !description && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const imageCell = [];
    imageCell.push(document2.createComment(" field:image "));
    if (image) imageCell.push(image);
    cells.push([imageCell]);
    const textCell = [];
    textCell.push(document2.createComment(" field:text "));
    if (heading) textCell.push(heading);
    if (description) textCell.push(description);
    ctaLinks.forEach((a) => textCell.push(a));
    cells.push([textCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-commerce", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-logos.js
  function parse2(element, { document: document2 }) {
    const logos = Array.from(element.querySelectorAll(".logos__assets picture, .logos__asset picture"));
    if (logos.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const captionEl = element.querySelector(".logos__text");
    const captionText = captionEl ? captionEl.textContent.trim() : "";
    const row = logos.map((pic) => pic);
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-logos", cells });
    if (captionText) {
      const caption = document2.createElement("p");
      caption.textContent = captionText;
      element.replaceWith(caption, block);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/cards-feature.js
  function parse3(element, { document: document2 }) {
    const cards = Array.from(element.querySelectorAll(".teasercard, .teasercard-personalization")).filter((el, i, arr) => arr.indexOf(el) === i);
    if (cards.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cards.forEach((card) => {
      const image = card.querySelector(".cmp-teaser__image picture, .cmp-teaser__image img, .cmp-image picture, .cmp-image img");
      const title = card.querySelector(".cmp-teaser__title");
      const description = card.querySelector(".cmp-teaser__description");
      const ctaLinks = Array.from(card.querySelectorAll(".cmp-teaser__action-container a, a.cmp-teaser__action-link"));
      const imageCell = [document2.createComment(" field:image ")];
      if (image) imageCell.push(image);
      const textCell = [document2.createComment(" field:text ")];
      if (title) textCell.push(title);
      if (description) textCell.push(description);
      ctaLinks.forEach((a) => textCell.push(a));
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-story.js
  function parse4(element, { document: document2 }) {
    const cards = Array.from(element.querySelectorAll(".story-card--list__item"));
    if (cards.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cards.forEach((card) => {
      const link = card.querySelector("a[href]");
      const image = card.querySelector(".image picture, .image img, picture, img");
      const eyebrow = card.querySelector(".description__eyebrow");
      const title = card.querySelector(".description__title");
      const text = card.querySelector(".description__text");
      const linkLabel = card.querySelector(".description__link");
      const imageCell = [document2.createComment(" field:image ")];
      if (image) imageCell.push(image);
      const textCell = [document2.createComment(" field:text ")];
      if (eyebrow) textCell.push(eyebrow);
      if (title) textCell.push(title);
      if (text) textCell.push(text);
      if (link && link.getAttribute("href")) {
        const cta = document2.createElement("a");
        cta.setAttribute("href", link.getAttribute("href"));
        const labelText = linkLabel ? linkLabel.textContent.trim() : "Read More";
        cta.textContent = labelText || "Read More";
        textCell.push(cta);
      } else if (linkLabel) {
        textCell.push(linkLabel);
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-story", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/embed-adaptive-form.js
  function parse5(element, { document: document2 }) {
    const iframe = element.querySelector("iframe[data-form-page-path], iframe[src]");
    let formPath = iframe && iframe.getAttribute("data-form-page-path");
    if (!formPath && iframe && iframe.getAttribute("src")) {
      try {
        formPath = new URL(iframe.getAttribute("src"), "https://www.insureshield.com").pathname;
      } catch (e) {
        formPath = iframe.getAttribute("src");
      }
    }
    if (!formPath) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const link = document2.createElement("a");
    link.setAttribute("href", formPath);
    link.textContent = formPath;
    const contentCell = [document2.createComment(" field:formPath "), link];
    const cells = [[contentCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "embed-adaptive-form", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/insureshield-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#__tealiumImplicitmodal",
        ".popover-ups"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".header-alerts-container",
        "header",
        ".breadcrumb",
        "footer",
        ".menu-backdrop"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#ttdUniversalPixelTag",
        "#db-sync",
        "#db_lr_pixel_ad",
        "#batBeacon810156720948",
        "#universal_pixel_9pcs9vu",
        "#ak_recent",
        "#runModeConfig",
        "#currentPageUrl",
        "#alert-json-data"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        "link",
        "noscript"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("data-cmp-data-layer");
      });
    }
  }

  // tools/importer/transformers/insureshield-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || element.querySelector(section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/transformers/insureshield-dm-images.js
  function detectDynamicMediaUrl(urlStr) {
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) {
      return "scene7";
    }
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:")) {
      return "dm-openapi";
    }
    return false;
  }
  var LINKED_DM_INLINE_WRAPPER_TAGS = /* @__PURE__ */ new Set(["PICTURE"]);
  var LINKED_DM_WRAPPER_SIBLING_TAGS = /* @__PURE__ */ new Set(["SOURCE"]);
  function findLinkedDmCarrier(img) {
    if (!img || !img.parentElement) return null;
    let node = img;
    let parent = img.parentElement;
    while (parent && LINKED_DM_INLINE_WRAPPER_TAGS.has(parent.tagName)) {
      let foundNode = false;
      for (const child of parent.children) {
        if (child === node) {
          foundNode = true;
        } else if (!LINKED_DM_WRAPPER_SIBLING_TAGS.has(child.tagName)) {
          return null;
        }
      }
      if (!foundNode) return null;
      node = parent;
      parent = parent.parentElement;
    }
    if (!parent || parent.tagName !== "A") return null;
    if (parent.children.length !== 1 || parent.children[0] !== node) return null;
    if (parent.textContent.trim() !== "") return null;
    return parent;
  }
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function altToLinkText(alt) {
    return alt || EMPTY_ALT_SENTINEL;
  }
  function transform3(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const doc = element.ownerDocument;
    element.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!detectDynamicMediaUrl(src)) return;
      const alt = img.getAttribute("alt") || "";
      const linkedAnchor = findLinkedDmCarrier(img);
      if (linkedAnchor) {
        linkedAnchor.setAttribute("title", src);
        linkedAnchor.textContent = altToLinkText(alt);
        return;
      }
      const parent = img.parentElement;
      if (parent && parent.tagName === "A") {
        console.warn("DM image inside mixed-content anchor, skipped:", src);
        return;
      }
      const a = doc.createElement("a");
      a.href = src;
      a.textContent = altToLinkText(alt);
      img.replaceWith(a);
    });
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-commerce": parse,
    "columns-logos": parse2,
    "cards-feature": parse3,
    "cards-story": parse4,
    "embed-adaptive-form": parse5
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "InsureShield homepage with hero, trusted-by logos, help cards, solutions cards, success stories carousel, and demo form",
    urls: [
      "https://www.insureshield.com/us/en/home.html"
    ],
    blocks: [
      {
        name: "hero-commerce",
        instances: ["div.homepagehero.homepagehero-personalization.container-fluid.ups-teaser.ups-teaser__homepagehero.ups-teaser__content-left"]
      },
      {
        name: "columns-logos",
        instances: ["div.logos"]
      },
      {
        name: "cards-feature",
        instances: ["div.columncontrol.container.ups-columncontrol"]
      },
      {
        name: "cards-story",
        instances: ["div.storycard.storycard-personalization"]
      },
      {
        name: "embed-adaptive-form",
        instances: ["div.aemform"]
      }
    ],
    sections: [
      { id: "hero", name: "Hero", selector: "div.homepagehero.homepagehero-personalization.container-fluid.ups-teaser.ups-teaser__homepagehero.ups-teaser__content-left", style: null, blocks: ["hero-commerce"], defaultContent: [] },
      { id: "trusted-by", name: "Trusted-by logos", selector: "div.logos", style: null, blocks: ["columns-logos"], defaultContent: ["div.logos__text"] },
      { id: "how-can-we-help", name: "How Can We Help You Today", selector: "div.columncontrol.container.ups-columncontrol", style: null, blocks: ["cards-feature"], defaultContent: ["div.title.container.text-center.title-padding-top.aem-GridColumn--default--12:nth-of-type(3)"] },
      { id: "explore-solutions", name: "Explore Our Solutions", selector: "div.containerBackgroundColor.container.responsivegrid:nth-of-type(5)", style: "grey", blocks: ["cards-feature"], defaultContent: ["div.title.container.text-center.title-padding-top:nth-of-type(6)"] },
      { id: "success-stories", name: "Our Success Stories", selector: "div.storycard.storycard-personalization", style: null, blocks: ["cards-story"], defaultContent: ["div.title.container.text-center.title-padding-top:nth-of-type(6)", "div.cta-link.container"] },
      { id: "see-how-it-works", name: "See How It Works (Demo Form)", selector: "div.containerBackgroundColor.container.responsivegrid:nth-of-type(9)", style: "grey", blocks: ["embed-adaptive-form"], defaultContent: [] },
      { id: "legal-footnote", name: "Legal footnote", selector: "div.text.container.text--rte", style: null, blocks: [], defaultContent: ["div.text.container.text--rte"] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : [],
    transform3
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document: document2, url, html, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
