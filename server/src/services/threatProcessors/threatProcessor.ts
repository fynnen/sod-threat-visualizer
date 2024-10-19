import { ThreatEvent } from '../../types/types';
import { WCLEvent } from '../../types/WarcraftLogs/types';

export abstract class ThreatProcessor {
  abstract processLog(): ThreatEvent[];
  abstract calculateThreat(event: WCLEvent): ThreatEvent;
}
