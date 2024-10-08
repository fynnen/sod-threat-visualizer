import { WCLEvent } from '../../types/WarcraftLogs/types';

export abstract class ThreatProcessor {
  abstract calculateThreat(event: WCLEvent): number;
}
