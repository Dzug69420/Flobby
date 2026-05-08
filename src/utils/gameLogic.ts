export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function pickRewardCards(
  allIds: string[],
  count: number = 3,
  weights?: Record<string, 'common' | 'uncommon' | 'rare'>
): string[] {
  if (!weights) {
    return shuffle(allIds).slice(0, count);
  }

  const RARITY_WEIGHTS = { common: 60, uncommon: 30, rare: 10 };
  const chosen: string[] = [];
  const remaining = [...allIds];

  for (let i = 0; i < count && remaining.length > 0; i++) {
    // Build weighted pool from remaining cards
    const pool: { id: string; weight: number }[] = remaining.map((id) => ({
      id,
      weight: RARITY_WEIGHTS[weights[id] ?? 'common'],
    }));
    const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
    let roll = Math.random() * totalWeight;
    let picked = pool[pool.length - 1].id;
    for (const entry of pool) {
      roll -= entry.weight;
      if (roll <= 0) { picked = entry.id; break; }
    }
    chosen.push(picked);
    remaining.splice(remaining.indexOf(picked), 1);
  }

  return chosen;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
