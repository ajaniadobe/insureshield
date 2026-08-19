/* eslint-disable no-console */
/**
 * Generate JCR XML from Markdown via @adobe/helix-md2jcr, then post-process the
 * output so it is guaranteed well-formed XML.
 *
 * Why the post-process step exists:
 *   The `reference` component (used for image fields) serializes the source
 *   image URL verbatim into an XML attribute. Scene7 / Dynamic Media URLs carry
 *   raw `&` query separators (e.g. `?$UPSer_Preset$&wid=1280&hei=720`). A bare
 *   `&` is illegal in XML attributes, so md2jcr's output would be malformed and
 *   fail to import. This script escapes any bare `&` to `&amp;` (without
 *   double-encoding existing entities) and then validates the result parses.
 *
 * Usage:
 *   node tools/generate-jcr.js <path-to.md | directory> [--ue-files <dir>]
 *
 *   --ue-files defaults to the repo root (where component-*.json live).
 *
 * When authoring the source markdown, build block grid tables with the helpers
 * in tools/lib/gridtable.js — they compute column widths from content so tables
 * are always uniform-width (md2jcr silently drops a block if any line overflows
 * the border).
 *
 * The generated `<base>.xml` is written next to each input `.md`, matching the
 * behaviour of the underlying md2jcr CLI.
 */
import { spawnSync } from 'child_process';
import {
  readFileSync, writeFileSync, statSync, readdirSync,
} from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(scriptPath), '..');
const requireFrom = createRequire(import.meta.url);

const MD2JCR_PKG = '@adobe/helix-md2jcr';

/**
 * Escape bare ampersands that are not already part of a valid XML entity.
 * Leaves `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&apos;` and numeric char refs
 * (`&#123;` / `&#x1F;`) untouched, so it is safe to run repeatedly.
 * @param {string} xml raw XML text
 * @returns {{ xml: string, count: number }} normalized XML and number of fixes
 */
export function escapeBareAmpersands(xml) {
  const bare = /&(?!amp;|lt;|gt;|quot;|apos;|#x?[0-9a-fA-F]+;)/g;
  const count = (xml.match(bare) || []).length;
  return { xml: xml.replace(bare, '&amp;'), count };
}

/**
 * Escape raw `<` / `>` that appear INSIDE double-quoted attribute values. These
 * are always illegal there (AEM package creation rejects "Unescaped '<' not
 * allowed in attributes values"), and md2jcr can emit them when a field holds
 * HTML — e.g. a template-default like `text="<p>Tab content</p>"`. Only the
 * attribute-value regions are touched, so real element tags are left intact.
 * Idempotent: existing `&lt;`/`&gt;` are not re-escaped.
 * @param {string} xml raw XML text
 * @returns {{ xml: string, count: number }} normalized XML and number of fixes
 */
export function escapeAngleBracketsInAttributes(xml) {
  let count = 0;
  // match name="...": the value is everything up to the next unescaped quote.
  const attr = /([\w:.-]+)="([^"]*)"/g;
  const out = xml.replace(attr, (whole, name, value) => {
    if (value.indexOf('<') === -1 && value.indexOf('>') === -1) return whole;
    const fixed = value.replace(/</g, () => { count += 1; return '&lt;'; })
      .replace(/>/g, () => { count += 1; return '&gt;'; });
    return `${name}="${fixed}"`;
  });
  return { xml: out, count };
}

/**
 * Assert that a string is well-formed XML; throws with location on failure.
 * Uses `saxes` when resolvable (it ships transitively with helix-md2jcr's
 * toolchain); otherwise falls back to a lightweight bare-`&` scan so the tool
 * never hard-crashes on a minimal install.
 * @param {string} xml the XML to validate
 * @param {string} label file label for error messages
 */
