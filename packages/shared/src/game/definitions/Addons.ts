import { formatNumber, formatPercent, setFlag, type ValueOf } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { Config } from "../Config";
import { parseBuildingCode } from "../logic/BuildingLogic";
import type { RuntimeTile } from "../logic/RuntimeTile";
import { AbilityRange } from "./AbilityRange";
import type { Blueprint } from "./Blueprints";
import { ProjectileFlag } from "./ProjectileFlag";
import type { ShipClass } from "./ShipClass";
import { addonStatusEffectKey } from "./StatusEffect";

export interface IAddonDefinition {
   name: () => string;
   effectDesc: (value: number) => string;
   effect: (self: IAddonDefinition, value: number, rs: RuntimeTile) => void;
   range: AbilityRange;
   requirement: AddonRequirement;
   cooldown: number;
   shipClass: ShipClass;
   blueprint?: Blueprint;
}

export const AddonRequirement = {
   Distinction: 0,
   Diversity: 1,
   Spectrum: 2,
   Variant: 3,
   Cohort: 4,
} as const satisfies Record<string, number>;

export type AddonRequirement = ValueOf<typeof AddonRequirement>;

export const AddonRequirementLabel: Record<AddonRequirement, () => string> = {
   [AddonRequirement.Distinction]: () => "If weapon model is different from the equipped weapon",
   [AddonRequirement.Diversity]: () =>
      "If weapon type is different from the equipped weapon (e.g. MS1A: Type = MS, AC30: Type = AC)",
   [AddonRequirement.Spectrum]: () =>
      "If weapon series is different from the equipped weapon (e.g. MS1A: Series = 1, AC30: Series = 30)",
   [AddonRequirement.Variant]: () =>
      "If weapon variant is different from the equipped weapon (e.g. MS1A: Variant = A, AC30: Variant = Base)",
   [AddonRequirement.Cohort]: () =>
      "If weapon class is different from the equipped weapon (e.g. MS1A: Skiff Class, AC76: Scout Class)",
};
export const AddonRequirementFunc: Record<AddonRequirement, (current: RuntimeTile, equipped: RuntimeTile) => boolean> =
   {
      [AddonRequirement.Distinction]: (current, equipped) => current.data.type !== equipped.data.type,
      [AddonRequirement.Diversity]: (current, equipped) =>
         Config.Buildings[current.data.type].type !== Config.Buildings[equipped.data.type].type,
      [AddonRequirement.Spectrum]: (current, equipped) =>
         parseBuildingCode(current.data.type).series !== parseBuildingCode(equipped.data.type).series,
      [AddonRequirement.Variant]: (current, equipped) =>
         parseBuildingCode(current.data.type).variant !== parseBuildingCode(equipped.data.type).variant,
      [AddonRequirement.Cohort]: (current, equipped) =>
         Config.BuildingToShipClass[current.data.type] !== Config.BuildingToShipClass[equipped.data.type],
   };

/*

Range Tags
----------------------------------
| Tag     | Description          |
| ------- | -------------------- |
| Arc     | Flank modules        |
| Span    | Front & Rear modules |
| Link    | Adjacent modules     |
| Field   | 1-tile modules       |
| Grid    | 2-tile modules       |
| Network | 3-tile modules       |
| Array   | Same-row modules     |
| Stack   | Same-column modules  |
----------------------------------

Requirement Tags
-------------------------------------------------------------------------------
| Tag         | Description                                                   |
| ----------- | ------------------------------------------------------------- |
| Distinction | Modules of different weapon models (e.g., MS1C ≠ MS2B)        |
| Diversity   | Modules of different weapon types (e.g., Missile, Autocannon) |
| Spectrum    | Modules of different series numbers (e.g., 1 ≠ 2 ≠ 3)         |
| Variant     | Modules of different variant letters (e.g., A ≠ B ≠ C)        |
| Cohort      | Modules on different ship classes (e.g., Corvette ≠ Frigate)  |
-------------------------------------------------------------------------------

*/

