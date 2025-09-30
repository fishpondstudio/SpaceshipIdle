import { cast, formatNumber, setFlag, type Tile } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { Config } from "../Config";
import { parseBuildingCode } from "../logic/BuildingLogic";
import type { Runtime } from "../logic/Runtime";
import type { RuntimeTile } from "../logic/RuntimeTile";
import { AbilityRange, abilityTarget } from "./Ability";
import type { Blueprint } from "./Blueprints";
import type { Building } from "./Buildings";
import { ProjectileFlag } from "./ProjectileFlag";
import type { ShipClass } from "./ShipClass";

export interface IAddonDefinition {
   name: () => string;
   desc: (value: number) => string;
   tick: (value: number, tile: Tile, runtime: Runtime) => void;
   shipClass: ShipClass;
   blueprint?: Blueprint;
}

export const Addons = {
   HP1: cast<IAddonDefinition>({
      name: () => t(L.HPArray),
      desc: (value: number) => t(L.HPArrayDesc, formatNumber(value), formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         arrayEffect(tile, runtime, (rs) => {
            rs.hpMultiplier.add(value, t(L.SourceAddon, t(L.HPArray)));
         });
      },
      shipClass: "Scout",
   }),
   HP2: cast<IAddonDefinition>({
      name: () => t(L.RecoveryDiversity),
      desc: (value: number) => t(L.RecoveryDiversityDesc, formatNumber(value * 10), formatNumber(value * 10)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         diversityEffect(tile, runtime, (rs) => {
            rs.recoverHp(value * 10);
         });
      },
      shipClass: "Scout",
   }),
   HP3: cast<IAddonDefinition>({
      name: () => t(L.LaserBlockMatrix),
      desc: (value: number) => t(L.LaserBlockMatrixDesc, formatNumber(value / 2), formatNumber(value / 2)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         matrixEffect(tile, runtime, (rs) => {
            rs.hpMultiplier.add(value / 2, t(L.SourceAddon, t(L.LaserBlockMatrix)));
         });
      },
      shipClass: "Corvette",
   }),
   HP4: cast<IAddonDefinition>({
      name: () => t(L.HPDiversity),
      desc: (value: number) => t(L.HPDiversityDesc, formatNumber(value), formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         diversityEffect(tile, runtime, (rs) => {
            rs.hpMultiplier.add(value, t(L.SourceAddon, t(L.HPDiversity)));
         });
      },
      shipClass: "Corvette",
   }),
   Damage1: cast<IAddonDefinition>({
      name: () => t(L.DamageContrast),
      desc: (value: number) => t(L.DamageContrastDesc, formatNumber(value), formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         contrastEffect(tile, runtime, (rs) => {
            rs.damageMultiplier.add(value, t(L.SourceAddon, t(L.DamageContrast)));
         });
      },
      shipClass: "Skiff",
   }),
   Damage2: cast<IAddonDefinition>({
      name: () => t(L.PrecisionDiversity),
      desc: (value: number) => t(L.PrecisionDiversityDesc, formatNumber(value / 2), formatNumber(value / 2)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         diversityEffect(tile, runtime, (rs) => {
            rs.props.projectileFlag = setFlag(rs.props.projectileFlag, ProjectileFlag.NoEvasion);
            rs.damageMultiplier.add(value / 2, t(L.SourceAddon, t(L.PrecisionDiversity)));
         });
      },
      shipClass: "Scout",
   }),
   Damage3: cast<IAddonDefinition>({
      name: () => t(L.DamageDiversity),
      desc: (value: number) => t(L.DamageDiversityDesc, formatNumber(value), formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         diversityEffect(tile, runtime, (rs) => {
            rs.damageMultiplier.add(value, t(L.SourceAddon, t(L.DamageDiversity)));
         });
      },
      shipClass: "Corvette",
   }),
   Damage4: cast<IAddonDefinition>({
      name: () => t(L.TrueStrikeArray),
      desc: (value: number) => t(L.TrueStrikeArrayDesc, formatNumber(value / 2), formatNumber(value / 2)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         arrayEffect(tile, runtime, (rs) => {
            rs.props.projectileFlag = setFlag(rs.props.projectileFlag, ProjectileFlag.TrueDamage);
            rs.damageMultiplier.add(value / 2, t(L.SourceAddon, t(L.TrueStrikeArray)));
         });
      },
      shipClass: "Corvette",
   }),
   Evasion1: cast<IAddonDefinition>({
      name: () => t(L.EvasionDiversity),
      desc: (value: number) => t(L.EvasionDiversityDesc, formatNumber(value), formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         diversityEffect(tile, runtime, (rs) => {
            rs.props.evasion += value;
         });
      },
      shipClass: "Skiff",
   }),
} as const satisfies Record<string, IAddonDefinition>;

export type Addon = keyof typeof Addons;

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
