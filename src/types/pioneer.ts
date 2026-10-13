export interface PioneerState {
  name: string;
  familyMembers: string[];
  health: number; // 0 - 100
  energy: number; // 0 - 100
  food: number;   // 0 - 100
  cryptoBalanceAeth: number;
  cryptoBalanceBtc: number;
  currentActivity: string;
  currentLocationName: string;
  targetLocation: { x: number; y: number; z: number };
  latestThought: string;
  daysOnPlanet: number;
  logEntries: {
    id: string;
    time: string;
    title: string;
    text: string;
    type: 'survival' | 'trade' | 'family' | 'discovery';
  }[];
}
