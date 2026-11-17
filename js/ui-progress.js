// Progress tab: totals with a segmented bar each, expandable to a checklist.
// SPDX-License-Identifier: GPL-3.0-or-later
import { h, icon, ICONS, square } from './dom.js';

const ROWS = [
  ['goldBolts', 'Gold bolts'],
  ['skillPoints', 'Skill points'],
  ['goldWeapons', 'Gold weapons'],
  ['gadgets', 'Gadgets'],
  ['weapons', 'Weapons'],
  ['planetsUnlocked', 'Planets unlocked'],
];

function readout(key, label, { found, total, list }) {
  const done = found === total;
  // Gold bolts list per planet in the Planets tab; here show only what is missing per planet.
  const items = key === 'goldBolts' ? groupBolts(list) : list;
  return h(`details.readout${done ? '.is-done' : ''}`, { 'data-key': key },
    h('summary', { 'aria-label': `${label}: ${found} of ${total}` },
      h('span.label', label),
      h('span.count', found, h('span.of', `/${total}`)),
      icon(ICONS.caret, 'caret'),
      h('span.segs', { style: `--n:${total}`, 'aria-hidden': 'true' },
        Array.from({ length: total }, (_, i) => h(`span.seg${i < found ? '.on' : ''}`))),
    ),
    h('ul.checklist', items.map((it) =>
      h(`li.check${it.found ? '.is-found' : '.is-missing'}`,
        square(it.found),
        h('span.name', it.name),
        h('span.state.label', it.state ?? (it.found ? 'Got' : 'Missing')),
      ))),
  );
}

function groupBolts(list) {
  const by = new Map();
  for (const b of list) {
    const g = by.get(b.name) ?? { name: b.name, have: 0, total: 0 };
    g.total++; if (b.found) g.have++;
    by.set(b.name, g);
  }
  return [...by.values()].map((g) => ({ name: g.name, found: g.have === g.total, state: `${g.have}/${g.total}` }));
}

export function renderProgress(panel, state, actions) {
  if (!state.summary) {
    panel.replaceChildren(h('div.empty',
      h('h2.h2', 'No save open'),
      h('p', 'Open a saveN.bin from OpenRAC to see your gold bolts, skill points, gold weapons and more. It stays on this device.'),
      h('button.btn.btn-primary', { type: 'button', onclick: actions.open }, icon(ICONS.open), 'Open save'),
    ));
    return;
  }
  const s = state.summary;
  const save = state.save;
  const nanotech = save.nanotech.ultra ? 'Ultra' : save.nanotech.premium ? 'Premium' : 'Standard';
  // Keep open/closed state of each readout across re-renders.
  const open = new Set([...panel.querySelectorAll('details[open]')].map((d) => d.dataset.key));

  panel.replaceChildren(
    h('h2.visually-hidden', 'Progress'),
    h('div.where.label',
      h('span', 'On ', h('span.on', s.planetName)),
      h('span', 'Bolts ', h('span.num', save.bolts.toLocaleString())),
      h('span', 'Nanotech ', h('span.num', nanotech)),
      h('span', 'Max health ', h('span.num', save.maxHealth)),
    ),
    h('div.readouts', ROWS.map(([key, label]) => {
      const el = readout(key, label, s[key]);
      if (open.has(key)) el.open = true;
      return el;
    })),
    h('p.note', 'Skill point names are not filled in yet, so they show by number.'),
  );
}
