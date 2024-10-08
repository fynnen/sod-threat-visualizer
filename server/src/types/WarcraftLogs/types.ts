export enum WCLEventType {
  combatantinfo = 'combatantinfo',
  cast = 'cast',
  damage = 'damage',
  applydebuff = 'applydebuff',
  applydebuffstack = 'applydebuffstack',
  refreshdebuff = 'refreshdebuff',
  removedebuff = 'removedebuff',
  heal = 'heal',
  applybuff = 'applybuff',
  applybuffstack = 'applybuffstack',
  removebuffstack = 'removebuffstack',
  refreshbuff = 'refreshbuff',
  resourcechange = 'resourcechange',
}

export interface WCLEvent {
  timestamp: number;
  type: WCLEventType;
  sourceID: number;
  fight: number;
}

export interface WCLRefreshBuff extends WCLEvent {
  type: WCLEventType.refreshbuff;
  tagetID: number;
  abilityGameID: number;
  sourceMarker: number;
  targetMarker: number;
}

export interface WCLApplyBuffStack extends WCLEvent {
  type: WCLEventType.applybuffstack;
  targetID: number;
  abilityGameID: number;
  stack: number;
  sourceMarker: number;
  targetMarker: number;
}

export interface WCLRemoveDebuffEvent extends WCLEvent {
  type: WCLEventType.removedebuff;
  targetID: number;
  targetIsFriendly: boolean;
  abilityGameID: number;
  sourceMarker: number;
}

export interface WCLCombatantInfoEvent extends WCLEvent {
  type: WCLEventType.combatantinfo;
  gear: any;
  auras: any;
  expansion: string;
  faction: number;
  specId: number;
  strength: number;
  agility: number;
  stamina: number;
  intellect: number;
  spirit: number;
  dodge: number;
  parry: number;
  block: number;
  armor: number;
  critMelee: number;
  critRanged: number;
  critSpell: number;
  hasteMelee: number;
  hasteRanged: number;
  hasteSpell: number;
  speed: number;
  leech: number;
  avoidance: number;
  mastery: number;
  versatilityDamageDone: number;
  versatilityHealingDone;
  versatilityDamageReduction: number;
  talentTree: any;
  talents: any;
  pvpTalents: any;
  customPowerSet: any;
  secondaryCustomPowerSet: any;
  tertiaryCustomPowerSet: any;
}

export interface WCLRefreshDebuffEvent extends WCLEvent {
  type: WCLEventType.refreshdebuff;
  targetID: number;
  targetIsFriendly: boolean;
  abilityGameID: number;
  sourceMarker: number;
}

export interface WCLApplyDebuffStackEvent extends WCLEvent {
  type: WCLEventType.applydebuffstack;
  targetID: number;
  targetIsFriendly: boolean;
  abilityGameID: number;
  stack: number;
  sourceMarker: number;
}

export interface WCLResourceChangeEvent extends WCLEvent {
  type: WCLEventType.resourcechange;
  sourceIsFriendly: boolean;
  targetID: number;
  abilityGameID: number;
  resourceChange: number;
  resourceChangeType: number;
  otherResourceChange: number;
  maxResourceAmount: number;
  waste: number;
  targetMarker: number;
}

export interface WCLApplyBuffEvent extends WCLEvent {
  type: WCLEventType.applybuff;
  targetID: number;
  abilityGameID: number;
  targetMarker: number;
}

export interface WCLApplyDebuffEvent extends WCLEvent {
  type: WCLEventType.applydebuff;
  targetID: number;
  targetIsFriendly: boolean;
  abilityGameID: number;
  sourceMarker: number;
}

export interface WCLHealEvent extends WCLEvent {
  type: WCLEventType.heal;
  targetID: number;
  abilityGameID: number;
  hitType: number;
  amount: number;
  overheal: number;
  targetMarker: number;
}

export interface WCLRemoveBuffStackEvent extends WCLEvent {
  type: WCLEventType.removebuffstack;
  targetID: number;
  abilityGameID: number;
  stack: number;
  targetMarker: number;
}

export interface WCLCastEvent extends WCLEvent {
  type: WCLEventType.cast;
  sourceIsFriendly: boolean;
  targetID: number;
  abilityGameID: number;
  melee: boolean;
  targetMarget: number;
}

export interface WCLApplyDebuffEvent extends WCLEvent {
  type: WCLEventType.applydebuff;
  sourceIsFriendly: boolean;
  targetID: number;
  abilityGameID: number;
  targetMarker: number;
}

export interface WCLDamageEvent extends WCLEvent {
  type: WCLEventType.damage;
  targetID: number;
  targetIsFriendly: boolean;
  abilityGameID: number;
  hitType: number;
  amount: number;
  unmitigatedAmout: number;
  sourceMarker: number;
}
