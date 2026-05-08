import React from 'react';
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

function Navigator() {
  const phase = useGameStore((s) => s.phase);
  switch (phase) {
    case 'start':    return <StartScreen />;
    case 'map':      return <MapScreen />;
    case 'combat':   return <CombatScreen />;
    case 'reward':   return <RewardScreen />;
    case 'rest':     return <RestScreen />;
    case 'shop':     return <ShopScreen />;
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
