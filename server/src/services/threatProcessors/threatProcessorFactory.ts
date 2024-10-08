import { RogueThreatProcessor } from './rogueThreatProcessor';
import { ThreatProcessor } from './threatProcessor';

export class ThreatProcessorFactory {
  static getProcessor(playerClass: string): ThreatProcessor {
    switch (playerClass) {
      case 'Rogue':
        return new RogueThreatProcessor();
      default:
        throw new Error(
          `No threat processor available for class: ${playerClass}`,
        );
    }
  }
}
