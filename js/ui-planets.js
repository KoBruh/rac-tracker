// Planets tab: one row per planet with its gold bolts as squares.
// SPDX-License-Identifier: GPL-3.0-or-later
import { h, square } from './dom.js';

export function renderPlanets(panel, state, actions) {
  if (!state.summary) {
    panel.replaceChildren(h('div.empty',
      h('h2.h2', 'No save open'),
      h('p', 'Open a save to see the gold bolts on each planet.'),
      h('button.btn.btn-primary', { type: 'button', onclick: actions.open }, 'Open save'),
    ));
    return;
  }
  const { planets, goldBolts } = state.summary;
  panel.replaceChildren(
    h('div.planets-head',
      h('h2.h2', 'Planets'),
      h('span.label.dim', `Gold bolts ${goldBolts.found}/${goldBolts.total}`),
    ),
    h('ol.planet-list', planets.map((p) => {
      const done = p.total > 0 && p.found === p.total;
      const cls = [p.current && '.is-current', !p.unlocked && '.is-locked', done && '.is-done'].filter(Boolean).join('');
      const label = p.total
        ? `${p.name}: ${p.found} of ${p.total} gold bolts${p.current ? ', save is here' : ''}${p.unlocked ? '' : ', locked'}`
        : `${p.name}: no gold bolts${p.current ? ', save is here' : ''}${p.unlocked ? '' : ', locked'}`;
      return h(`li.planet${cls}`, { 'aria-label': label },
        h('div',
          h('div.pname', p.name),
          (p.current || !p.unlocked) && h('div.meta',
            p.current && h('span.tag.here.label', 'Save is here'),
            !p.unlocked && h('span.tag.label', 'Locked'),
          ),
        ),
        h('div.bolts', { 'aria-hidden': 'true' },
          p.total
            ? [h('span.sqs', p.bolts.map((b) => square(b))), h('span.count', `${p.found}/${p.total}`)]
            : h('span.none.label', 'No bolts'),
        ),
      );
    })),
  );
}
