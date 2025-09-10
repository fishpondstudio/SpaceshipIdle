import { cast, formatNumber, type Tile } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import type { Runtime } from "../logic/Runtime";
import type { RuntimeTile } from "../logic/RuntimeTile";
import { AbilityRange, abilityTarget } from "./Ability";
import type { Blueprint } from "./Blueprints";
import type { Building } from "./Buildings";
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
      name: () => t(L.HPBooster),
      desc: (value: number) => t(L.HPBoosterDesc, formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         const rs = runtime.get(tile);
         if (!rs) {
            return;
         }
         rs.hpMultiplier.add(value, t(L.SourceAddon, t(L.HPBooster)));
      },
      shipClass: "Scout",
   }),
   HP2: cast<IAddonDefinition>({
      name: () => t(L.RecoveryCluster),
      desc: (value: number) => t(L.RecoveryClusterDesc, formatNumber(value * 10), formatNumber(value * 10)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         clusterEffect(tile, runtime, (rs) => {
            rs.recoverHp(value * 10);
         });
      },
      shipClass: "Scout",
   }),
   HP3: cast<IAddonDefinition>({
      name: () => t(L.HPCluster),
      desc: (value: number) => t(L.HPClusterDesc, formatNumber(value), formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         clusterEffect(tile, runtime, (rs) => {
            rs.hpMultiplier.add(value, t(L.SourceAddon, t(L.HPCluster)));
         });
      },
      shipClass: "Corvette",
   }),
   HP4: cast<IAddonDefinition>({
      name: () => t(L.HPDiversifier),
      desc: (value: number) => t(L.HPDiversifierDesc, formatNumber(value), formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         diversifierEffect(tile, runtime, (rs) => {
            rs.hpMultiplier.add(value, t(L.SourceAddon, t(L.HPDiversifier)));
         });
      },
      shipClass: "Corvette",
   }),
   Damage1: cast<IAddonDefinition>({
      name: () => t(L.DamageBooster),
      desc: (value: number) => t(L.DamageBoosterDesc, formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         const rs = runtime.get(tile);
         if (!rs) {
            return;
         }
         rs.damageMultiplier.add(value, t(L.SourceAddon, t(L.DamageBooster)));
      },
      shipClass: "Skiff",
   }),
   Damage2: cast<IAddonDefinition>({
      name: () => t(L.DamageCluster),
      desc: (value: number) => t(L.DamageClusterDesc, formatNumber(value), formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         clusterEffect(tile, runtime, (rs) => {
            rs.damageMultiplier.add(value, t(L.SourceAddon, t(L.DamageCluster)));
         });
      },
      shipClass: "Scout",
   }),
   Damage3: cast<IAddonDefinition>({
      name: () => t(L.DamageDiversifier),
      desc: (value: number) => t(L.DamageDiversifierDesc, formatNumber(value), formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         diversifierEffect(tile, runtime, (rs) => {
            rs.damageMultiplier.add(value, t(L.SourceAddon, t(L.DamageDiversifier)));
         });
      },
      shipClass: "Corvette",
   }),
   Damage4: cast<IAddonDefinition>({
      name: () => t(L.DamageEqualizer),
      desc: (value: number) => t(L.DamageEqualizerDesc, formatNumber(value), formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         equalizerEffect(tile, runtime, (rs) => {
            rs.damageMultiplier.add(value, t(L.SourceAddon, t(L.DamageEqualizer)));
         });
      },
      shipClass: "Corvette",
   }),
   Evasion1: cast<IAddonDefinition>({
      name: () => t(L.EvasionCluster),
      desc: (value: number) => t(L.EvasionCoreDesc, formatNumber(value), formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         clusterEffect(tile, runtime, (rs) => {
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

function clusterEffect(tile: Tile, runtime: Runtime, effect: (rs: RuntimeTile) => void): void {
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
      if (targetRs && targetRs.data.type === rs.data.type) {
         effect(targetRs);
      }
   });
}

function diversifierEffect(tile: Tile, runtime: Runtime, effect: (rs: RuntimeTile) => void): void {
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

function equalizerEffect(tile: Tile, runtime: Runtime, effect: (rs: RuntimeTile) => void): void {
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
      if (targetRs && targetRs.data.level < rs.data.level) {
         effect(targetRs);
      }
   });
}
