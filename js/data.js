// Static RaC1 data and the totals the UI shows.
// SPDX-License-Identifier: GPL-3.0-or-later

const FILES = ['planets', 'items', 'gold-bolts', 'skill-points'];

export async function loadData(base = new URL('../data/rac1/', import.meta.url)) {
  const [planets, items, goldBolts, skillPoints] = await Promise.all(
    FILES.map(async (name) => {
      const res = await fetch(new URL(`${name}.json`, base));
      if (!res.ok) throw new Error(`Could not load ${name}.json (${res.status})`);
      return res.json();
    }),
  );
  return {
    planets: planets.planets,
    items: items.items,
    goldBoltsPerLevel: goldBolts.perLevel,
    skillPoints: skillPoints.skillPoints,
  };
}

/** Planets the Planets tab lists: any with gold bolts or reachable by ship. */
export const listedPlanets = (data) => data.planets.filter((p) => p.goldBolts > 0 || p.ship);

/** Plain totals for a parsed save. Each entry: { found, total, list: [{ name, found }] }. */
export function summarize(save, data) {
  const pick = (list) => ({ found: list.filter((x) => x.found).length, total: list.length, list });
  const byKind = (kind) =>
    data.items.filter((i) => i.kind === kind).map((i) => ({ name: i.name, found: save.itemsOwned[i.id] }));

  const planets = listedPlanets(data).map((p) => {
    const bolts = save.goldBolts[p.level].slice(0, p.goldBolts);
    return {
      level: p.level,
      name: p.name,
      ship: p.ship,
      unlocked: !p.ship || save.planetsUnlocked[p.level],
      current: p.level === save.planet,
      bolts,
      found: bolts.filter(Boolean).length,
      total: p.goldBolts,
    };
  });

  const goldBolts = planets.flatMap((p) => p.bolts.map((found) => ({ name: p.name, found })));

  return {
    planetName: data.planets[save.planet]?.name ?? `Planet #${save.planet}`,
    goldBolts: pick(goldBolts),
    skillPoints: pick(
      data.skillPoints.map((s) => ({ name: s.name || `Skill point ${s.index + 1}`, found: save.skillPoints[s.index] })),
    ),
    goldWeapons: pick(
      data.items.filter((i) => i.gold).map((i) => ({ name: `Gold ${i.name}`, found: save.goldWeapons[i.id] })),
    ),
    gadgets: pick(byKind('gadget')),
    weapons: pick(byKind('weapon')),
    planetsUnlocked: pick(planets.filter((p) => p.ship).map((p) => ({ name: p.name, found: p.unlocked }))),
    planets,
  };
}
