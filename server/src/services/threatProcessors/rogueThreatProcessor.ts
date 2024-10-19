import { ThreatEvent } from '../../types/types';
import {
  WCLApplyBuffEvent,
  WCLCombatantInfoEvent,
  WCLDamageEvent,
  WCLEvent,
  WCLEventType,
  WCLRemoveBuffEvent,
} from '../../types/WarcraftLogs/types';
import { ThreatProcessor } from './threatProcessor';

enum Auras {
  Alpha = 408696,
  JustAFleshWound = 400014,
}

const threatModifierAuras = {
  [Auras.Alpha]: { modifier: 1.45 },
  [Auras.JustAFleshWound]: { modifier: 2.65 },
};

enum Abilities {
  Melee = 1,
  Eviscerate = 31016,
  FireStrike = 468167, //Blazefury
  PoisonedKnife = 425013,
  SaberSlash = 424785,
  OccultPoison = 458820,
  UnfairAdvantage = 432274,
  SinisterStrike = 11294,
  Thorns = 9910,
  ExposeArmor = 11198,
  Blunderbuss = 436564,
  CrimsonTempest = 436611,
  FanOfKnives = 409240,
  ShurikenToss = 399986,
  MainGauche = 424919,
}

const T1Set = 1712;

const baseThreatModifier = 0.71;

export class RogueThreatProcessor extends ThreatProcessor {
  private threatModifier: number;
  private playerId: number;
  private hasJAFW: boolean;
  private has2pt1: boolean;
  private events: WCLEvent[];
  private hasBladeDanceAura: boolean;
  private hasMainGaucheAura: boolean;

  constructor(events: WCLEvent[]) {
    super();
    this.events = events;
    const combatantInfo = this.events.find(
      x => x.type === WCLEventType.combatantinfo,
    ) as WCLCombatantInfoEvent;
    this.playerId = combatantInfo.sourceID;
    this.setThreatModifier(combatantInfo);
    this.hasJAFW =
      combatantInfo.auras.find(x => x.ability === Auras.JustAFleshWound) !==
      undefined;
    this.has2pt1 =
      combatantInfo.gear.filter(x => x.setId === T1Set).length >= 2;
  }

  private setThreatModifier(combatantInfoEvent: WCLCombatantInfoEvent) {
    const activeThreatModifiers = combatantInfoEvent.auras
      .map(x => threatModifierAuras[x.ability]?.modifier)
      .filter(x => x !== undefined);
    this.threatModifier =
      baseThreatModifier * activeThreatModifiers.reduce((a, b) => a * b);
  }

  processLog(): ThreatEvent[] {
    const threatEvents = [];
    this.events
      .filter(x => x.sourceID === this.playerId)
      .forEach(x => {
        if (x.type === WCLEventType.applybuff) {
          const buffEvent = x as WCLApplyBuffEvent;
          if (buffEvent.abilityGameID === 400012)
            this.hasBladeDanceAura === true;
          if (buffEvent.abilityGameID === 424919)
            this.hasBladeDanceAura === true;
        }
        if (x.type === WCLEventType.removebuff) {
          const buffEvent = x as WCLRemoveBuffEvent;
          if (buffEvent.abilityGameID === 400012)
            this.hasBladeDanceAura === false;
          if (buffEvent.abilityGameID === 424919)
            this.hasBladeDanceAura === false;
        }
        threatEvents.push(this.calculateThreat(x));
      });
    return threatEvents;
  }

  calculateThreat(event: WCLEvent): ThreatEvent {
    if (event.type === WCLEventType.damage) {
      const damageEvent = event as WCLDamageEvent;
      let threat = damageEvent.amount * this.threatModifier;
      switch (damageEvent.abilityGameID) {
        case Abilities.PoisonedKnife:
          if (this.hasJAFW) {
            threat *= 1.5;
          }
          if (this.hasMainGaucheAura) {
            threat *= 1.5;
          }
          break;
        case Abilities.ShurikenToss:
          if (this.hasJAFW) {
            threat *= 1.5;
          }
          break;
        case Abilities.SinisterStrike:
          if (this.hasMainGaucheAura) {
            threat *= 1.5;
          }
        case Abilities.CrimsonTempest:
        case Abilities.FanOfKnives:
        case Abilities.Blunderbuss:
          if (this.has2pt1 && this.hasJAFW && this.hasBladeDanceAura) {
            threat *= 2;
          }
          break;
        default:
          break;
      }
      return { threat };
    }
    return { threat: 0 };
  }
}
