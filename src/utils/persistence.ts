import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  bestScore: 'flobby_bestScore',
  runsCompleted: 'flobby_runsCompleted',
  ascensionLevel: 'flobby_ascensionLevel',
  runHistory: 'flobby_runHistory',
  selectedCharacter: 'flobby_selectedCharacter',
};

export type PersistedData = Partial<{
  bestScore: number;
  runsCompleted: number;
  ascensionLevel: number;
  runHistory: unknown[];
  selectedCharacter: string;
}>;

export async function loadPersisted(): Promise<PersistedData> {
  try {
    const results = await AsyncStorage.multiGet(Object.values(KEYS));
    const out: Record<string, unknown> = {};
    for (const entry of results) {
      const key = entry[0];
      const value = entry[1];
      if (value === null) continue;
      const keyName = Object.entries(KEYS).find(([, v]) => v === key)?.[0];
      if (!keyName) continue;
      try {
        out[keyName] = JSON.parse(value);
      } catch {
        out[keyName] = value;
      }
    }
    return out as PersistedData;
  } catch {
    return {};
  }
}

export async function savePersisted(data: {
  bestScore?: number;
  runsCompleted?: number;
  ascensionLevel?: number;
  runHistory?: unknown[];
  selectedCharacter?: string;
}): Promise<void> {
  try {
    const pairs: [string, string][] = [];
    if (data.bestScore !== undefined) pairs.push([KEYS.bestScore, JSON.stringify(data.bestScore)]);
    if (data.runsCompleted !== undefined) pairs.push([KEYS.runsCompleted, JSON.stringify(data.runsCompleted)]);
    if (data.ascensionLevel !== undefined) pairs.push([KEYS.ascensionLevel, JSON.stringify(data.ascensionLevel)]);
    if (data.runHistory !== undefined) pairs.push([KEYS.runHistory, JSON.stringify(data.runHistory)]);
    if (data.selectedCharacter !== undefined) pairs.push([KEYS.selectedCharacter, JSON.stringify(data.selectedCharacter)]);
    if (pairs.length > 0) await AsyncStorage.multiSet(pairs);
  } catch {
    // Silent fail — persistence is optional
  }
}
