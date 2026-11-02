# accordion

Custom **accordion** block. Purpose: faq.

## Authoring (Document Authoring)

Model: `collection`

Repeating rows — one row per item. Each item: [summary | text] - question in the first cell, rich-text answer in the second; rendered as <details>/<summary> items.

## Supported variations

No variations.

## Universal Editor fields

- Content fields derived from the block's decorate contract.
- A separate `-item` model defines one repeated item.
