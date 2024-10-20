import { WCLEvent } from '../types/WarcraftLogs/types';

export interface PlayerClass {
  getPlayerId(): number;
  updateBuffStatus(event: WCLEvent): void;
  calculateThreat(event: WCLEvent): number;
}
