// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  // each row = one tab: first cell is the label; the remaining cells
  // (image, text) stay as separate panel columns so the CSS can lay them out
  // side-by-side (image right, text left) matching the source.
  const rows = [...block.children];
  rows.forEach((tabpanel, i) => {
    const cells = [...tabpanel.children];
    const label = cells.shift();
    const id = toClassName(label.textContent);

    // tag the image column vs the text column for layout
    cells.forEach((cell) => {
      if (cell.querySelector('picture')) cell.className = 'tabs-panel-image';
      else cell.className = 'tabs-panel-text';
    });
    label.remove();

    // decorate tabpanel
    tabpanel.className = 'tabs-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-tab';
    button.id = `tab-${id}`;
    button.innerHTML = label.innerHTML;
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
  });

  block.prepend(tablist);
}
