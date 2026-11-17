// SPDX-License-Identifier: GPL-3.0-or-later
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { summarize } from '../js/data.js';
import { parseSave } from '../js/save.js';
import { buildSave } from './build-save.js';

const read = (f) => JSON.parse(readFileSync(new URL(`../data/rac1/${f}.json`, import.meta.url)));
const data = {
  planets: read('planets').planets,
  items: read('items').items,
  goldBoltsPerLevel: read('gold-bolts').perLevel,
  skillPoints: read('skill-points').skillPoints,
};

test('data files agree with the known totals', () => {
  assert.equal(data.planets.length, 19);
  assert.deepEqual(data.planets.map((p) => p.goldBolts), data.goldBoltsPerLevel);
  assert.equal(data.goldBoltsPerLevel.reduce((a, b) => a + b, 0), 40);
  assert.equal(data.items.filter((i) => i.gold).length, 10);
  assert.equal(data.items.filter((i) => i.kind === 'gadget').length, 19);
  assert.equal(data.items.filter((i) => i.kind === 'weapon').length, 14);
  assert.equal(data.skillPoints.length, 30);
});

test('summary of an empty-progress save', () => {
  const s = summarize(parseSave(buildSave({ planet: 1 })), data);
  assert.deepEqual([s.goldBolts.found, s.goldBolts.total], [0, 40]);
  assert.deepEqual([s.skillPoints.found, s.skillPoints.total], [0, 30]);
  assert.deepEqual([s.goldWeapons.found, s.goldWeapons.total], [0, 10]);
  assert.deepEqual([s.planetsUnlocked.found, s.planetsUnlocked.total], [0, 16]);
  assert.equal(s.planets.length, 18); // Veldin (level 0) has no bolts and no ship stop
  assert.equal(s.planetName, 'Novalis');
});

test('summary counts', () => {
  const s = summarize(parseSave(buildSave({
    planet: 14,
    owned: [2, 3, 15, 23],
    gold: [15],
    unlocked: [1, 2, 14],
    skills: [1, 2],
    // a stray flag beyond the planet's count must not be counted
    goldBolts: { 1: [0, 1, 2], 4: [0, 3], 14: [1] },
  })), data);
  assert.equal(s.goldBolts.found, 5);
  assert.equal(s.gadgets.found, 2);
  assert.equal(s.weapons.found, 2);
  assert.equal(s.goldWeapons.found, 1);
  assert.equal(s.skillPoints.found, 2);
  assert.equal(s.planetsUnlocked.found, 3);
  const novalis = s.planets.find((p) => p.level === 1);
  assert.deepEqual([novalis.found, novalis.total], [3, 3]);
  const eudora = s.planets.find((p) => p.level === 4);
  assert.deepEqual([eudora.found, eudora.total], [1, 1]);
  assert.equal(s.planets.find((p) => p.current).name, 'Oltanis');
});
