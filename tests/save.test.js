// SPDX-License-Identifier: GPL-3.0-or-later
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSave, crc16, SaveError, FILE_SIZE, GLOBAL_SIZE, LEVEL_SIZE } from '../js/save.js';
import { buildSave } from './build-save.js';

const fails = (bytes, code) =>
  assert.throws(() => parseSave(bytes), (e) => e instanceof SaveError && e.code === code);

test('crc16 matches the spec', () => {
  // Vectors from an independent port of README's algorithm.
  assert.equal(crc16(new Uint8Array()), 0x8320);
  assert.equal(crc16(new TextEncoder().encode('123456789')), 0xd989);
  assert.equal(crc16(Uint8Array.from({ length: 256 }, (_, i) => i)), 0xf3ba);
  assert.equal(crc16(new Uint8Array(0x1801)), 0);
});

test('builder writes the known sizes', () => {
  const s = buildSave();
  assert.equal(s.length, FILE_SIZE);
  const dv = new DataView(s.buffer);
  assert.equal(dv.getUint32(0, true), GLOBAL_SIZE);
  assert.equal(dv.getUint32(4, true), LEVEL_SIZE);
});

test('reads every field', () => {
  const save = parseSave(buildSave({
    planet: 3,
    bolts: 123456,
    storyFlags: [4],
    maxHealth: 5,
    owned: [2, 12, 15, 26],
    acquired: [2, 12, 15, 26, 10],
    gold: [15, 25],
    unlocked: [1, 2, 3],
    skills: [0, 7, 29],
    goldBolts: { 1: [0, 2], 14: [3], 18: [0, 1, 2] },
  }));
  assert.equal(save.planet, 3);
  assert.equal(save.bolts, 123456);
  assert.deepEqual(save.nanotech, { premium: true, ultra: false });
  assert.equal(save.maxHealth, 5);

  const ids = (arr) => arr.flatMap((v, i) => (v ? [i] : []));
  assert.equal(save.itemsOwned.length, 37);
  assert.deepEqual(ids(save.itemsOwned), [2, 12, 15, 26]);
  assert.deepEqual(ids(save.itemsAcquired), [2, 10, 12, 15, 26]);
  assert.equal(save.goldWeapons.length, 40);
  assert.deepEqual(ids(save.goldWeapons), [15, 25]);
  assert.equal(save.planetsUnlocked.length, 20);
  assert.deepEqual(ids(save.planetsUnlocked), [1, 2, 3]);
  assert.equal(save.skillPoints.length, 30);
  assert.deepEqual(ids(save.skillPoints), [0, 7, 29]);

  assert.equal(save.goldBolts.length, 20);
  assert.deepEqual(save.goldBolts[1], [true, false, true, false]);
  assert.deepEqual(save.goldBolts[14], [false, false, false, true]);
  assert.deepEqual(save.goldBolts[18], [true, true, true, false]);
  assert.deepEqual(save.goldBolts[2], [false, false, false, false]);
});

test('ultra nanotech', () => {
  assert.deepEqual(parseSave(buildSave({ storyFlags: [4, 5] })).nanotech, { premium: true, ultra: true });
});

test('accepts an ArrayBuffer', () => {
  assert.equal(parseSave(buildSave({ planet: 7 }).buffer).planet, 7);
});

test('broken checksum in the global section', () => {
  const s = buildSave();
  s[8 + 8 + 8] ^= 0xff; // first byte of chunk 0's data
  fails(s, 'checksum');
});

test('broken checksum in a level section', () => {
  const s = buildSave();
  s[8 + GLOBAL_SIZE + 5 * LEVEL_SIZE + 20] ^= 0x01;
  fails(s, 'checksum');
});

test('stored checksum 0 is invalid', () => {
  const s = buildSave();
  new DataView(s.buffer).setUint32(8 + 4, 0, true);
  fails(s, 'checksum');
});

test('wrong length', () => {
  const s = buildSave();
  fails(s.subarray(0, s.length - 4), 'not-rac1');
  const longer = new Uint8Array(s.length + 4);
  longer.set(s);
  fails(longer, 'not-rac1');
});

test('wrong header sizes', () => {
  const s = buildSave();
  new DataView(s.buffer).setUint32(0, GLOBAL_SIZE + 4, true);
  fails(s, 'not-rac1');
});

test('random file and tiny file', () => {
  fails(new Uint8Array(3), 'not-rac1');
  fails(new TextEncoder().encode('hello, this is not a save at all'), 'not-rac1');
});

test('empty slot', () => {
  fails(buildSave({ planet: -1 }), 'empty');
});

test('error messages', () => {
  const msg = (bytes) => { try { parseSave(bytes); } catch (e) { return e.message; } };
  assert.match(msg(new Uint8Array(3)), /^Not a RaC1 save/);
  assert.match(msg(buildSave({ planet: -1 })), /^Empty slot/);
  const s = buildSave(); s[30] ^= 1;
  assert.match(msg(s), /^Checksum failed/);
});
