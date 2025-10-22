import { formatNumber, formatPercent, setFlag, type Tile } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { Config } from "../Config";
import { parseBuildingCode } from "../logic/BuildingLogic";
import type { Runtime } from "../logic/Runtime";
import type { IAddonState, RuntimeTile } from "../logic/RuntimeTile";
import { AbilityRange, abilityTarget } from "./Ability";
import type { Blueprint } from "./Blueprints";
import type { Building } from "./Buildings";
import type { BuildingType } from "./CodeNumber";
import { ProjectileFlag } from "./ProjectileFlag";
import type { ShipClass } from "./ShipClass";
import { addonStatusEffectKey } from "./StatusEffect";

export interface IAddonDefinition {
   name: () => string;
   desc: (value: number) => string;
   tick: (value: number, tile: Tile, state: IAddonState, runtime: Runtime) => void;
   shipClass: ShipClass;
   blueprint?: Blueprint;
}

export const _Addons = {
   Evasion1: {
      name: () => t(L.EvasionDiversity),
      desc: (value: number) => t(L.EvasionDiversityDesc, formatNumber(value / 2), formatNumber(value / 2)),
      tick: (value: number, tile: Tile, state: IAddonState, runtime: Runtime) => {
         diversityEffect(tile, runtime, (rs) => {
            rs.props.evasion += value / 2;
         });
      },
      shipClass: "Skiff",
   },
   Damage1: {
      name: () => t(L.DamageContrast),
      desc: (value: number) => t(L.DamageContrastDesc, formatNumber(value), formatNumber(value)),
      tick: (value: number, tile: Tile, state: IAddonState, runtime: Runtime) => {
         contrastEffect(tile, runtime, (rs) => {
            rs.damageMultiplier.add(value, t(L.SourceAddon, t(L.DamageContrast)));
         });
      },
      shipClass: "Skiff",
   },
   HP1: {
      name: () => t(L.HPArray),
      desc: (value: number) => t(L.HPArrayDesc, formatNumber(value), formatNumber(value)),
      tick: (value: number, tile: Tile, state: IAddonState, runtime: Runtime) => {
         arrayEffect(tile, runtime, (rs) => {
            rs.hpMultiplier.add(value, t(L.SourceAddon, t(L.HPArray)));
         });
      },
      shipClass: "Scout",
   },
   HP2: {
      name: () => t(L.RecoveryDiversity),
      desc: (value: number) => {
         const percent = formatPercent(Math.min(0.04 + 0.01 * value, 0.25));
         return t(L.RecoveryDiversityDesc, percent, percent);
      },
      tick: (value: number, tile: Tile, state: IAddonState, runtime: Runtime) => {
         diversityEffect(tile, runtime, (rs) => {
            rs.recoverHp(Math.min(0.04 + 0.01 * value, 0.25) * rs.props.hp);
         });
      },
      shipClass: "Scout",
   },
   Damage2: {
      name: () => t(L.PrecisionDiversity),
      desc: (value: number) => t(L.PrecisionDiversityDesc, formatNumber(value / 2), formatNumber(value / 2)),
      tick: (value: number, tile: Tile, state: IAddonState, runtime: Runtime) => {
         diversityEffect(tile, runtime, (rs) => {
            rs.props.projectileFlag = setFlag(rs.props.projectileFlag, ProjectileFlag.NoEvasion);
            rs.damageMultiplier.add(value / 2, t(L.SourceAddon, t(L.PrecisionDiversity)));
         });
      },
      shipClass: "Scout",
   },
   HP3: {
      name: () => t(L.LaserBlockMatrix),
      desc: (value: number) => t(L.LaserBlockMatrixDesc, formatNumber(value / 2), formatNumber(value / 2)),
      tick: (value: number, tile: Tile, state: IAddonState, runtime: Runtime) => {
         matrixEffect(tile, runtime, (rs) => {
            rs.hpMultiplier.add(value / 2, t(L.SourceAddon, t(L.LaserBlockMatrix)));
         });
      },
      shipClass: "Corvette",
   },
   HP4: {
      name: () => t(L.HPDiversity),
      desc: (value: number) => t(L.HPDiversityDesc, formatNumber(value), formatNumber(value)),
      tick: (value: number, tile: Tile, state: IAddonState, runtime: Runtime) => {
         diversityEffect(tile, runtime, (rs) => {
            rs.hpMultiplier.add(value, t(L.SourceAddon, t(L.HPDiversity)));
         });
      },
      shipClass: "Corvette",
   },
   Damage3: {
      name: () => t(L.DamageDiversity),
      desc: (value: number) => t(L.DamageDiversityDesc, formatNumber(value), formatNumber(value)),
      tick: (value: number, tile: Tile, state: IAddonState, runtime: Runtime) => {
         diversityEffect(tile, runtime, (rs) => {
            rs.damageMultiplier.add(value, t(L.SourceAddon, t(L.DamageDiversity)));
         });
      },
      shipClass: "Corvette",
   },
   Damage4: {
      name: () => t(L.TrueStrikeArray),
      desc: (value: number) => t(L.TrueStrikeArrayDesc, formatNumber(value / 2), formatNumber(value / 2)),
      tick: (value: number, tile: Tile, state: IAddonState, runtime: Runtime) => {
         arrayEffect(tile, runtime, (rs) => {
            rs.props.projectileFlag = setFlag(rs.props.projectileFlag, ProjectileFlag.TrueDamage);
            rs.damageMultiplier.add(value / 2, t(L.SourceAddon, t(L.TrueStrikeArray)));
         });
      },
      shipClass: "Corvette",
   },
   Damage5: {
      name: () => t(L.PrecisionMatrix),
      desc: (value: number) => t(L.PrecisionMatrixDesc, formatNumber(value / 2), formatNumber(value / 2)),
      tick: (value: number, tile: Tile, state: IAddonState, runtime: Runtime) => {
         matrixEffect(tile, runtime, (rs) => {
            rs.props.projectileFlag = setFlag(rs.props.projectileFlag, ProjectileFlag.NoEvasion);
            rs.damageMultiplier.add(value / 2, t(L.SourceAddon, t(L.PrecisionMatrixDesc)));
         });
      },
      shipClass: "Frigate",
   },
   HP5: {
      name: () => t(L.PurifierManifold),
      desc: (value: number) => t(L.PurifierManifoldDesc, formatNumber(value / 2), formatNumber(value / 2)),
      tick: (value: number, tile: Tile, state: IAddonState, runtime: Runtime) => {
         diversityEffect(tile, runtime, (rs) => {
            rs.hpMultiplier.add(value / 2, t(L.SourceAddon, t(L.PurifierManifold)));
         });
         if (state.tick >= 5) {
            diversityEffect(tile, runtime, (rs) => {
               rs.addStatusEffect(addonStatusEffectKey(tile), {
                  statusEffect: "PurifyDebuff",
                  source: t(L.SourceAddon, t(L.PurifierManifold)),
                  value: value / 2,
                  timeLeft: 1,
               });
            });
            state.tick = 0;
         }
      },
      shipClass: "Frigate",
   },
   Damage6: {
      name: () => t(L.CriticalStrikeDiversity),
      desc: (value: number) => t(L.CriticalStrikeDiversityDesc, formatNumber(value / 2), formatNumber(value / 2)),
      tick: (value: number, tile: Tile, state: IAddonState, runtime: Runtime) => {
         matrixEffect(tile, runtime, (rs) => {
            rs.addStatusEffect(addonStatusEffectKey(tile), {
               statusEffect: "CriticalDamage2",
               source: t(L.SourceAddon, t(L.CriticalStrikeDiversity)),
               value: 0.25,
               timeLeft: Number.POSITIVE_INFINITY,
            });
            rs.damageMultiplier.add(value / 2, t(L.SourceAddon, t(L.CriticalStrikeDiversity)));
         });
      },
      shipClass: "Frigate",
   },
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

function contrastEffect(tile: Tile, runtime: Runtime, effect: (rs: RuntimeTile) => void): void {
   const rs = runtime.get(tile);
   if (!rs) {
      return;
   }
   effect(rs);
   const result = runtime.getGameState(tile);
   if (!result) {
      return;
   }
   const { side, state } = result;
   abilityTarget(side, AbilityRange.Adjacent, tile, state.tiles).forEach((target) => {
      if (target === tile) {
         return;
      }
      const targetRs = runtime.get(target);
      if (targetRs && targetRs.def.damageType !== rs.def.damageType) {
         effect(targetRs);
      }
   });
}

function arrayEffect(tile: Tile, runtime: Runtime, effect: (rs: RuntimeTile) => void): void {
   const rs = runtime.get(tile);
   if (!rs) {
      return;
   }
   effect(rs);
   const result = runtime.getGameState(tile);
   if (!result) {
      return;
   }
   const { side, state } = result;
   const { series } = parseBuildingCode(rs.data.type);
   abilityTarget(side, AbilityRange.Adjacent, tile, state.tiles).forEach((target) => {
      if (target === tile) {
         return;
      }
      const targetRs = runtime.get(target);
      if (targetRs && parseBuildingCode(targetRs.data.type).series !== series) {
         effect(targetRs);
      }
   });
}

function matrixEffect(tile: Tile, runtime: Runtime, effect: (rs: RuntimeTile) => void): void {
   const rs = runtime.get(tile);
   if (!rs) {
      return;
   }
   effect(rs);
   const result = runtime.getGameState(tile);
   if (!result) {
      return;
   }
   const { side, state } = result;
   const shipClass = Config.BuildingToShipClass[rs.data.type];
   abilityTarget(side, AbilityRange.Adjacent, tile, state.tiles).forEach((target) => {
      if (target === tile) {
         return;
      }
      const targetRs = runtime.get(target);
      if (targetRs && Config.BuildingToShipClass[targetRs.data.type] !== shipClass) {
         effect(targetRs);
      }
   });
}

function diversityEffect(tile: Tile, runtime: Runtime, effect: (rs: RuntimeTile) => void): void {
   const rs = runtime.get(tile);
   if (!rs) {
      return;
   }
   effect(rs);
   const result = runtime.getGameState(tile);
   if (!result) {
      return;
   }
   const { side, state } = result;
   const targetTiles = abilityTarget(side, AbilityRange.Adjacent, tile, state.tiles);
   const uniqueBuildingTypes = new Set<Building>();
   targetTiles.forEach((target) => {
      const targetRs = runtime.get(target);
      if (targetRs) {
         uniqueBuildingTypes.add(targetRs.data.type);
      }
   });
   if (uniqueBuildingTypes.size !== targetTiles.length) {
      return;
   }
   targetTiles.forEach((target) => {
      if (target === tile) {
         return;
      }
      const targetRs = runtime.get(target);
      if (targetRs) {
         effect(targetRs);
      }
   });
}

function manifoldEffect(tile: Tile, runtime: Runtime, effect: (rs: RuntimeTile) => void): void {
   const rs = runtime.get(tile);
   if (!rs) {
      return;
   }
   effect(rs);
   const result = runtime.getGameState(tile);
   if (!result) {
      return;
   }
   const { side, state } = result;
   const targetTiles = abilityTarget(side, AbilityRange.Adjacent, tile, state.tiles);
   const uniqueTypes = new Set<BuildingType>();
   targetTiles.forEach((target) => {
      const targetRs = runtime.get(target);
      if (targetRs) {
         const type = Config.Buildings[targetRs.data.type].type;
         uniqueTypes.add(type);
      }
   });
   if (uniqueTypes.size !== targetTiles.length) {
      return;
   }
   targetTiles.forEach((target) => {
      if (target === tile) {
         return;
      }
      const targetRs = runtime.get(target);
      if (targetRs) {
         effect(targetRs);
      }
   });
}
