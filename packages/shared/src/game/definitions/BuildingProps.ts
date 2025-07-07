import type { ValueOf } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import type { ElementSymbol } from "../PeriodicTable";
import type { Ability, AbilityRange } from "./Ability";
import type { CodeNumber } from "./CodeNumber";
import { DefaultCooldown } from "./Constant";
import type { Resource } from "./Resource";
import type { StatusEffect } from "./StatusEffect";

export type DamageType = ValueOf<typeof DamageType>;
export const DamageType = {
   Kinetic: 0,
   Explosive: 1,
   Energy: 2,
} as const;

export const BuildingFlag = {
   None: 0,
   CanRotate: 1 << 0,
   CanTarget: 1 << 1,
   Booster: 1 << 2,
} as const;

export type BuildingFlag = ValueOf<typeof BuildingFlag>;

export interface IBuildingDefinition extends IDefenseProp {
   name: () => string;
   code: CodeNumber;
   buildingFlag: BuildingFlag;
   input: Partial<Record<Resource, number>>;
   output: Partial<Record<Resource, number>>;
   element?: ElementSymbol;
}

export interface IBoosterDefinition extends IBuildingDefinition {
   unlock: Partial<Record<Resource, number>>;
   desc: () => string;
   range: AbilityRange;
   effect: StatusEffect;
   lifeTime: number;
}

export interface IDefenseProp {
   armor: Property;
   shield: Property;
   deflection: Property;
   evasion: Property;
}

export type DefenseProp = Record<keyof IDefenseProp, number>;

export const ProjectileFlag = {
   None: 0,
   NoEvasion: 1 << 0,
   LaserDamage: 1 << 1,
   DroneDamage: 1 << 2,
} as const;

export type ProjectileFlag = ValueOf<typeof ProjectileFlag>;

export const DamageTypeLabel: Record<DamageType, () => string> = {
   [DamageType.Kinetic]: () => t(L.Kinetic),
   [DamageType.Explosive]: () => t(L.Explosive),
   [DamageType.Energy]: () => t(L.Energy),
};

export type Property = [number, number];

export interface IWeaponDefinition extends IBuildingDefinition, IWeaponProp {}

export const WeaponKey = "damagePct" as const;

export interface IWeaponProp {
   damagePct: number;
   fireCooldown: number;
   projectiles: number;
   projectileSpeed: number;
   damageType: DamageType;
   projectileFlag: ProjectileFlag;
   ability?: Ability;
}

export type WeaponProp = {
   [P in keyof IWeaponProp]: IWeaponProp[P] extends Property ? number : IWeaponProp[P];
};

export const BaseDefenseProps: IDefenseProp = {
   armor: [0, 1],
   shield: [0, 1],
   deflection: [0, 1],
   evasion: [0, 0],
} as const;

export const ProductionDefenseProps: IDefenseProp = {
   ...BaseDefenseProps,
   armor: [20, 1],
   shield: [20, 1],
   deflection: [20, 1],
} as const;

export const BoosterDefenseProps: IDefenseProp = {
   ...BaseDefenseProps,
   armor: [20, 0],
   shield: [20, 0],
   deflection: [20, 0],
} as const;

export const BaseWeaponProps: IWeaponProp = {
   damagePct: 1,
   fireCooldown: DefaultCooldown,
   projectiles: 1,
   projectileSpeed: 300,
   damageType: DamageType.Kinetic,
   projectileFlag: ProjectileFlag.None,
} as const;
