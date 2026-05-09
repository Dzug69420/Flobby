import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useGameStore } from './src/store/gameStore';
import StartScreen from './src/screens/StartScreen';
import CombatScreen from './src/screens/CombatScreen';
import RewardScreen from './src/screens/RewardScreen';
import GameOverScreen from './src/screens/GameOverScreen';
import VictoryScreen from './src/screens/VictoryScreen';
import MapScreen from './src/screens/MapScreen';
import RestScreen from './src/screens/RestScreen';
import ShopScreen from './src/screens/ShopScreen';
import EventScreen from './src/screens/EventScreen';
import BlessingScreen from './src/screens/BlessingScreen';
import CharacterSelectScreen from './src/screens/CharacterSelectScreen';
import BossRelicScreen from './src/screens/BossRelicScreen';
import ScryScreen from './src/screens/ScryScreen';

function Navigator() {
  const phase = useGameStore((s) => s.phase);
  const loadSavedData = useGameStore((s) => s.loadSavedData);

  useEffect(() => {
    loadSavedData();
  }, []);
  switch (phase) {
    case 'start':          return <StartScreen />;
    case 'character_select': return <CharacterSelectScreen />;
    case 'blessing':       return <BlessingScreen />;
    case 'map':      return <MapScreen />;
    case 'combat':   return <CombatScreen />;
    case 'reward':   return <RewardScreen />;
    case 'rest':     return <RestScreen />;
    case 'shop':     return <ShopScreen />;
    case 'event':      return <EventScreen />;
    case 'boss_relic': return <BossRelicScreen />;
    case 'scry':       return <ScryScreen />;
    case 'gameover': return <GameOverScreen />;
    case 'victory':  return <VictoryScreen />;
    default:         return <StartScreen />;
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Navigator />
    </SafeAreaProvider>
  );
}
