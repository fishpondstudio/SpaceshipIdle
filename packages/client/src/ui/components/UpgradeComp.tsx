import { Popover, Tooltip } from "@mantine/core";
import { type Booster, Boosters } from "@spaceship-idle/shared/src/game/definitions/Boosters";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import {
   canSpend,
   getBuildingCost,
   getNextLevel,
   getTotalBuildingCost,
   trySpend,
   upgradeMax,
} from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { isShipConnected } from "@spaceship-idle/shared/src/game/logic/ShipLogic";
import { mapSafeAdd, mMapOf, type Tile } from "@spaceship-idle/shared/src/utils/Helper";
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
         mapSafeAdd(gs.resources, "XP", getTotalBuildingCost(data.type, data.level, 0));
         GameStateUpdated.emit();
      } else {
         playError();
      }
   }, [data, tile, gs, canRecycle]);

   const upgrade = useCallback(
      (target: number) => {
         if (trySpend(getTotalBuildingCost(data.type, data.level, target), G.save.current)) {
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
         mapSafeAdd(gs.resources, "XP", getTotalBuildingCost(data.type, data.level, target));
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
      upgradeMax(data, G.save.current);
      GameStateUpdated.emit();
   }, [data]);

   useShortcut("UpgradeMax", upgradeMaxCached, [upgradeMaxCached]);

   let booster: Booster | undefined;
   for (const [b, value] of G.save.current.boosters) {
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
                  <Tooltip
                     key={idx}
                     label={<ResourceListComp xp={getTotalBuildingCost(data.type, data.level, target)} />}
                  >
                     <button
                        className="btn f1"
                        disabled={!canSpend(getTotalBuildingCost(data.type, data.level, target), G.save.current)}
                        onClick={upgrade.bind(null, target)}
                     >
                        +{target - data.level}
                     </button>
                  </Tooltip>
               );
            })}
            <button
               className="btn f1"
               disabled={!canSpend(getBuildingCost(data.type, data.level + 1), G.save.current)}
               onClick={upgradeMaxCached}
            >
               {t(L.UpgradeMax)}
            </button>
         </div>
         <div className="h10" />
         <div className="row mx10">
            {[data.level - 1, getNextLevel(data.level, -5), getNextLevel(data.level, -10)].map((target, idx) => {
               return (
                  <Tooltip
                     key={idx}
                     label={
                        <ResourceListComp xp={getTotalBuildingCost(data.type, data.level, target)} showColor={false} />
                     }
                  >
                     <button className="btn f1" disabled={target <= 0} onClick={downgrade.bind(null, target)}>
                        {target - data.level}
                     </button>
                  </Tooltip>
               );
            })}
            <Tooltip
               label={
                  canRecycle ? (
                     <>
                        <div>{t(L.RecycleModule)}</div>
                        <ResourceListComp xp={getTotalBuildingCost(data.type, data.level, 0)} showColor={false} />
                     </>
                  ) : (
                     t(L.CannotRecycle)
                  )
               }
            >
               <button className="btn f1 cc mi" disabled={!canRecycle} onClick={recycle}>
                  recycling
               </button>
            </Tooltip>
         </div>
         <div className="divider my10" />
         <div className="title">{t(L.Booster)}</div>
         <div className="divider my10" />
         <div className="row mx10">
            {booster ? (
               <>
                  <TextureComp name={`Booster/${booster}`} />
                  <Tooltip
                     multiline
                     maw="30vw"
                     label={
                        <RenderHTML
                           html={Boosters[booster].desc(G.save.current.boosters.get(booster)?.amount ?? 0)}
                           className="text-sm"
                        />
                     }
                  >
                     <div>{Boosters[booster].name()}</div>
                  </Tooltip>
                  <div className="f1" />
               </>
            ) : (
               <div className="f1 text-dimmed">{t(L.NoEquippedBooster)}</div>
            )}
            <Popover width={300} position="bottom-end" shadow="md" classNames={{ dropdown: "col stretch p10 g5" }}>
               <Popover.Target>
                  <div className="mi pointer">rule_settings</div>
               </Popover.Target>
               <Popover.Dropdown>
                  {mMapOf(G.save.current.boosters, (booster) => {
                     return (
                        <div key={booster} className="row">
                           <TextureComp name={`Booster/${booster}`} />
                           <div>{Boosters[booster].name()}</div>
                           <div className="f1" />
                           <BoosterOpButton booster={booster} me={tile} />
                        </div>
                     );
                  })}
               </Popover.Dropdown>
            </Popover>
         </div>
      </>
   );
}

function BoosterOpButton({ booster, me }: { booster: Booster; me: Tile }): React.ReactNode {
   const inv = G.save.current.boosters.get(booster);
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
      <Tooltip disabled={!inv.tile} multiline maw="20vw" label={<RenderHTML html={t(L.AlreadyEquippedTooltipHTML)} />}>
         <button
            className="btn text-sm"
            onClick={() => {
               G.save.current.boosters.forEach((inv) => {
                  if (inv.tile === me) {
                     inv.tile = null;
                  }
               });
               inv.tile = me;
               GameStateUpdated.emit();
            }}
         >
            {t(L.Equip)}
         </button>
      </Tooltip>
   );
}
