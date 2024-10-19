import { WCLEvent } from '../../types/WarcraftLogs/types';
import { RogueThreatProcessor } from './rogueThreatProcessor';
import { ThreatProcessor } from './threatProcessor';

export class ThreatProcessorFactory {
  static getProcessor(
    playerClass: string,
    events: WCLEvent[],
  ): ThreatProcessor {
    switch (playerClass) {
      case 'Rogue':
        return new RogueThreatProcessor(events);
      default:
        throw new Error(
          `No threat processor available for class: ${playerClass}`,
        );
    }
  }
}
