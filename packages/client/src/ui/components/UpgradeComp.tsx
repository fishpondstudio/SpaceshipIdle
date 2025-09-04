import { Popover } from "@mantine/core";
import { type Addon, Addons, getAddonEffect } from "@spaceship-idle/shared/src/game/definitions/Addons";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { hasUnequippedAddon } from "@spaceship-idle/shared/src/game/logic/AddonLogic";
import {
   getBuildingCost,
   getNextLevel,
   getTotalBuildingCost,
   upgradeMax,
} from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import {
   canSpendResource,
   refundResource,
   trySpendResource,
} from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { isShipConnected } from "@spaceship-idle/shared/src/game/logic/ShipLogic";
import { mMapOf, type Tile } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { useCallback } from "react";
import { G } from "../../utils/Global";
import { useShortcut } from "../../utils/ShortcutHook";
import type { ITileWithGameState } from "../ITileWithGameState";
import { playClick, playError } from "../Sound";
import { FloatingTip } from "./FloatingTip";
import { RenderHTML } from "./RenderHTMLComp";
import { ResourceListComp } from "./ResourceListComp";
import { TextureComp } from "./TextureComp";

export function UpgradeComp({ tile, gs }: ITileWithGameState): React.ReactNode {
   const data = gs.tiles.get(tile);
   if (!data) {
      return null;
   }
   const tiles = new Set(gs.tiles.keys());
   tiles.delete(tile);
   const canRecycle = isShipConnected(tiles);
   const recycle = useCallback(() => {
      if (canRecycle) {
         playClick();
         G.runtime.delete(tile);
         refundResource("Quantum", 1, gs.resources);
         refundResource("XP", getTotalBuildingCost(data.type, data.level, 0), gs.resources);
         GameStateUpdated.emit();
      } else {
         playError();
      }
   }, [data, tile, gs, canRecycle]);

   const upgrade = useCallback(
      (target: number) => {
         if (!trySpendResource("XP", getTotalBuildingCost(data.type, data.level, target), G.save.state.resources)) {
            playError();
            return;
         }
         data.level = target;
         GameStateUpdated.emit();
      },
      [data],
   );

   const downgrade = useCallback(
      (target: number) => {
         if (target <= 0) {
            playError();
            return;
         }
         refundResource("XP", getTotalBuildingCost(data.type, data.level, target), gs.resources);
         data.level = target;
         GameStateUpdated.emit();
      },
      [data, gs.resources],
   );

   useShortcut("Upgrade1", upgrade.bind(null, data.level + 1), [upgrade]);
   useShortcut("Upgrade5", upgrade.bind(null, getNextLevel(data.level, 5)), [upgrade]);
   useShortcut("Upgrade10", upgrade.bind(null, getNextLevel(data.level, 10)), [upgrade]);

   useShortcut("Downgrade1", downgrade.bind(null, data.level - 1), [downgrade]);
   useShortcut("Downgrade5", downgrade.bind(null, getNextLevel(data.level, -5)), [downgrade]);
   useShortcut("Downgrade10", downgrade.bind(null, getNextLevel(data.level, -10)), [downgrade]);

   useShortcut("Recycle", recycle, [recycle]);

   const upgradeMaxCached = useCallback(() => {
      upgradeMax(data, G.save.state);
      GameStateUpdated.emit();
   }, [data]);

   useShortcut("UpgradeMax", upgradeMaxCached, [upgradeMaxCached]);

   let addon: Addon | undefined;
   for (const [b, value] of G.save.state.addons) {
      if (value.tile === tile) {
         addon = b;
         break;
      }
   }

   return (
      <>
         <div className="title">
            <div className="f1">{t(L.Upgrade)}</div>
            <div>{t(L.LevelX, data.level)}</div>
         </div>
         <div className="divider my10" />
         <div className="row mx10">
            {[data.level + 1, getNextLevel(data.level, 5), getNextLevel(data.level, 10)].map((target, idx) => {
               return (
                  <button
                     key={idx}
                     className="btn f1"
                     disabled={
                        !canSpendResource(
                           "XP",
                           getTotalBuildingCost(data.type, data.level, target),
                           G.save.state.resources,
                        )
                     }
                     onClick={upgrade.bind(null, target)}
                  >
                     <FloatingTip
                        w={300}
                        label={<ResourceListComp res={{ XP: -getTotalBuildingCost(data.type, data.level, target) }} />}
                     >
                        <div>+{target - data.level}</div>
                     </FloatingTip>
                  </button>
               );
            })}
            <button
               className="btn f1"
               disabled={!canSpendResource("XP", getBuildingCost(data.type, data.level + 1), G.save.state.resources)}
               onClick={upgradeMaxCached}
            >
               {t(L.UpgradeMax)}
            </button>
         </div>
         <div className="h10" />
         <div className="row mx10">
            {[data.level - 1, getNextLevel(data.level, -5), getNextLevel(data.level, -10)].map((target, idx) => {
               return (
                  <button key={idx} className="btn f1" disabled={target <= 0} onClick={downgrade.bind(null, target)}>
                     <FloatingTip
                        w={300}
                        label={<ResourceListComp res={{ XP: getTotalBuildingCost(data.type, data.level, target) }} />}
                     >
                        <div>{target - data.level}</div>
                     </FloatingTip>
                  </button>
               );
            })}
            <button className="btn f1" disabled={!canRecycle} onClick={recycle}>
               <FloatingTip
                  w={300}
                  label={
                     <>
                        {canRecycle ? null : <div className="text-red mb5">{t(L.CannotRecycle)}</div>}
                        <ResourceListComp res={{ XP: getTotalBuildingCost(data.type, data.level, 0) }} />
                     </>
                  }
               >
                  <div className="mi">recycling</div>
               </FloatingTip>
            </button>
         </div>
         <div className="divider my10" />
         <div className="title">{t(L.Addon)}</div>
         <div className="divider my10" />
         <div className="row mx10">
            {addon ? (
               <>
                  <TextureComp name={`Addon/${addon}`} />
                  <FloatingTip
                     label={
                        <RenderHTML
                           html={Addons[addon].desc(getAddonEffect(G.save.state.addons.get(addon)?.amount ?? 0))}
                           className="text-sm"
                        />
                     }
                  >
                     <div>{Addons[addon].name()}</div>
                  </FloatingTip>
                  <div className="f1" />
               </>
            ) : hasUnequippedAddon(G.save.state) ? (
               <div className="f1 text-green">{t(L.EquippableAddons)}</div>
            ) : (
               <div className="f1 text-dimmed">{t(L.NoEquippedAddon)}</div>
            )}
            <Popover width={300} position="bottom-end" shadow="md" classNames={{ dropdown: "col stretch p10 g5" }}>
               <Popover.Target>
                  <div className="mi pointer">rule_settings</div>
               </Popover.Target>
               <Popover.Dropdown>
                  {mMapOf(G.save.state.addons, (addon, data) => {
                     if (data.amount <= 0) {
                        return null;
                     }
                     return (
                        <div key={addon} className="row">
                           <TextureComp name={`Addon/${addon}`} />
                           <div>{Addons[addon].name()}</div>
                           <div className="f1" />
                           <AddonOpButton addon={addon} me={tile} />
                        </div>
                     );
                  })}
                  {G.save.state.addons.size === 0 ? <div className="f1">{t(L.NoAvailableAddons)}</div> : null}
               </Popover.Dropdown>
            </Popover>
         </div>
      </>
   );
}

function AddonOpButton({ addon, me }: { addon: Addon; me: Tile }): React.ReactNode {
   const inv = G.save.state.addons.get(addon);
   if (!inv) {
      return null;
   }
   if (me === inv.tile) {
      return (
         <button
            className="btn red text-sm"
            onClick={() => {
               inv.tile = null;
               GameStateUpdated.emit();
            }}
         >
            {t(L.Unequip)}
         </button>
      );
   }
   return (
      <FloatingTip disabled={!inv.tile} label={<RenderHTML html={t(L.AlreadyEquippedTooltipHTML)} />}>
         <button
            className="btn row text-sm"
            onClick={() => {
               G.save.state.addons.forEach((inv) => {
                  if (inv.tile === me) {
                     inv.tile = null;
                  }
               });
               inv.tile = me;
               GameStateUpdated.emit();
            }}
         >
            <div>{inv.tile ? t(L.Reequip) : t(L.Equip)}</div>
         </button>
      </FloatingTip>
   );
}