export function assertWellFormed(xml, label) {
  let SaxesParser;
  try {
    // saxes is an optional transitive dep of the md2jcr toolchain; not required.
    // eslint-disable-next-line import/no-extraneous-dependencies, global-require
    ({ SaxesParser } = requireFrom('saxes'));
  } catch {
    SaxesParser = null;
  }

  if (SaxesParser) {
    const parser = new SaxesParser({ xmlns: false });
    let error = null;
    parser.on('error', (e) => { error = e; });
    parser.write(xml).close();
    if (error) throw new Error(`${label} is not well-formed XML: ${error.message}`);
    return;
  }

  // Fallback: catch the failure mode this tool produces — a bare `&`.
  if (/&(?!amp;|lt;|gt;|quot;|apos;|#x?[0-9a-fA-F]+;)/.test(xml)) {
    throw new Error(`${label} still contains a bare ampersand after normalization`);
  }
}

/**
 * Post-process a single generated .xml file so it is valid for AEM package
 * import: escape bare ampersands, then escape raw `<`/`>` inside attribute
 * values, then validate well-formedness.
 * @param {string} xmlPath absolute path to the .xml file
 * @returns {number} total number of characters escaped
 */
export function normalizeXmlFile(xmlPath) {
  const raw = readFileSync(xmlPath, 'utf-8');
  const amp = escapeBareAmpersands(raw);
  const ang = escapeAngleBracketsInAttributes(amp.xml);
  const total = amp.count + ang.count;
  if (total > 0) writeFileSync(xmlPath, ang.xml);
  assertWellFormed(ang.xml, path.relative(repoRoot, xmlPath));
  return total;
}

/**
 * Collect the .xml siblings md2jcr just produced for the given .md inputs.
 * @param {string} inputPath the .md file or directory passed to md2jcr
 * @returns {string[]} absolute paths of generated .xml files
 */
function collectXmlOutputs(inputPath) {
  const resolved = path.resolve(repoRoot, inputPath);
  if (statSync(resolved).isDirectory()) {
    return readdirSync(resolved)
      .filter((f) => f.endsWith('.md'))
      .map((f) => path.join(resolved, `${path.basename(f, '.md')}.xml`));
  }
  const dir = path.dirname(resolved);
  const base = path.basename(resolved, '.md');
  return [path.join(dir, `${base}.xml`)];
}

function parseArgs(args) {
  let ueFiles = repoRoot;
  const positional = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--ue-files') {
      ueFiles = args[i + 1] || repoRoot;
      i += 1;
    } else if (!args[i].startsWith('--')) {
      positional.push(args[i]);
    }
  }
  return { inputPath: positional[0], ueFiles };
}

function run() {
  const { inputPath, ueFiles } = parseArgs(process.argv.slice(2));

  if (!inputPath) {
    console.error('Usage: node tools/generate-jcr.js <path-to.md | directory> [--ue-files <dir>]');
    process.exit(1);
  }

  // 1. Run md2jcr (via npx so it works without a declared dependency).
  const result = spawnSync(
    'npx',
    [MD2JCR_PKG, inputPath, '--ue-files', ueFiles],
    { cwd: repoRoot, encoding: 'utf-8' },
  );
  if (result.stdout) process.stdout.write(result.stdout);
  // md2jcr prints model-mapping errors to stderr and still exits 0, so scan it.
  const stderr = result.stderr || '';
  if (result.status !== 0 || /has errors!|Error:/.test(stderr)) {
    process.stderr.write(stderr);
    console.error('\n❌ md2jcr failed — JCR was not generated correctly.');
    process.exit(result.status || 1);
  }

  // 2. Normalize + validate each generated XML.
  const total = collectXmlOutputs(inputPath).reduce((sum, xmlPath) => {
    try {
      const fixed = normalizeXmlFile(xmlPath);
      console.log(`✅ ${path.relative(repoRoot, xmlPath)} — ${fixed} char(s) escaped, well-formed`);
      return sum + fixed;
    } catch (err) {
      console.error(`❌ ${err.message}`);
      return process.exit(1);
    }
  }, 0);
  console.log(`Done. ${total} char(s) escaped across generated JCR.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
