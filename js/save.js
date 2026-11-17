// Ratchet & Clank (2002) save reader. Read-only.
// Format facts from OpenRAC's save editor, launcher/core/src/save_edit.rs (GPL-3.0).
// SPDX-License-Identifier: GPL-3.0-or-later

export const CRC_MAX_LEN = 0x1800;
export const LEVEL_SLOTS = 20;
export const SKILL_POINT_COUNT = 30;

// Chunk layout of each section, [id, size] in file order. Every RaC1 disc writes these.
export const GLOBAL_LAYOUT = [
  [0, 4], [1, 4], [2, 4], [3, 4], [4, 8], [5, 128], [7, 12], [8, 32], [9, 148], [10, 37],
  [11, 37], [12, 12], [13, 32], [19, 4], [14, 20], [20, 80], [15, 1936], [16, 1184], [17, 288],
  [18, 296], [21, 4], [22, 4], [23, 4], [24, 4], [25, 4], [26, 4], [27, 4], [28, 1], [29, 1],
  [30, 40], [31, 4], [32, 28], [33, 1], [34, 4], [35, 4], [36, 4], [37, 12], [1000, 148],
  [1001, 148], [1002, 148], [1003, 4], [1004, 4], [1005, 4], [1008, 4], [1009, 4], [1010, 150],
  [1011, 4],
];
export const LEVEL_LAYOUT = [
  [3001, 1], [3002, 2048], [3003, 4], [3004, 16], [3005, 256], [3006, 256], [3007, 8],
  [3008, 16], [4000, 4], [4001, 4], [4002, 4],
];

const CHUNK = {
  PLANET: 0, BOLTS: 1, FLAGS: 5, SKILL_POINTS: 8, OWNED: 10, ACQUIRED: 11, PLANETS: 14,
  MAX_HEALTH: 19, GOLD: 30, GOLD_BOLTS: 3003,
};

const align4 = (n) => (n + 3) & ~3;

export function sectionSize(layout) {
  return 8 + layout.reduce((sum, [, n]) => sum + 8 + align4(n), 0) + 8;
}

export const GLOBAL_SIZE = sectionSize(GLOBAL_LAYOUT);
export const LEVEL_SIZE = sectionSize(LEVEL_LAYOUT);
export const FILE_SIZE = 8 + GLOBAL_SIZE + LEVEL_SLOTS * LEVEL_SIZE;

export class SaveError extends Error {
  /** @param {'not-rac1'|'checksum'|'empty'} code */
  constructor(code, message) {
    super(message);
    this.name = 'SaveError';
    this.code = code;
  }
}

const notRac1 = (why) => new SaveError('not-rac1', `Not a RaC1 save: ${why}.`);

/** The game's memcard checksum: CRC-16, MSB first, poly 0x1F45, seed 0xEDB88320, no final xor. */
export function crc16(bytes) {
  if (bytes.length > CRC_MAX_LEN) return 0;
  let crc = 0xedb88320;
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc ^ (bytes[i] << 8)) >>> 0;
    for (let k = 0; k < 8; k++) {
      crc = (crc & 0x8000 ? (crc << 1) ^ 0x1f45 : crc << 1) >>> 0;
    }
  }
  return crc & 0xffff;
}

/** Reads one section's chunks into a Map(id -> Uint8Array). `name` is for error text. */
function readSection(bytes, offset, size, layout, name) {
  const view = new DataView(bytes.buffer, bytes.byteOffset + offset, size);
  const dataSize = view.getUint32(0, true);
  const stored = view.getUint32(4, true);
  if (dataSize > size - 8) throw notRac1(`the ${name} section is longer than its slot`);
  const data = bytes.subarray(offset + 8, offset + 8 + dataSize);
  if (stored === 0 || crc16(data) !== stored) {
    throw new SaveError('checksum', `Checksum failed in the ${name} section. The game would not load this save.`);
  }

  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const chunks = new Map();
  let at = 0;
  for (;;) {
    if (at + 8 > data.length) throw notRac1(`the ${name} section has no end marker`);
    const id = dv.getInt32(at, true);
    const len = dv.getUint32(at + 4, true);
    if (id === -1) break;
    if (at + 8 + align4(len) > data.length) throw notRac1(`a chunk runs past the ${name} section`);
    chunks.set(id, data.subarray(at + 8, at + 8 + len));
    at += 8 + align4(len);
  }

  const ok = chunks.size === layout.length && layout.every(([id, n]) => chunks.get(id)?.length === n);
  if (!ok) throw notRac1(`the ${name} section holds unknown data`);
  return chunks;
}

const flags = (arr, count = arr.length) => Array.from(arr.subarray(0, count), (b) => b !== 0);
const s32 = (arr) => new DataView(arr.buffer, arr.byteOffset, 4).getInt32(0, true);

/**
 * Parses a saveN.bin. Throws SaveError ('not-rac1' | 'checksum' | 'empty').
 * @param {ArrayBuffer|Uint8Array} input
 */
export function parseSave(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.length < 8) throw notRac1('the file is too short');
  const head = new DataView(bytes.buffer, bytes.byteOffset, 8);
  const g = head.getUint32(0, true);
  const l = head.getUint32(4, true);
  if (g !== GLOBAL_SIZE || l !== LEVEL_SIZE) throw notRac1('the header sizes do not match');
  if (bytes.length !== FILE_SIZE) throw notRac1(`the file is ${bytes.length} bytes, a save is ${FILE_SIZE}`);

  const global = readSection(bytes, 8, g, GLOBAL_LAYOUT, 'global');
  const planet = s32(global.get(CHUNK.PLANET));
  if (planet < 0) throw new SaveError('empty', 'Empty slot. Nothing has been saved here yet.');

  const levels = [];
  for (let i = 0; i < LEVEL_SLOTS; i++) {
    levels.push(readSection(bytes, 8 + g + i * l, l, LEVEL_LAYOUT, `level ${i}`));
  }

  const storyFlags = global.get(CHUNK.FLAGS);
  return {
    planet,
    bolts: Math.max(0, s32(global.get(CHUNK.BOLTS))),
    nanotech: { premium: storyFlags[4] !== 0, ultra: storyFlags[5] !== 0 },
    maxHealth: s32(global.get(CHUNK.MAX_HEALTH)),
    itemsOwned: flags(global.get(CHUNK.OWNED)),
    itemsAcquired: flags(global.get(CHUNK.ACQUIRED)),
    goldWeapons: flags(global.get(CHUNK.GOLD)),
    planetsUnlocked: flags(global.get(CHUNK.PLANETS)),
    skillPoints: flags(global.get(CHUNK.SKILL_POINTS), SKILL_POINT_COUNT),
    goldBolts: levels.map((lv) => flags(lv.get(CHUNK.GOLD_BOLTS))),
  };
}
