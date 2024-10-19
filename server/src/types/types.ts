export interface EnemyNpc {
  id: number;
}

export interface Player {
  id: number;
  name: string;
}

export interface Encounter {
  id: number;
  name: string;
  zone: string;
  enemies: EnemyNpc[];
  players: Player[];
}

export interface Report {
  title: string;
  encounters: Encounter[];
}

export interface PlayerEvents {
  playerId: number;
  events: any;
}

export interface ThreatEvent {
  threat: number;
}
