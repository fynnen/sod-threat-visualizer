import { WCLActor, WCLCombatantInfoEvent } from '../types/WarcraftLogs/types';
import { PlayerClass } from './playerClass';
import { Rogue } from './rogue';
import { Warrior } from './warrior';

export class PlayerClassFactory {
  static createPlayerClass(
    actor: WCLActor,
    combatantInfo: WCLCombatantInfoEvent,
  ): PlayerClass {
    switch (actor.subType) {
      case 'Rogue':
        return new Rogue(combatantInfo);
      case 'Warrior':
        return new Warrior(combatantInfo);
      default:
        throw new Error(`Unknown class type: ${actor.subType}`);
    }
  }
}
