/* eslint-env mocha */
import { expect } from 'chai';
import { stackedGridTable, gridTable } from '../../tools/lib/gridtable.js';
import { escapeBareAmpersands, escapeAngleBracketsInAttributes } from '../../tools/generate-jcr.js';

/**
 * The md2jcr grid-table parser requires every line of a table to share the
 * exact same width; a single overflowing line silently collapses the block to
 * a raw text node. These tests lock in that the generator always emits
 * uniform-width tables, regardless of content length.
 */
function widths(md) {
  return [...new Set(md.split('\n').map((l) => l.length))];
}

describe('grid-table generator', () => {
  describe('stackedGridTable', () => {
    it('emits uniform width even with a very long content line', () => {
      const md = stackedGridTable('Checklist', [
        ['<!-- field:image -->', '', '![alt][image2]'],
        [
          '## A heading',
          '',
          '- **Recover faster when issues happen**Handle disputes, claims, and delivery exceptions with less manual delay.',
        ],
      ]);
      expect(widths(md)).to.have.lengthOf(1);
    });

    it('starts and ends with a border row', () => {
      const md = stackedGridTable('Hero', [['![a][i]'], ['# Title']]);
      const lines = md.split('\n');
      expect(lines[0]).to.match(/^\+-+\+$/);
      expect(lines[lines.length - 1]).to.match(/^\+-+\+$/);
    });

    it('preserves the block name (including a variant) in the header row', () => {
      const md = stackedGridTable('Hero Commerce (hero split)', [['x']]);
      expect(md.split('\n')[1]).to.contain('Hero Commerce (hero split)');
    });
  });

  describe('gridTable (multi-column)', () => {
    it('emits uniform width across a ragged multi-column table', () => {
      const md = gridTable('Tabs', [
        [['Find Risk Earlier'], ['![][image3]'], ['### Find Risk Earlier', '', 'Score each order.']],
        [['See The Full Picture'], ['![][image3]'], ['### See The Full Picture']],
      ]);
      expect(widths(md)).to.have.lengthOf(1);
    });

    it('spans the header across the full table width', () => {
      const md = gridTable('Tabs', [[['a'], ['b']]]);
      const lines = md.split('\n');
      expect(lines[1].length).to.equal(lines[0].length);
      expect(lines[1]).to.contain('Tabs');
    });
  });
});

describe('JCR XML escaping (generate-jcr)', () => {
  it('escapes bare ampersands but not existing entities', () => {
    expect(escapeBareAmpersands('a?x=1&y=2').xml).to.equal('a?x=1&amp;y=2');
    expect(escapeBareAmpersands('safe &amp; &#x26;').xml).to.equal('safe &amp; &#x26;');
  });

  it('escapes raw < and > inside attribute values', () => {
    const { xml } = escapeAngleBracketsInAttributes('text="<p>Hi</p>"');
    expect(xml).to.equal('text="&lt;p&gt;Hi&lt;/p&gt;"');
  });

  it('leaves real element tags and existing entities untouched (idempotent)', () => {
    expect(escapeAngleBracketsInAttributes('<real>tag</real>').xml).to.equal('<real>tag</real>');
    expect(escapeAngleBracketsInAttributes('a="&lt;ok&gt;"').xml).to.equal('a="&lt;ok&gt;"');
  });
});
