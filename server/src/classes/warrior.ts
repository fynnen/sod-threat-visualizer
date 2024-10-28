import {
  WCLApplyBuffEvent,
  WCLCombatantInfoEvent,
  WCLDamageEvent,
  WCLEvent,
  WCLEventType,
  WCLRemoveBuffEvent,
} from '../types/WarcraftLogs/types';
import { GenericThreatModifierAuras } from './genericValues';
import { PlayerClass } from './playerClass';

enum WarriorStance {
  BattleStance = 2457,
  BerserkerStance = 2458,
  DefensiveStance = 71,
  GladiatorStance = 412513,
  Unknown = 0,
}

enum WarriorAbilities {
  BattleStance = 2457,
  BerserkerStance = 2458,
  DefensiveStance = 71,
  GladiatorStance = 412513,
  Bloodthirst = 23894,
  DeepWounds = 412613,
  DemoralizingShout,
  Execute = 20647,
  Hamstring,
  HeroicStrike = 11567,
  Cleave = 20569,
  MortalStrike,
  Overpower = 11585,
  QuickStrike,
  RagingBlow = 402911,
  Rampage,
  Recklessness = 1719,
  Rend,
  Revenge,
  Retaliate = 468071, //T2 set bonus I guess?
  ShieldBlock,
  ShieldSlam = 23925,
  ShieldWall,
  Shockwave = 440488,
  BattleShout,
  CommandingShout,
  SlamInstant = 462897,
  SlamCast = 11605,
  SunderArmor = 11597,
  Devastate = 403196,
  SweepingStrikes,
  ThunderClap,
  Whirlwind = 1680,
}

const threatModifierAuras = {
  ...GenericThreatModifierAuras,
};

const T1Set = 1719;
const baseThreatModifier = 1;

export class Warrior implements PlayerClass {
  private threatModifier: number;
  private playerId: number;
  private has6pt1: boolean;
  private hasDefiance: boolean;
  private hasVigilance: boolean;
  private currentStance: WarriorStance;
  private hasFuriousThunder: boolean;

  constructor(private combatantInfo: WCLCombatantInfoEvent) {
    this.playerId = combatantInfo.sourceID;
    this.hasDefiance = combatantInfo.talents[2].id >= 15; //extemely lazy way to assume defiance 5/5
    this.has6pt1 =
      combatantInfo.gear.filter(x => x.setID === T1Set).length >= 6;
    this.setThreatModifier();
  }

  private setThreatModifier(): void {
    const activeThreatModifiers = this.combatantInfo.auras
      .map(x => threatModifierAuras[x.ability]?.modifier)
      .filter(x => x !== undefined) as number[];
    this.threatModifier =
      baseThreatModifier * activeThreatModifiers.reduce((a, b) => a * b, 1);
  }

  private getStanceModifier(): number {
    switch (this.currentStance) {
      case WarriorStance.DefensiveStance:
        return 1.3;
      case WarriorStance.BattleStance:
        return 0.8;
      case WarriorStance.BerserkerStance:
        return 0.8;
      case WarriorStance.GladiatorStance:
        return 0.7;
      default:
        return 1.0;
    }
  }

  private getTotalThreatModifier(): number {
    return (
      this.threatModifier *
      this.getStanceModifier() *
      (this.hasDefiance && this.currentStance === WarriorStance.DefensiveStance
        ? 1.15
        : 1) *
      (this.has6pt1 && this.currentStance === WarriorStance.DefensiveStance
        ? 1.1
        : 1) *
      (this.hasVigilance ? 1.1 : 1)
    );
  }

  getPlayerId(): number {
    return this.playerId;
  }

  updateBuffStatus(event: WCLEvent): void {
    if (event.type === WCLEventType.removebuff) {
      const debuff = event as WCLRemoveBuffEvent;
      if (debuff.abilityGameID === this.currentStance) {
        this.currentStance = WarriorStance.Unknown;
      }
    } else if (event.type === WCLEventType.applybuff) {
      const buff = event as WCLApplyBuffEvent;
      if (Object.values(WarriorStance).includes(buff.abilityGameID)) {
        this.currentStance = buff.abilityGameID;
      }
    }
  }

  calculateThreat(event: WCLEvent): number {
    if (event.type === WCLEventType.damage) {
      const damageEvent = event as WCLDamageEvent;
      let threat = damageEvent.amount * this.getTotalThreatModifier();

      switch (damageEvent.abilityGameID) {
        case WarriorAbilities.Execute:
          threat *= 1.25;
          break;
        case WarriorAbilities.Hamstring:
          threat *= 1.25;
          threat += 1.25 * 2 * 54 * this.getTotalThreatModifier();
          break;
        case WarriorAbilities.HeroicStrike:
          threat += 173 * this.getTotalThreatModifier();
          break;
        case WarriorAbilities.Cleave:
          threat += 100 * this.getTotalThreatModifier();
          break;
        case WarriorAbilities.Overpower:
          threat *= 0.75;
          break;
        case WarriorAbilities.Revenge:
          threat *= 2.25;
          threat += 2.25 * 2 * 60 * this.getTotalThreatModifier();
          break;
        case WarriorAbilities.ShieldSlam:
          threat *= 2;
          threat += 254 * 2 * this.getTotalThreatModifier();
          break;
        case WarriorAbilities.SlamCast:
        case WarriorAbilities.SlamInstant:
          threat += 54 * this.getTotalThreatModifier();
          break;
        case WarriorAbilities.ThunderClap:
          threat *= 2.5;
          if (this.hasFuriousThunder) threat *= 1.5;
          break;
        case WarriorAbilities.BattleShout:
        case WarriorAbilities.DemoralizingShout:
          //fucky wucky threat, maybe i'll bother
          break;
        case WarriorAbilities.SunderArmor:
          threat += 2.25 * 2 * 58 * this.getTotalThreatModifier();
          break;
        case WarriorAbilities.Devastate:
          if (this.currentStance === WarriorStance.DefensiveStance) {
            threat *= 1.5;
          }
          //devastate also procs sunders maybe?
          threat += 2.25 * 2 * 58 * this.getTotalThreatModifier();
        default:
          break;
      }
      return threat;
    }
    return 0;
  }
}
