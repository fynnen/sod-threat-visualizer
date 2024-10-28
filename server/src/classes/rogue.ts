import {
  WCLApplyBuffEvent,
  WCLCombatantInfoEvent,
  WCLDamageEvent,
  WCLEvent,
  WCLEventType,
  WCLRemoveBuffEvent,
} from '../types/WarcraftLogs/types';
import {
  GenericAbilities,
  GenericAuras,
  GenericThreatModifierAuras,
} from './genericValues';
import { PlayerClass } from './playerClass';

enum RogueAuras {
  JustAFleshWound = 400014,
}
const Auras = {
  ...GenericAuras,
  ...RogueAuras,
} as const;

enum RogueAbilities {
  Eviscerate = 31016,
  PoisonedKnife = 425013,
  SaberSlash = 424785,
  OccultPoison = 458820,
  UnfairAdvantage = 432274,
  SinisterStrike = 11294,
  ExposeArmor = 11198,
  Blunderbuss = 436564,
  CrimsonTempest = 436611,
  FanOfKnives = 409240,
  ShurikenToss = 399986,
  MainGauche = 424919,
  BladeDance = 400012,
}

const Abilities = {
  ...GenericAbilities,
  ...RogueAbilities,
} as const;

const threatModifierAuras = {
  ...GenericThreatModifierAuras,
  [Auras.JustAFleshWound]: { modifier: 2.65 },
};

const T1Set = 1712;
const baseThreatModifier = 0.71;

export class Rogue implements PlayerClass {
  private playerId: number;
  private hasBladeDanceAura: boolean = false;
  private hasMainGaucheAura: boolean = false;
  private threatModifier: number;
  private hasJAFW: boolean;
  private has2pt1: boolean;

  constructor(private combatantInfo: WCLCombatantInfoEvent) {
    this.playerId = combatantInfo.sourceID;
    this.hasJAFW = combatantInfo.auras.some(
      x => x.ability === Auras.JustAFleshWound,
    );
    this.has2pt1 =
      combatantInfo.gear.filter(x => x.setID === T1Set).length >= 2;
    this.setBaseThreatModifier();
  }

  getPlayerId(): number {
    return this.playerId;
  }

  public updateBuffStatus(event: WCLEvent): void {
    if (
      event.type === WCLEventType.applybuff ||
      event.type === WCLEventType.removebuff
    ) {
      const buffEvent = event as WCLApplyBuffEvent | WCLRemoveBuffEvent;
      const applying = event.type === WCLEventType.applybuff;

      switch (buffEvent.abilityGameID) {
        case Abilities.MainGauche:
          this.hasMainGaucheAura = applying;
          break;
        case Abilities.BladeDance:
          this.hasBladeDanceAura = applying;
          break;
      }
    }
  }

  calculateThreat(event: WCLEvent): number {
    if (event.type === WCLEventType.damage) {
      const damageEvent = event as WCLDamageEvent;
      let threat = damageEvent.amount * this.threatModifier;

      switch (damageEvent.abilityGameID) {
        case Abilities.PoisonedKnife:
          if (this.hasJAFW) threat *= 1.5;
          if (this.hasMainGaucheAura) threat *= 1.5;
          break;
        case Abilities.ShurikenToss:
          if (this.hasJAFW) threat *= 1.5;
          break;
        case Abilities.SinisterStrike:
          if (this.hasMainGaucheAura) threat *= 1.5;
          break;
        case Abilities.CrimsonTempest:
        case Abilities.FanOfKnives:
        case Abilities.Blunderbuss:
          threat *= 2;
          if (this.has2pt1 && this.hasJAFW && this.hasBladeDanceAura) {
            threat *= 2;
          }
          break;
      }
      return threat;
    }
    return 0;
  }

  private setBaseThreatModifier(): void {
    const activeThreatModifiers = this.combatantInfo.auras
      .map(x => threatModifierAuras[x.ability]?.modifier)
      .filter(x => x !== undefined) as number[];
    this.threatModifier =
      baseThreatModifier * activeThreatModifiers.reduce((a, b) => a * b, 1);
  }
}
