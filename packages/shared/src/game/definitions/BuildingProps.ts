import type { ValueOf } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import type { ElementSymbol } from "../PeriodicTable";
import type { Ability } from "./Ability";
import type { CodeNumber } from "./CodeNumber";

export type DamageType = ValueOf<typeof DamageType>;
export const DamageType = {
   Kinetic: 0,
   Explosive: 1,
   Energy: 2,
} as const;

export interface IBuildingDefinition extends IBuildingProp {
   pet: () => string;
   code: CodeNumber;
   element?: ElementSymbol;
}

export interface IBuildingProp {
   armor: Property;
   shield: Property;
   deflection: Property;
   evasion: Property;
   damagePct: number;
   fireCooldown: number;
   projectiles: number;
   projectileSpeed: number;
   damageType: DamageType;
   projectileFlag: ProjectileFlag;
   ability?: Ability;
}

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

export type BuildingProp = {
   [P in keyof IBuildingProp]: IBuildingProp[P] extends Property ? number : IBuildingProp[P];
};
