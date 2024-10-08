import { WCLEvent } from '../../types/WarcraftLogs/types';
import { ThreatProcessor } from './threatProcessor';

export class RogueThreatProcessor extends ThreatProcessor {
  calculateThreat(event: WCLEvent): number {
    throw new Error('Method not implemented.');
  }
}
