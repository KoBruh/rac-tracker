// Save tab: open a save, what was read, and where to find the file.
// SPDX-License-Identifier: GPL-3.0-or-later
import { h, icon, ICONS, timeText } from './dom.js';

const DISCS = [
  ['PAL v1.00 / v2.00', 'SCES_509.16', 'BESCES-50916RATCHET'],
  ['NTSC-U', 'SCUS_971.99', 'the one folder inside'],
  ['NTSC-J', 'SCPS_150.37', 'the one folder inside'],
];

export function renderSave(panel, state, actions) {
  const { file, summary, error } = state;
  panel.replaceChildren(h('div.save',
    h('h2.h2', 'Save file'),

    error && h('div.alert', { role: 'alert' },
      h('span.label', error.title),
      h('p', error.detail),
    ),

    file && summary && h('dl.facts',
      h('dt.label', 'File'), h('dd.path', file.name),
      h('dt.label', 'Read at'), h('dd.num', timeText(file.readAt)),
      h('dt.label', 'Planet'), h('dd', summary.planetName),
    ),

    h('div',
      h('button.btn.btn-primary.btn-wide', { type: 'button', onclick: actions.open },
        icon(ICONS.open), file ? 'Open save again' : 'Open save'),
      file && h('p.fine', { style: 'margin-top: 8px' },
        'After you save in game or fly to another planet, open the file again to see the change.'),
    ),

    h('section.help', { 'aria-labelledby': 'where-h' },
      h('h2.h2', { id: 'where-h' }, 'Where is my save?'),
      h('p', 'OpenRAC keeps one file per save slot: save0.bin to save4.bin.'),
      h('p.label.dim', 'Android'),
      h('ol',
        h('li', 'Tap Open save. In the picker, open the side menu and pick OpenRAC.'),
        h('li', 'Open Saves and settings, then memcard.'),
        h('li', 'Open your disc’s serial folder, then the game folder, and pick ', h('span.path', 'saveN.bin'), '.'),
      ),
      h('ul.discs', DISCS.map(([disc, serial, game]) =>
        h('li', h('span.label.dim', disc), h('span.path', serial, ' / ', game.startsWith('the') ? h('span.dim', `(${game})`) : game)))),
      h('p.dim', 'Skip folders starting with .backup_ and folders ending in -coop.'),
      h('p.label.dim', 'Desktop'),
      h('p', 'Windows ', h('span.path', '%LOCALAPPDATA%\\openrac\\memcard\\…')),
      h('p', 'Linux ', h('span.path', '~/.local/share/openrac/memcard/…')),
      h('p', 'macOS ', h('span.path', '~/Library/Application Support/OpenRAC/memcard/…')),
      h('p.dim', 'If you set a custom save folder in OpenRAC, the memcard folder is there instead.'),
    ),

    h('div.fine',
      h('p', 'Read-only: the tracker never writes to your save. The file is read on this device and never uploaded.'),
      h('p', 'Unofficial fan project. Not affiliated with Sony Interactive Entertainment or Insomniac Games. ',
        h('a', { href: 'https://github.com/KoBruh/rac-tracker' }, 'Source (GPL-3.0)')),
    ),
  ));
}
