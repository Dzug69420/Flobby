import { MapNode, RoomType } from '../types';

const COLS = 5;
const FLOORS = 15;

// Floor 0-1: easy monsters only
// Floor 2-7: monster/event mix
// Floor 8: treasure
// Floor 9-12: monster/elite/event
// Floor 13: rest
// Floor 14: boss
function roomTypeForFloor(floor: number, col: number): RoomType {
  if (floor === FLOORS - 1) return 'boss';
  if (floor === FLOORS - 2) return 'rest';
  if (floor === 8) return 'treasure';
  if (floor === 11) return 'elite'; // Mini-boss floor
  if (floor === 4) return 'rest'; // Mid-act rest site
  if (floor <= 1) return 'monster';
  // Elite rooms: about 2 per act
  if (floor >= 5) {
    const hash = (floor * 17 + col * 7) % 100;
    if (hash < 18) return 'elite';
    if (hash < 30) return 'event';
    if (hash < 40) return 'shop';
  }
  const hash = (floor * 13 + col * 11) % 100;
  if (hash < 18) return 'event';
  if (hash < 28) return 'shop';
  return 'monster';
}

function roomEmoji(type: RoomType): string {
  switch (type) {
    case 'monster':  return '⚔️';
    case 'elite':    return '💀';
    case 'rest':     return '🔥';
    case 'shop':     return '💰';
    case 'treasure': return '📦';
    case 'event':    return '❓';
    case 'boss':     return '👑';
  }
}

export { roomEmoji };

export function generateMap(): MapNode[] {
  const nodes: MapNode[] = [];

  // Create nodes for each floor × col
  for (let floor = 0; floor < FLOORS; floor++) {
    for (let col = 0; col < COLS; col++) {
      const id = `f${floor}c${col}`;
      const roomType = roomTypeForFloor(floor, col);
      // Boss and rest only occupy the center column
      const skip = (floor === FLOORS - 1 || floor === FLOORS - 2) && col !== 2;
      if (skip) continue;

      nodes.push({
        id,
        floor,
        col,
        roomType,
        connections: [],
        visited: false,
        available: floor === 0,
      });
    }
  }

  // Build connections: each node connects to 1–2 nodes on the next floor
  for (let floor = 0; floor < FLOORS - 1; floor++) {
    const currentFloorNodes = nodes.filter((n) => n.floor === floor);
    const nextFloorNodes = nodes.filter((n) => n.floor === floor + 1);

    for (const node of currentFloorNodes) {
      // Connect to the same col or adjacent on next floor
      const candidates = nextFloorNodes
        .filter((n) => Math.abs(n.col - node.col) <= 1)
        .sort(() => Math.random() - 0.5);

      const picks = candidates.slice(0, Math.random() > 0.5 ? 2 : 1);
      for (const target of picks) {
        if (!node.connections.includes(target.id)) {
          node.connections.push(target.id);
        }
      }

      // Ensure at least one connection
      if (node.connections.length === 0 && nextFloorNodes.length > 0) {
        const closest = nextFloorNodes.reduce((prev, curr) =>
          Math.abs(curr.col - node.col) < Math.abs(prev.col - node.col) ? curr : prev
        );
        node.connections.push(closest.id);
      }
    }
  }

  return nodes;
}

export function markNodeVisited(map: MapNode[], nodeId: string): MapNode[] {
  const visited = map.find((n) => n.id === nodeId)!;
  const nextFloor = visited.floor + 1;

  return map.map((n) => {
    if (n.id === nodeId) return { ...n, visited: true, available: false };
    if (n.floor === nextFloor && visited.connections.includes(n.id)) {
      return { ...n, available: true };
    }
    return n;
  });
}
