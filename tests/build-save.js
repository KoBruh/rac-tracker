// Writes a synthetic RaC1 save for tests. No real game data.
// SPDX-License-Identifier: GPL-3.0-or-later
import { GLOBAL_LAYOUT, LEVEL_LAYOUT, LEVEL_SLOTS, crc16 } from '../js/save.js';

const align4 = (n) => (n + 3) & ~3;

/** Encodes one section. `fill` maps chunk id -> (Uint8Array) => void to set its bytes. */
export function encodeSection(layout, fill = {}) {
  const parts = [];
  let pad0 = -1; // offset of the first padding byte, to dodge a zero checksum
  let size = 0;
  for (const [id, n] of layout) {
    const chunk = new Uint8Array(8 + align4(n));
    const dv = new DataView(chunk.buffer);
    dv.setInt32(0, id, true);
    dv.setUint32(4, n, true);
    fill[id]?.(chunk.subarray(8, 8 + n));
    if (pad0 < 0 && align4(n) > n) pad0 = size + 8 + n;
    parts.push(chunk);
    size += chunk.length;
  }
  const end = new Uint8Array(8);
  new DataView(end.buffer).setInt32(0, -1, true);
  parts.push(end);
  size += 8;

  const out = new Uint8Array(8 + size);
  let at = 8;
  for (const p of parts) { out.set(p, at); at += p.length; }
  const data = out.subarray(8);
  for (let v = 1; crc16(data) === 0 && pad0 >= 0 && v < 256; v++) data[pad0] = v;
  const dv = new DataView(out.buffer);
  dv.setUint32(0, size, true);
  dv.setUint32(4, crc16(data), true);
  return out;
}

const setS32 = (v) => (b) => new DataView(b.buffer, b.byteOffset, 4).setInt32(0, v, true);
const setFlags = (idx) => (b) => { for (const i of idx) b[i] = 1; };

/**
 * @param {object} o
 * @param {number} [o.planet] -1 for an empty slot
 * @param {number} [o.bolts]
 * @param {number[]} [o.storyFlags] indices set in chunk 5
 * @param {number} [o.maxHealth]
 * @param {number[]} [o.owned] item ids
 * @param {number[]} [o.acquired] item ids
 * @param {number[]} [o.gold] item ids
 * @param {number[]} [o.unlocked] level ids
 * @param {number[]} [o.skills] skill point indices
 * @param {Record<number, number[]>} [o.goldBolts] level -> found slots
 */
export function buildSave(o = {}) {
  const global = encodeSection(GLOBAL_LAYOUT, {
    0: setS32(o.planet ?? 1),
    1: setS32(o.bolts ?? 0),
    5: setFlags(o.storyFlags ?? []),
    8: setFlags(o.skills ?? []),
    10: setFlags(o.owned ?? []),
    11: setFlags(o.acquired ?? o.owned ?? []),
    14: setFlags(o.unlocked ?? []),
    19: setS32(o.maxHealth ?? 4),
    30: setFlags(o.gold ?? []),
  });
  const levels = [];
  for (let i = 0; i < LEVEL_SLOTS; i++) {
    levels.push(encodeSection(LEVEL_LAYOUT, { 3003: setFlags(o.goldBolts?.[i] ?? []) }));
  }
  const total = 8 + global.length + levels.reduce((s, l) => s + l.length, 0);
  const out = new Uint8Array(total);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, global.length, true);
  dv.setUint32(4, levels[0].length, true);
  out.set(global, 8);
  let at = 8 + global.length;
  for (const l of levels) { out.set(l, at); at += l.length; }
  return out;
}