export const _Addons = {
   Evasion1: {
      name: () => t(L.EvasionArcDistinction),
      effectDesc: (value: number) => t(L.PlusXEvasion, formatNumber(value / 2)),
      effect: (self: IAddonDefinition, value: number, rs: RuntimeTile) => {
         rs.props.evasion += value / 2;
      },
      cooldown: 1,
      requirement: AddonRequirement.Distinction,
      range: AbilityRange.Flanks,
      shipClass: "Skiff",
   },
   Damage1: {
      name: () => t(L.DamageSpanDistinction),
      effectDesc: (value: number) => t(L.PlusXDamageMultiplier, formatNumber(value)),
      effect: (self: IAddonDefinition, value: number, rs: RuntimeTile) => {
         rs.damageMultiplier.add(value, t(L.SourceAddon, self.name()));
      },
      cooldown: 1,
      requirement: AddonRequirement.Distinction,
      range: AbilityRange.FrontAndRear,
      shipClass: "Skiff",
   },
   Damage2: {
      name: () => t(L.DamageLinkDistinction),
      effectDesc: (value: number) => t(L.PlusXDamageMultiplier, formatNumber(value)),
      effect: (self: IAddonDefinition, value: number, rs: RuntimeTile) => {
         rs.damageMultiplier.add(value, t(L.SourceAddon, self.name()));
      },
      cooldown: 1,
      requirement: AddonRequirement.Distinction,
      range: AbilityRange.Adjacent,
      shipClass: "Skiff",
   },
   HP1: {
      name: () => t(L.HPArcDistinction),
      effectDesc: (value: number) => t(L.PlusXHPMultiplier, formatNumber(value)),
      effect: (self: IAddonDefinition, value: number, rs: RuntimeTile) => {
         rs.hpMultiplier.add(value, t(L.SourceAddon, self.name()));
      },
      cooldown: 1,
      requirement: AddonRequirement.Distinction,
      range: AbilityRange.Flanks,
      shipClass: "Scout",
   },
   HP2: {
      name: () => t(L.RecoveryArcDiversity),
      effectDesc: (value: number) => t(L.RecoverXHPPerSec, formatPercent(Math.min(0.05 * value, 0.5))),
      effect: (self: IAddonDefinition, value: number, rs: RuntimeTile) => {
         rs.recoverHp(Math.min(0.05 * value, 0.5) * rs.props.hp);
      },
      cooldown: 1,
      requirement: AddonRequirement.Diversity,
      range: AbilityRange.Adjacent,
      shipClass: "Scout",
   },
   Damage3: {
      name: () => t(L.PrecisionSpanSpectrum),
      effectDesc: (value: number) => t(L.GainPrecisionStrikeAndDamageMultiplier, formatNumber(value / 2)),
      effect: (self: IAddonDefinition, value: number, rs: RuntimeTile) => {
         rs.props.projectileFlag = setFlag(rs.props.projectileFlag, ProjectileFlag.NoEvasion);
         rs.damageMultiplier.add(value / 2, t(L.SourceAddon, self.name()));
      },
      cooldown: 1,
      requirement: AddonRequirement.Spectrum,
      range: AbilityRange.FrontAndRear,
      shipClass: "Scout",
   },
   HP3: {
      name: () => t(L.VitalArcDistinction),
      effectDesc: (value: number) =>
         t(L.RecoverXHPPerSecAndHPMultiplier, formatPercent(Math.min(0.05 * value, 0.5)), formatNumber(value / 2)),
      effect: (self: IAddonDefinition, value: number, rs: RuntimeTile) => {
         rs.hpMultiplier.add(value, t(L.SourceAddon, self.name()));
         rs.recoverHp(Math.min(0.05 * value, 0.5) * rs.props.hp);
      },
      cooldown: 1,
      requirement: AddonRequirement.Distinction,
      range: AbilityRange.Flanks,
      shipClass: "Scout",
   },
   HP4: {
      name: () => t(L.VitalLinkCohort),
      effectDesc: (value: number) =>
         t(L.RecoverXHPPerSecAndHPMultiplier, formatPercent(Math.min(0.05 * value, 0.5)), formatNumber(value / 2)),
      effect: (self: IAddonDefinition, value: number, rs: RuntimeTile) => {
         rs.hpMultiplier.add(value, t(L.SourceAddon, self.name()));
         rs.recoverHp(Math.min(0.05 * value, 0.5) * rs.props.hp);
      },
      cooldown: 1,
      requirement: AddonRequirement.Cohort,
      range: AbilityRange.Adjacent,
      shipClass: "Corvette",
   },
   Damage5: {
      name: () => t(L.TrueStrikeArcDiversity),
      effectDesc: (value: number) => t(L.GainTrueStrikeAndDamageMultiplier, formatNumber(value / 2)),
      effect: (self: IAddonDefinition, value: number, rs: RuntimeTile) => {
         rs.props.projectileFlag = setFlag(rs.props.projectileFlag, ProjectileFlag.TrueDamage);
         rs.damageMultiplier.add(value / 2, t(L.SourceAddon, self.name()));
      },
      cooldown: 1,
      requirement: AddonRequirement.Diversity,
      range: AbilityRange.Flanks,
      shipClass: "Corvette",
   },
   Evasion2: {
      name: () => t(L.EvasionLinkDiversity),
      effectDesc: (value: number) => t(L.PlusXEvasion, formatNumber(value / 2)),
      effect: (self: IAddonDefinition, value: number, rs: RuntimeTile) => {
         rs.props.evasion += value / 2;
      },
      cooldown: 1,
      requirement: AddonRequirement.Diversity,
      range: AbilityRange.Adjacent,
      shipClass: "Corvette",
   },
   Damage4: {
      name: () => t(L.PrecisionLinkSpectrum),
      effectDesc: (value: number) => t(L.GainPrecisionStrikeAndDamageMultiplier, formatNumber(value / 2)),
      effect: (self: IAddonDefinition, value: number, rs: RuntimeTile) => {
         rs.props.projectileFlag = setFlag(rs.props.projectileFlag, ProjectileFlag.NoEvasion);
         rs.damageMultiplier.add(value / 2, t(L.SourceAddon, self.name()));
      },
      cooldown: 1,
      requirement: AddonRequirement.Distinction,
      range: AbilityRange.Adjacent,
      shipClass: "Corvette",
   },
   Damage6: {
      name: () => t(L.TrueStrikeLinkDiversity),
      effectDesc: (value: number) => t(L.GainTrueStrikeAndDamageMultiplier, formatNumber(value / 2)),
      effect: (self: IAddonDefinition, value: number, rs: RuntimeTile) => {
         rs.props.projectileFlag = setFlag(rs.props.projectileFlag, ProjectileFlag.TrueDamage);
         rs.damageMultiplier.add(value / 2, t(L.SourceAddon, self.name()));
      },
      cooldown: 1,
      requirement: AddonRequirement.Diversity,
      range: AbilityRange.Adjacent,
      shipClass: "Corvette",
   },
   HP5: {
      name: () => t(L.PurifierSpanDistinction),
      effectDesc: (value: number) => t(L.PurifyEvery5SecondsAndHPMultiplier, formatNumber(value / 2)),
      effect: (self: IAddonDefinition, value: number, rs: RuntimeTile) => {
         rs.hpMultiplier.add(value, t(L.SourceAddon, self.name()));
         rs.recoverHp(Math.min(0.05 * value, 0.5) * rs.props.hp);
      },
      cooldown: 1,
      requirement: AddonRequirement.Cohort,
      range: AbilityRange.Adjacent,
      shipClass: "Frigate",
   },
   Damage7: {
      name: () => t(L.CriticalStrikeSpanSpectrum),
      effectDesc: (value: number) => t(L.GainCriticalStrikeAndDamageMultiplier, formatNumber(value / 2)),
      effect: (self: IAddonDefinition, value: number, rs: RuntimeTile) => {
         rs.addStatusEffect(addonStatusEffectKey(rs.tile), {
            statusEffect: "CriticalDamage2",
            source: t(L.SourceAddon, self.name()),
            value: 0.25,
            timeLeft: Number.POSITIVE_INFINITY,
         });
         rs.damageMultiplier.add(value / 2, t(L.SourceAddon, self.name()));
      },
      cooldown: 1,
      requirement: AddonRequirement.Spectrum,
      range: AbilityRange.FrontAndRear,
      shipClass: "Frigate",
   },

   // Damage4: {
   //    name: () => t(L.TrueStrikeArray),
   //    desc: (value: number) => t(L.TrueStrikeArrayDesc, formatNumber(value / 2), formatNumber(value / 2)),
   //    tick: (self: IAddonDefinition, value: number, tile: Tile, state: IAddonState, runtime: Runtime) => {
   //       arrayEffect(tile, self.range, runtime, (rs) => {
   //          rs.props.projectileFlag = setFlag(rs.props.projectileFlag, ProjectileFlag.TrueDamage);
   //          rs.damageMultiplier.add(value / 2, t(L.SourceAddon, t(L.TrueStrikeArray)));
   //       });
   //    },
   //    range: AbilityRange.Adjacent,
   //    shipClass: "Corvette",
   // },
   // Damage5: {
   //    name: () => t(L.PrecisionMatrix),
   //    desc: (value: number) => t(L.PrecisionMatrixDesc, formatNumber(value / 2), formatNumber(value / 2)),
   //    tick: (self: IAddonDefinition, value: number, tile: Tile, state: IAddonState, runtime: Runtime) => {
   //       matrixEffect(tile, self.range, runtime, (rs) => {
   //          rs.props.projectileFlag = setFlag(rs.props.projectileFlag, ProjectileFlag.NoEvasion);
   //          rs.damageMultiplier.add(value / 2, t(L.SourceAddon, t(L.PrecisionMatrixDesc)));
   //       });
   //    },
   //    range: AbilityRange.Adjacent,
   //    shipClass: "Frigate",
   // },
   // HP5: {
   //    name: () => t(L.PurifierManifold),
   //    desc: (value: number) => t(L.PurifierManifoldDesc, formatNumber(value / 2), formatNumber(value / 2)),
   //    tick: (self: IAddonDefinition, value: number, tile: Tile, state: IAddonState, runtime: Runtime) => {
   //       diversityEffect(tile, self.range, runtime, (rs) => {
   //          rs.hpMultiplier.add(value / 2, t(L.SourceAddon, t(L.PurifierManifold)));
   //       });
   //       if (state.tick >= 5) {
   //          diversityEffect(tile, self.range, runtime, (rs) => {
   //             rs.addStatusEffect(addonStatusEffectKey(tile), {
   //                statusEffect: "PurifyDebuff",
   //                source: t(L.SourceAddon, t(L.PurifierManifold)),
   //                value: value / 2,
   //                timeLeft: 1,
   //             });
   //          });
   //          state.tick = 0;
   //       }
   //    },
   //    range: AbilityRange.Adjacent,
   //    shipClass: "Frigate",
   // },
   // Damage6: {
   //    name: () => t(L.CriticalStrikeDiversity),
   //    desc: (value: number) => t(L.CriticalStrikeDiversityDesc, formatNumber(value / 2), formatNumber(value / 2)),
   //    tick: (self: IAddonDefinition, value: number, tile: Tile, state: IAddonState, runtime: Runtime) => {
   //       matrixEffect(tile, self.range, runtime, (rs) => {
   //          rs.addStatusEffect(addonStatusEffectKey(tile), {
   //             statusEffect: "CriticalDamage2",
   //             source: t(L.SourceAddon, t(L.CriticalStrikeDiversity)),
   //             value: 0.25,
   //             timeLeft: Number.POSITIVE_INFINITY,
   //          });
   //          rs.damageMultiplier.add(value / 2, t(L.SourceAddon, t(L.CriticalStrikeDiversity)));
   //       });
   //    },
   //    range: AbilityRange.Adjacent,
   //    shipClass: "Frigate",
   // },
   // HP6: {
   //    name: () => t(L.HPArrayRow),
   //    desc: (value: number) => t(L.HPArrayRowDesc, formatNumber(value), formatNumber(value)),
   //    tick: (self: IAddonDefinition, value: number, tile: Tile, state: IAddonState, runtime: Runtime) => {
   //       arrayEffect(tile, self.range, runtime, (rs) => {
   //          rs.hpMultiplier.add(value, t(L.SourceAddon, t(L.HPArray)));
   //       });
   //    },
   //    range: AbilityRange.Row,
   //    shipClass: "Frigate",
   // },
} as const satisfies Record<string, IAddonDefinition>;

export type Addon = keyof typeof _Addons;
export const Addons: Record<Addon, IAddonDefinition> = _Addons;

export function getAddonEffect(amount: number): number {
   if (amount <= 0) {
      return 0;
   }
   let result = 0;
   for (let i = 1; i <= amount; i++) {
      result += 1 / i;
   }
   return result;
}
