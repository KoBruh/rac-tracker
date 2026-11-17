// RaC Tracker entry point.
// SPDX-License-Identifier: GPL-3.0-or-later
import { parseSave, SaveError } from './save.js';
import { loadData, summarize } from './data.js';
import { timeText } from './dom.js';
import { renderProgress } from './ui-progress.js';
import { renderPlanets } from './ui-planets.js';
import { renderSave } from './ui-save.js';

const $ = (id) => document.getElementById(id);
const TABS = ['progress', 'planets', 'save'];
const VIEWS = { progress: renderProgress, planets: renderPlanets, save: renderSave };

// The last save is kept in memory only (Phase 1).
const state = { data: null, save: null, summary: null, file: null, error: null, tab: 'progress' };

const ERRORS = {
  'not-rac1': ['Not a RaC1 save', 'Pick a saveN.bin from OpenRAC’s memcard folder for Ratchet & Clank.'],
  checksum: ['Checksum failed', 'The file is damaged or was copied while the game was writing it. Save again in game, then open it again.'],
  empty: ['Empty slot', 'Nothing has been saved in this slot yet. Pick another saveN.bin.'],
};

const fileInput = $('file');
const actions = { open: () => fileInput.click() };

function render() {
  for (const t of TABS) VIEWS[t]($(`panel-${t}`), state, actions);
  const chip = $('status');
  chip.classList.toggle('is-ok', !!state.file);
  chip.classList.toggle('is-bad', !state.file && !!state.error);
  chip.textContent = state.file ? `Save read ${timeText(state.file.readAt)}` : state.error ? 'Save error' : 'No save';
}

function selectTab(name, focus = false) {
  state.tab = name;
  for (const t of TABS) {
    const on = t === name;
    const tab = $(`tab-${t}`);
    tab.setAttribute('aria-selected', String(on));
    tab.tabIndex = on ? 0 : -1;
    $(`panel-${t}`).hidden = !on;
  }
  if (focus) $(`tab-${name}`).focus();
  window.scrollTo(0, 0);
}

function setupTabs() {
  for (const t of TABS) $(`tab-${t}`).addEventListener('click', () => selectTab(t));
  $('tab-progress').parentElement.addEventListener('keydown', (e) => {
    const i = TABS.indexOf(state.tab);
    const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: TABS.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    selectTab(TABS[(next + TABS.length) % TABS.length], true);
  });
}

async function readFile(file) {
  let bytes;
  try {
    bytes = await file.arrayBuffer();
  } catch {
    state.error = { title: 'Could not read the file', detail: 'The browser could not open it. Try picking it again.' };
    render(); selectTab('save');
    return;
  }
  try {
    const save = parseSave(bytes);
    state.save = save;
    state.summary = summarize(save, state.data);
    state.file = { name: file.name, readAt: new Date() };
    state.error = null;
    render();
    selectTab('progress');
  } catch (e) {
    if (!(e instanceof SaveError)) throw e;
    const [title, hint] = ERRORS[e.code];
    state.error = { title, detail: `${file.name}: ${hint}` };
    render();
    selectTab('save');
  }
}

fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0];
  fileInput.value = ''; // so the same file can be opened again after it changes
  if (file) readFile(file);
});

async function start() {
  setupTabs();
  try {
    state.data = await loadData();
  } catch (e) {
    state.error = { title: 'Could not load the app data', detail: `${e.message}. Check your connection and reload.` };
  }
  render();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

start();
