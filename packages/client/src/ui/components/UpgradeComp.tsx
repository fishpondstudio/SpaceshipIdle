import { Popover, Tooltip } from "@mantine/core";
import { type Booster, Boosters, getBoosterEffect } from "@spaceship-idle/shared/src/game/definitions/Boosters";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { hasUnequippedBooster } from "@spaceship-idle/shared/src/game/logic/BoosterLogic";
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
         refundResource("XP", getTotalBuildingCost(data.type, data.level, 0), gs.resources);
         GameStateUpdated.emit();
      } else {
         playError();
      }
   }, [data, tile, gs, canRecycle]);

   const upgrade = useCallback(
      (target: number) => {
         if (trySpendResource("XP", getTotalBuildingCost(data.type, data.level, target), G.save.state.resources)) {
            data.level = target;
            GameStateUpdated.emit();
         } else {
            playError();
         }
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

   let booster: Booster | undefined;
   for (const [b, value] of G.save.state.boosters) {
      if (value.tile === tile) {
         booster = b;
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
                  <Tooltip.Floating
                     w={250}
                     color="gray"
                     key={idx}
                     label={<ResourceListComp xp={-getTotalBuildingCost(data.type, data.level, target)} quantum={0} />}
                  >
                     <button
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
                        +{target - data.level}
                     </button>
                  </Tooltip.Floating>
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
                  <Tooltip.Floating
                     w={250}
                     color="gray"
                     key={idx}
                     label={<ResourceListComp xp={getTotalBuildingCost(data.type, data.level, target)} quantum={0} />}
                  >
                     <button className="btn f1" disabled={target <= 0} onClick={downgrade.bind(null, target)}>
                        {target - data.level}
                     </button>
                  </Tooltip.Floating>
               );
            })}
            <Tooltip.Floating
               w={250}
               color="gray"
               label={
                  canRecycle ? (
                     <>
                        <div>{t(L.RecycleModule)}</div>
                        <ResourceListComp xp={getTotalBuildingCost(data.type, data.level, 0)} quantum={0} />
                     </>
                  ) : (
                     t(L.CannotRecycle)
                  )
               }
            >
               <button className="btn f1 cc mi" disabled={!canRecycle} onClick={recycle}>
                  recycling
               </button>
            </Tooltip.Floating>
         </div>
         <div className="divider my10" />
         <div className="title">{t(L.Booster)}</div>
         <div className="divider my10" />
         <div className="row mx10">
            {booster ? (
               <>
                  <TextureComp name={`Booster/${booster}`} />
                  <Tooltip.Floating
                     multiline
                     label={
                        <RenderHTML
                           html={Boosters[booster].desc(
                              getBoosterEffect(G.save.state.boosters.get(booster)?.amount ?? 0),
                           )}
                           className="text-sm"
                        />
                     }
                  >
                     <div>{Boosters[booster].name()}</div>
                  </Tooltip.Floating>
                  <div className="f1" />
               </>
            ) : hasUnequippedBooster(G.save.state) ? (
               <div className="f1 text-green">{t(L.EquippableBoosters)}</div>
            ) : (
               <div className="f1 text-dimmed">{t(L.NoEquippedBooster)}</div>
            )}
            <Popover width={300} position="bottom-end" shadow="md" classNames={{ dropdown: "col stretch p10 g5" }}>
               <Popover.Target>
                  <div className="mi pointer">rule_settings</div>
               </Popover.Target>
               <Popover.Dropdown>
                  {mMapOf(G.save.state.boosters, (booster) => {
                     return (
                        <div key={booster} className="row">
                           <TextureComp name={`Booster/${booster}`} />
                           <div>{Boosters[booster].name()}</div>
                           <div className="f1" />
                           <BoosterOpButton booster={booster} me={tile} />
                        </div>
                     );
                  })}
                  {G.save.state.boosters.size === 0 ? <div className="f1">{t(L.NoAvailableBoosters)}</div> : null}
               </Popover.Dropdown>
            </Popover>
         </div>
      </>
   );
}

function BoosterOpButton({ booster, me }: { booster: Booster; me: Tile }): React.ReactNode {
   const inv = G.save.state.boosters.get(booster);
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
      <Tooltip.Floating
         disabled={!inv.tile}
         multiline
         maw="20vw"
         label={<RenderHTML html={t(L.AlreadyEquippedTooltipHTML)} />}
      >
         <button
            className="btn row g5"
            onClick={() => {
               G.save.state.boosters.forEach((inv) => {
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
      </Tooltip.Floating>
   );
}
