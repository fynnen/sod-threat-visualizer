import { WCLActor, WCLCombatantInfoEvent } from '../types/WarcraftLogs/types';
import { PlayerClass } from './playerClass';
import { Rogue } from './rogue';

export class PlayerClassFactory {
  static createPlayerClass(
    actor: WCLActor,
    combatantInfo: WCLCombatantInfoEvent,
  ): PlayerClass {
    switch (actor.subType) {
      case 'Rogue':
        return new Rogue(combatantInfo);
      default:
        throw new Error(`Unknown class type: ${actor.subType}`);
    }
  }
}
