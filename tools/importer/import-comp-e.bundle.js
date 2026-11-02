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

  // tools/importer/import-comp-e.js
  var import_comp_e_exports = {};
  __export(import_comp_e_exports, {
    default: () => import_comp_e_default
  });

  // tools/importer/parsers/calculator-premium.js
  var LIVE_ROWS = [
    ["heading", { heading: "What\u2019s your average package value?" }],
    ["value", "Package value", "$100 \u2013 $1,000"],
    ["result", "Estimated premium per package"],
    ["cta", "Estimate monthly premium"],
    ["disclaimer", "Estimate only. Actual pricing and availability depend on the shipment, customer, coverage option, and applicable policy terms."],
    ["rates", "Rate per $100 of value", "0.80 \u2013 1.05"],
    ["quote-heading", "Build a quote"],
    ["quote-value", "Typical package value"],
    ["quote-volume", "Shipments a week", "50 \u2013 250"],
    ["quote-result", "Estimated monthly premium"],
    ["quote-disclaimer", "A range from your package values and weekly shipments, at {low} to {high} per $100 of value."],
    ["quote-cta", { link: true }],
    ["quote-form", "This quote form is a placeholder. Nothing you entered has been sent."]
  ];
  var FALLBACK_CTA = { href: "https://signup-eagle.upscapital.com/en/sign-up", text: "Get your pricing" };
  function parse(element, { document: document2 }) {
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    const cell = (field, content) => {
      if (!content) return "";
      const frag = document2.createDocumentFragment();
      frag.appendChild(document2.createComment(` field:${field} `));
      frag.appendChild(content);
      return frag;
    };
    const para = (text) => {
      const p = document2.createElement("p");
      p.textContent = text;
      return p;
    };
    const ctaEl = element.querySelector('[class*="_action_"] a[href], a[data-variant="primary"][href], a[href]');
    const ctaLabel = ctaEl && (ctaEl.querySelector('[class*="_label_"]') || ctaEl);
    const cta = {
      href: ctaEl && ctaEl.getAttribute("href") || FALLBACK_CTA.href,
      text: clean(ctaLabel && ctaLabel.textContent) || FALLBACK_CTA.text
    };
    const cells = LIVE_ROWS.map(([type, label, value]) => {
      let content;
      if (typeof label === "string") {
        content = para(label);
      } else if (label.heading) {
        content = document2.createElement("h2");
        content.textContent = label.heading;
      } else {
        const a = document2.createElement("a");
        a.href = cta.href;
        a.textContent = cta.text;
        content = document2.createElement("p");
        content.append(a);
      }
      return [
        cell("type", document2.createTextNode(type)),
        cell("label", content),
        value ? cell("value", document2.createTextNode(value)) : ""
      ];
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "calculator-premium", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-stats.js
  function parse2(element, { document: document2 }) {
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    const hinted = (field, nodes) => {
      const list = nodes.filter(Boolean);
      if (!list.length) return "";
      const frag = document2.createDocumentFragment();
      frag.appendChild(document2.createComment(` field:${field} `));
      list.forEach((n) => frag.appendChild(n));
      return frag;
    };
    const ALT_BY_FILE = {
      "section-header-art-1c5de68bf2a9.svg": "62M packages insured",
      "section-header-art-41f080a125d0.svg": "$132M claims paid",
      "section-header-art-b66fdb06d8ee.svg": "97% within 5 days"
    };
    let items = [...element.querySelectorAll('article[class*="_card_"]')];
    if (!items.length) items = [...element.querySelectorAll("article")];
    if (!items.length) items = [...element.querySelectorAll('[class*="_raised_15dwb_"]')];
    const cells = [];
    items.forEach((item) => {
      const titleEl = item.querySelector("h3, h2, h4");
      const title = clean(titleEl && titleEl.textContent);
      let image = "";
      const img = item.querySelector('[class*="_header_"] img, img');
      if (img && img.getAttribute("src")) {
        const file = img.getAttribute("src").split("/").pop();
        const alt = clean(img.getAttribute("alt")) || ALT_BY_FILE[file] || title.replace(/\*+$/, "").trim();
        img.setAttribute("alt", alt);
        image = hinted("image", [img]);
      }
      const textNodes = [];
      if (title) {
        const h3 = document2.createElement("h3");
        h3.textContent = title;
        textNodes.push(h3);
      }
      item.querySelectorAll("p").forEach((p) => {
        const t = clean(p.textContent);
        if (!t) return;
        const np = document2.createElement("p");
        np.textContent = t;
        textNodes.push(np);
      });
      const action = item.querySelector('[class*="_foot_"] a, [class*="_foot_"] button, a[href], button');
      if (action) {
        const labelEl = action.querySelector('[class*="_label_"]');
        const label = clean((labelEl || action).textContent);
        if (label) {
          const a = document2.createElement("a");
          a.href = action.getAttribute("href") || "#";
          a.textContent = label;
          const p = document2.createElement("p");
          p.append(a);
          textNodes.push(p);
        }
      }
      if (!image && !textNodes.length) return;
      cells.push([image, hinted("text", textNodes)]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-stats", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-standout.js
  function parse3(element, { document: document2 }) {
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    const hinted = (field, nodes) => {
      const list = nodes.filter(Boolean);
      if (!list.length) return "";
      const frag = document2.createDocumentFragment();
      frag.appendChild(document2.createComment(` field:${field} `));
      list.forEach((n) => frag.appendChild(n));
      return frag;
    };
    const make = (tag, text) => {
      const el = document2.createElement(tag);
      el.textContent = text;
      return el;
    };
    const cells = [];
    const heading = element.querySelector('[class*="_intro_"] h2, :scope > h2, h2');
    const headingText = clean(heading && heading.textContent);
    if (headingText) cells.push(["", hinted("text", [make("h2", headingText)])]);
    let tiles = [...element.querySelectorAll('li[class*="_tile_"]')];
    if (!tiles.length) tiles = [...element.querySelectorAll("ul > li")];
    tiles.forEach((tile) => {
      const img = tile.querySelector('[class*="_media_"] img, img');
      const image = img && img.getAttribute("src") ? hinted("image", [img]) : "";
      const titleEl = tile.querySelector('h3, h4, [class*="_title_"]');
      const title = clean(titleEl && titleEl.textContent);
      const bodyEl = tile.querySelector('[class*="_body_"]');
      const textNodes = [];
      if (title) textNodes.push(make("h3", title));
      if (bodyEl) {
        const ps = [...bodyEl.querySelectorAll("p")];
        if (ps.length) ps.forEach((p) => {
          const t = clean(p.textContent);
          if (t) textNodes.push(make("p", t));
        });
        else if (clean(bodyEl.textContent)) textNodes.push(make("p", clean(bodyEl.textContent)));
      }
      if (!image && !textNodes.length) return;
      cells.push([image, hinted("text", textNodes)]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-standout", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/checklist.js
  function parse4(element, { document: document2 }) {
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    const hinted = (field, nodes) => {
      const list = nodes.filter(Boolean);
      if (!list.length) return "";
      const frag = document2.createDocumentFragment();
      frag.appendChild(document2.createComment(` field:${field} `));
      list.forEach((n) => frag.appendChild(n));
      return frag;
    };
    const img = element.querySelector('[class*="_splitMedia_"] img, img');
    const copy = element.querySelector('[class*="_splitCopy_"]') || element;
    const textNodes = [];
    const headingEl = copy.querySelector("h2, h1, h3");
    if (headingEl && clean(headingEl.textContent)) {
      const h2 = document2.createElement("h2");
      h2.textContent = clean(headingEl.textContent);
      textNodes.push(h2);
    }
    const items = [...copy.querySelectorAll("ul > li")];
    if (items.length) {
      const ul = document2.createElement("ul");
      items.forEach((li) => {
        const titleEl = li.querySelector('[class*="_benefitTitle_"], strong, b');
        const title = clean(titleEl && titleEl.textContent);
        const full = clean(li.textContent);
        const desc = title && full.startsWith(title) ? clean(full.slice(title.length)) : title ? "" : full;
        const nli = document2.createElement("li");
        if (title) {
          const strong = document2.createElement("strong");
          strong.textContent = title;
          nli.append(strong);
          if (desc) nli.append(document2.createTextNode(` ${desc}`));
        } else {
          nli.textContent = desc;
        }
        if (clean(nli.textContent)) ul.append(nli);
      });
      if (ul.children.length) textNodes.push(ul);
    }
    const ctaEl = copy.querySelector("a[href], button");
    if (ctaEl) {
      const labelEl = ctaEl.querySelector('[class*="_label_"]');
      const label = clean((labelEl || ctaEl).textContent);
      if (label) {
        const a = document2.createElement("a");
        a.href = ctaEl.getAttribute("href") || "#solutions";
        a.textContent = label;
        const p = document2.createElement("p");
        p.append(a);
        textNodes.push(p);
      }
    }
    if (!img && !textNodes.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [
      [img ? hinted("image", [img]) : ""],
      [hinted("text", textNodes)]
    ];
    const block = WebImporter.Blocks.createBlock(document2, { name: "checklist", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-solutions.js
  function parse5(element, { document: document2 }) {
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    const hinted = (field, nodes) => {
      const list = nodes.filter(Boolean);
      if (!list.length) return "";
      const frag = document2.createDocumentFragment();
      frag.appendChild(document2.createComment(` field:${field} `));
      list.forEach((n) => frag.appendChild(n));
      return frag;
    };
    const make = (tag, text) => {
      const el = document2.createElement(tag);
      el.textContent = text;
      return el;
    };
    const linkPara = (href, text) => {
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = href || "#";
      a.textContent = text;
      p.append(a);
      return p;
    };
    const cells = [];
    const intro = element.querySelector(':scope > [class*="_intro_"]');
    if (intro) {
      const nodes = [];
      const h = intro.querySelector("h2, h1");
      if (h && clean(h.textContent)) nodes.push(make("h2", clean(h.textContent)));
      intro.querySelectorAll("p").forEach((p) => {
        if (clean(p.textContent)) nodes.push(make("p", clean(p.textContent)));
      });
      if (nodes.length) cells.push(["", hinted("text", nodes)]);
    }
    let tiles = [...element.querySelectorAll(':scope > ul[class*="_contents_"] > li')];
    if (!tiles.length) tiles = [...element.querySelectorAll(":scope > ul > li")];
    tiles.forEach((tile) => {
      const nested = [...tile.querySelectorAll(":scope > ul > li")];
      if (nested.length) {
        nested.forEach((cellLi) => {
          const img2 = cellLi.querySelector("img");
          if (img2 && img2.getAttribute("src")) {
            const hidden = cellLi.querySelector('[class*="_root_1fklp_"]');
            const name = clean(img2.getAttribute("alt")) || clean(hidden && hidden.textContent) || clean(cellLi.textContent);
            img2.setAttribute("alt", name);
            cells.push([hinted("image", [img2]), ""]);
            return;
          }
          const label = clean(cellLi.textContent);
          if (label) cells.push(["", hinted("text", [make("h3", label)])]);
        });
        return;
      }
      const img = tile.querySelector('[class*="_media_"] img, img');
      const image = img && img.getAttribute("src") ? hinted("image", [img]) : "";
      const nodes = [];
      const titleEl = tile.querySelector("h3, h2, h4");
      const title = clean(titleEl && titleEl.textContent);
      const titleLink = titleEl && titleEl.querySelector("a[href]");
      if (title) {
        const h3 = document2.createElement("h3");
        if (titleLink) {
          const a = make("a", title);
          a.href = titleLink.getAttribute("href");
          h3.append(a);
        } else {
          h3.textContent = title;
        }
        nodes.push(h3);
      }
      const body = tile.querySelector('[class*="_body_"]');
      if (body && clean(body.textContent)) nodes.push(make("p", clean(body.textContent)));
      const tags = [...tile.querySelectorAll('ul[class*="_tags_"] > li, [class*="_extra_"] li')].filter((li, i, arr) => arr.indexOf(li) === i);
      if (tags.length) {
        const ul = document2.createElement("ul");
        tags.forEach((li) => {
          if (clean(li.textContent)) ul.append(make("li", clean(li.textContent)));
        });
        if (ul.children.length) nodes.push(ul);
      }
      const foot = tile.querySelector('[class*="_foot_"]');
      const ctaLink = foot && foot.querySelector("a[href]") || tile.querySelector(":scope a[href]");
      const ctaText = clean((ctaLink || foot || {}).textContent);
      if (ctaText) nodes.push(linkPara(ctaLink ? ctaLink.getAttribute("href") : titleLink && titleLink.getAttribute("href"), ctaText));
      if (!image && !nodes.length) return;
      cells.push([image, hinted("text", nodes)]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-solutions", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/calculator-impact.js
  function parse6(element, { document: document2 }) {
    const SIGNUP_URL = "https://signup-eagle.upscapital.com/en/sign-up";
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    const text = (el) => clean(el && el.textContent);
    const cell = (field, nodes) => {
      const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
      if (!list.length) return "";
      const frag = document2.createDocumentFragment();
      frag.appendChild(document2.createComment(` field:${field} `));
      list.forEach((n) => frag.appendChild(n));
      return frag;
    };
    const tnode = (t) => t ? document2.createTextNode(t) : null;
    const make = (tag, t) => {
      if (!t) return null;
      const el = document2.createElement(tag);
      el.textContent = t;
      return el;
    };
    const cells = [];
    const row = (type, labelNodes, value) => {
      const label = cell("label", labelNodes);
      const val = value ? cell("value", tnode(value)) : "";
      if (!label && !val) return;
      cells.push([cell("type", tnode(type)), label, val]);
    };
    const introEl = element.querySelector(':scope > [class*="_intro_"]') || element;
    const h = introEl.querySelector("h2, h1, h3");
    const lead = introEl.querySelector('p[class*="_ccLead_"]') || h && h.parentElement.querySelector(":scope > p");
    if (h || lead) row("intro", [make("h2", text(h)), make("p", text(lead))]);
    let sliders = [...element.querySelectorAll('[class*="_slider_"][role="group"]')];
    if (!sliders.length) sliders = [...element.querySelectorAll('[role="group"]')];
    sliders.forEach((s) => {
      const input = s.querySelector('input[type="range"]');
      const value = text(s.querySelector("output")) || clean(input && (input.getAttribute("aria-valuetext") || input.value));
      row("input", make("p", text(s.querySelector("label"))), value);
    });
    const figure = element.querySelector('p[class*="_figure_"]');
    if (figure) {
      const amount = text(figure.querySelector('[class*="_amount_"]'));
      const after = text(figure.querySelector('[class*="_after_"]'));
      row("result", make("p", after || text(figure)), amount);
    }
    let vizRows = [...element.querySelectorAll('[class*="_row_1ggqz_"]')];
    if (!vizRows.length) vizRows = [...element.querySelectorAll("figure [data-row]")];
    vizRows.forEach((r) => {
      const head = r.querySelector('[class*="_head_"]') || r;
      const label = text(head.querySelector('[class*="_label_"]'));
      const count = text(head.querySelector('[class*="_count_"]'));
      if (label || count) row("result", make("p", label), count);
    });
    const keyItems = [...element.querySelectorAll('[class*="_keyItem_"]')];
    const legend = keyItems.map(text).filter(Boolean).join(" ") || text(element.querySelector('[class*="_keyRow_"]'));
    if (legend) row("legend", make("p", legend));
    const summary = text(element.querySelector('p[class*="_multiple_"]'));
    if (summary) row("summary", make("p", summary));
    const note = text(element.querySelector('p[class*="_note_"]'));
    if (note) row("disclaimer", make("p", note));
    const foot = element.querySelector('[class*="_foot_"]') || element;
    const ctaEl = foot.querySelector("a[href], button");
    const sideNote = text(foot.querySelector('p[class*="_premiums_"]') || foot.querySelector("p"));
    if (ctaEl) {
      const labelEl = ctaEl.querySelector('[class*="_label_"]');
      const a = document2.createElement("a");
      a.href = ctaEl.getAttribute("href") || SIGNUP_URL;
      a.textContent = text(labelEl || ctaEl);
      const p = document2.createElement("p");
      p.append(a);
      row("cta", p, sideNote);
    } else if (sideNote) {
      row("cta", null, sideNote);
    }
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "calculator-impact", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-case-study.js
  function parse7(element, { document: document2 }) {
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    const hinted = (field, nodes) => {
      const list = nodes.filter(Boolean);
      if (!list.length) return "";
      const frag = document2.createDocumentFragment();
      frag.appendChild(document2.createComment(` field:${field} `));
      list.forEach((n) => frag.appendChild(n));
      return frag;
    };
    const link = (href, t) => {
      const a = document2.createElement("a");
      a.href = href || "#";
      a.textContent = t;
      return a;
    };
    let tiles = [...element.querySelectorAll(':scope > li[class*="_tile_"]')];
    if (!tiles.length) tiles = [...element.querySelectorAll(":scope > li")];
    const cells = [];
    tiles.forEach((tile) => {
      const img = tile.querySelector('[class*="_media_"] img, img');
      const image = img && img.getAttribute("src") ? hinted("image", [img]) : "";
      const nodes = [];
      const titleEl = tile.querySelector("h3, h2, h4");
      const titleLink = titleEl && titleEl.querySelector("a[href]") || tile.querySelector("a[href]");
      const href = titleLink ? titleLink.getAttribute("href") : "";
      const title = clean(titleEl && titleEl.textContent);
      if (title) {
        const h3 = document2.createElement("h3");
        h3.append(href ? link(href, title) : document2.createTextNode(title));
        nodes.push(h3);
      }
      const body = tile.querySelector('[class*="_body_"]');
      if (body) {
        const ps = [...body.querySelectorAll("p")];
        const texts = ps.length ? ps.map((p) => clean(p.textContent)) : [clean(body.textContent)];
        texts.filter(Boolean).forEach((t) => {
          const p = document2.createElement("p");
          p.textContent = t;
          nodes.push(p);
        });
      }
      const foot = tile.querySelector('[class*="_foot_"]');
      const footLink = foot && foot.querySelector("a[href]");
      const ctaText = clean(foot && foot.textContent);
      if (ctaText) {
        const p = document2.createElement("p");
        p.append(link(footLink ? footLink.getAttribute("href") : href, ctaText));
        nodes.push(p);
      }
      if (!image && !nodes.length) return;
      cells.push([image, hinted("text", nodes)]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-case-study", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-comparison.js
  function parse8(element, { document: document2 }) {
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    const make = (tag, t) => {
      const el = document2.createElement(tag);
      el.textContent = t;
      return el;
    };
    let tiles = [...element.querySelectorAll(":scope > li")];
    if (!tiles.length) tiles = [...element.querySelectorAll('li[class*="_tile_"]')];
    const cells = [];
    const header = [];
    let current = null;
    tiles.forEach((tile) => {
      const headCell = tile.querySelector('[class*="_headCell_"]');
      const area = tile.querySelector('[class*="_areaCell_"]');
      const answers = [...tile.querySelectorAll('[class*="_answer_"]')].filter((a) => !a.querySelector('[class*="_answer_"]'));
      if (headCell) {
        const h2 = headCell.querySelector("h2, h1, h3");
        header.push(make("h2", clean((h2 || headCell).textContent)));
        return;
      }
      if (area) {
        const topic = [];
        const img = area.querySelector("img");
        if (img && img.getAttribute("src")) {
          const p = document2.createElement("p");
          p.append(img);
          topic.push(p);
        }
        const h2 = area.querySelector("h3, h4, h2");
        if (h2 && clean(h2.textContent)) topic.push(make("h3", clean(h2.textContent)));
        current = [topic, "", ""];
        cells.push(current);
        return;
      }
      if (answers.length) {
        const values = answers.map((ans) => {
          const valueEl = ans.querySelector('[class*="_vsCarrier_"], [class*="_vsOurs_"]');
          if (valueEl) return clean(valueEl.textContent);
          const tag = ans.querySelector('[class*="_answerTag_"]');
          const full = clean(ans.textContent);
          const tagText = clean(tag && tag.textContent);
          return tagText && full.startsWith(tagText) ? clean(full.slice(tagText.length)) : full;
        });
        if (!current) {
          current = ["", "", ""];
          cells.push(current);
        }
        values.slice(0, 2).forEach((v, i) => {
          current[i + 1] = v ? make("p", v) : "";
        });
        current = null;
        return;
      }
      const h = tile.querySelector("h3, h2, h4");
      if (h && clean(h.textContent)) header.push(make("h3", clean(h.textContent)));
    });
    if (header.length) {
      while (header.length < 3) header.push("");
      cells.unshift(header.slice(0, 3));
    }
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-comparison", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion.js
  function parse9(element, { document: document2 }) {
    const PLACEHOLDER = "Answer to be supplied.";
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    const hinted = (field, nodes) => {
      const list = nodes.filter(Boolean);
      if (!list.length) return "";
      const frag = document2.createDocumentFragment();
      frag.appendChild(document2.createComment(` field:${field} `));
      list.forEach((n) => frag.appendChild(n));
      return frag;
    };
    let items = [...element.querySelectorAll('[class*="_faqItem_"]')];
    if (!items.length) items = [...element.querySelectorAll('[class*="_disclosure_"]')];
    if (!items.length) items = [...element.querySelectorAll(":scope > div")];
    const cells = [];
    items.forEach((item) => {
      const labelEl = item.querySelector('[class*="_label_"]') || item.querySelector("h3, h2, h4") || item.querySelector("button");
      const question = clean(labelEl && labelEl.textContent);
      if (!question) return;
      const trigger = item.querySelector("[aria-controls]");
      const panelId = trigger && trigger.getAttribute("aria-controls");
      let panel = panelId ? item.querySelector(`[id="${panelId}"]`) : null;
      if (!panel) panel = item.querySelector('[role="region"], [class*="_panel_"], [class*="_content_"]');
      const answerNodes = [];
      if (panel && clean(panel.textContent)) {
        const blocks = [...panel.querySelectorAll("p, ul, ol")].filter((n) => !n.parentElement.closest("p, ul, ol"));
        if (blocks.length) blocks.forEach((n) => answerNodes.push(n));
        else {
          const p = document2.createElement("p");
          p.textContent = clean(panel.textContent);
          answerNodes.push(p);
        }
      } else {
        const p = document2.createElement("p");
        p.textContent = PLACEHOLDER;
        answerNodes.push(p);
      }
      cells.push([
        hinted("summary", [document2.createTextNode(question)]),
        hinted("text", answerNodes)
      ]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/compe-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var IMG_DIR = "./images/";
  var CONTENT_SVG_SELECTOR = "svg._header_o2xeh_2, svg._illustrationSvg_15dwb_549, svg._fill_o2xeh_10";
  var SECTION_SVG_EXPORTS = [
    {
      section: "#stats",
      files: [
        "section-header-art-1c5de68bf2a9.svg",
        "section-header-art-41f080a125d0.svg",
        "section-header-art-b66fdb06d8ee.svg"
      ]
    },
    {
      section: "#standout",
      files: [
        "illustration-ca639c1e7e5a.svg",
        "illustration-234d5178f8c4.svg",
        "illustration-e01535e04ae3.svg"
      ]
    },
    {
      // Benefits section has no id
      section: "#main > section._section_cwncx_50:not([id])",
      files: ["illustration-cd25dd21c162.svg"]
    },
    {
      section: "#solutions",
      files: [
        "illustration-b1ca7420a837.svg",
        "svg-7bdb93bcc1fe.svg",
        "illustration-3d350cfdb6c5.svg",
        "illustration-cc4e5ab154a5.svg"
      ]
    },
    {
      section: "#difference",
      files: [
        "illustration-07c833e40d1a.svg",
        "illustration-aaf672e96773.svg",
        "illustration-c8bd71000c18.svg",
        "illustration-1682240576af.svg"
      ]
    }
  ];
  var LOGO_FILES = {
    shopify: "eefd3b4505fd518b237dceedb803169e.png",
    shipstation: "8cec9a5cc70b48b2d3707e470908d9a0.png",
    "pirate ship": "4b440b93ac318facf0c5bca31d799006.png",
    aftership: "aab7cf18b17c0cbf6b151f56f86ec5b4.png",
    woocommerce: "logo-woocommerce.svg"
  };
  function makeImg(doc, file, alt) {
    const img = doc.createElement("img");
    img.setAttribute("src", `${IMG_DIR}${file}`);
    img.setAttribute("alt", alt || "");
    return img;
  }
  function isTopLevelSvg(svg) {
    return !(svg.parentElement && svg.parentElement.closest("svg"));
  }
  function transform(hookName, element, payload) {
    const doc = element.ownerDocument || document;
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "div._skip_cwncx_23",
        // "Skip to content" link (a[href="/#main"])
        "header._header_iujfl_6",
        // logo + anchor nav + Menu/"Prototype" buttons
        "footer._footer_5ea31_5",
        // footer -> footer fragment
        "aside._dock_3e6tw_5"
        // floating "Get shipping insurance" dock (inert)
      ]);
      WebImporter.DOMUtils.remove(element, [
        "div._root_16xtn_5",
        "div._root_1eyyg_7",
        "canvas"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "span._root_1fklp_2[aria-live]",
        "#stats span._srOnly_15dwb_243"
      ]);
      SECTION_SVG_EXPORTS.forEach(({ section, files }) => {
        const sectionEl = element.querySelector(section);
        if (!sectionEl) return;
        const svgs = [...sectionEl.querySelectorAll(CONTENT_SVG_SELECTOR)].filter(isTopLevelSvg);
        svgs.forEach((svg, i) => {
          if (i < files.length) svg.replaceWith(makeImg(doc, files[i], ""));
        });
      });
      element.querySelectorAll("#solutions li._logoCell_27cwx_322 span._logoMask_27cwx_327").forEach((mask) => {
        const target = mask.closest("button, h4") || mask.parentElement;
        const nameEl = target && target.querySelector("span._root_1fklp_2");
        const name = nameEl ? nameEl.textContent.trim() : "";
        const file = LOGO_FILES[name.toLowerCase()];
        if (file) mask.replaceWith(makeImg(doc, file, name));
        else mask.remove();
      });
      element.querySelectorAll("svg").forEach((svg) => {
        if (svg.isConnected) svg.remove();
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        "aside",
        "canvas",
        "svg",
        "noscript",
        "link",
        "iframe"
      ]);
      element.querySelectorAll('[aria-hidden="true"]').forEach((el) => {
        if (!el.isConnected) return;
        if (el.textContent.trim()) return;
        if (el.querySelector("img, picture, video")) return;
        el.remove();
      });
      element.querySelectorAll("[data-rac], [data-react-aria-pressable]").forEach((el) => {
        el.removeAttribute("data-rac");
        el.removeAttribute("data-react-aria-pressable");
      });
    }
  }

  // tools/importer/transformers/compe-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function breakAnchor(el) {
    let node = el;
    while (node.parentElement && node.parentElement.tagName !== "MAIN" && node.parentElement.tagName !== "BODY" && node.parentElement.children.length === 1) {
      node = node.parentElement;
    }
    return node;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    const doc = element.ownerDocument || document;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = doc.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        breakAnchor(sectionEl).before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
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

  // tools/importer/import-comp-e.js
  var parsers = {
    "calculator-premium": parse,
    "cards-stats": parse2,
    "cards-standout": parse3,
    "checklist": parse4,
    "cards-solutions": parse5,
    "calculator-impact": parse6,
    "cards-case-study": parse7,
    "columns-comparison": parse8,
    "accordion": parse9
  };
  var PAGE_TEMPLATE = {
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
  var TARGET_PATH = "/us/en/comp-e";
  var SOURCE_IMAGE_PREFIX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/images\//;
  var LOCAL_IMAGE_PREFIX = "./images/comp-e/";
  function localizeImages(main) {
    main.querySelectorAll("img[src]").forEach((img) => {
      const src = img.getAttribute("src");
      if (SOURCE_IMAGE_PREFIX.test(src)) {
        img.setAttribute("src", src.replace(SOURCE_IMAGE_PREFIX, LOCAL_IMAGE_PREFIX));
      }
    });
  }
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
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
  var import_comp_e_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
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
      localizeImages(main);
      const path = WebImporter.FileUtils.sanitizePath(TARGET_PATH);
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
  return __toCommonJS(import_comp_e_exports);
})();
