import { Image, Slider, Tooltip } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { AbilityRangeLabel } from "@spaceship-idle/shared/src/game/definitions/Ability";
import type { IBoosterDefinition } from "@spaceship-idle/shared/src/game/definitions/BuildingProps";
import type { Building } from "@spaceship-idle/shared/src/game/definitions/Buildings";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import {
   canSpend,
   getBuildingValue,
   getNextLevel,
   getTotalBuildingValue,
   isBooster,
   trySpend,
   upgradeMax,
} from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { isShipConnected } from "@spaceship-idle/shared/src/game/logic/ShipLogic";
import { mapSafeAdd, round } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { memo, useCallback } from "react";
import { G } from "../../utils/Global";
import { useShortcut } from "../../utils/ShortcutHook";
import type { ITileWithGameState } from "../ITileWithGameState";
import { playClick, playError } from "../Sound";
import { AbilityRangeImage } from "./AbilityComp";
import { ResourceListComp } from "./ResourceListComp";

export function UpgradeComp({ tile, gs }: ITileWithGameState): React.ReactNode {
   const data = gs.tiles.get(tile);
   if (!data) {
      return null;
   }
   if (isBooster(data.type)) {
      return <BoosterComp building={data.type} />;
   }
   const tiles = new Set(gs.tiles.keys());
   tiles.delete(tile);
   const canRecycle = isShipConnected(tiles);
   const recycle = useCallback(() => {
      if (canRecycle) {
         playClick();
         G.runtime.delete(tile);
         getTotalBuildingValue(data.type, data.level, 0).forEach((amount, res) => {
            mapSafeAdd(gs.resources, res, amount);
         });
         GameStateUpdated.emit();
      } else {
         playError();
      }
   }, [data, tile, gs, canRecycle]);

   const upgrade = useCallback(
      (target: number) => {
         if (trySpend(getTotalBuildingValue(data.type, data.level, target), G.save.current)) {
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
         getTotalBuildingValue(data.type, data.level, target).forEach((amount, res) => {
            mapSafeAdd(gs.resources, res, amount);
         });
         data.level = target;
         GameStateUpdated.emit();
      },
      [data, gs.resources],
   );

   useShortcut("Upgrade1", upgrade.bind(null, data.level + 1));
   useShortcut("Upgrade5", upgrade.bind(null, getNextLevel(data.level, 5)));
   useShortcut("Upgrade10", upgrade.bind(null, getNextLevel(data.level, 10)));

   useShortcut("Downgrade1", downgrade.bind(null, data.level - 1));
   useShortcut("Downgrade5", downgrade.bind(null, getNextLevel(data.level, -5)));
   useShortcut("Downgrade10", downgrade.bind(null, getNextLevel(data.level, -10)));

   useShortcut("Recycle", recycle);

   const upgradeMaxCached = useCallback(() => {
      upgradeMax(data, G.save.current);
      GameStateUpdated.emit();
   }, [data]);

   useShortcut("UpgradeMax", upgradeMaxCached);

   const matchCapacityCached = useCallback(() => {
      G.runtime.get(tile)?.matchCapacity();
      GameStateUpdated.emit();
   }, [tile]);

   useShortcut("MatchCapacityToAmmoProduction", matchCapacityCached);

   const setPriority = useCallback(
      (value: number) => {
         data.priority = value;
         GameStateUpdated.emit();
      },
      [data],
   );

   useShortcut("Priority0", setPriority.bind(null, 0));
   useShortcut("Priority10", setPriority.bind(null, 10));

   const setCapacity = useCallback(
      (value: number) => {
         data.capacity = round(value / 100, 2);
         GameStateUpdated.emit();
      },
      [data],
   );

   useShortcut("Capacity0", setCapacity.bind(null, 0));
   useShortcut("Capacity100", setCapacity.bind(null, 1));

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
                     label={<ResourceListComp res={getTotalBuildingValue(data.type, data.level, target)} />}
                  >
                     <button
                        className="btn f1"
                        disabled={!canSpend(getTotalBuildingValue(data.type, data.level, target), G.save.current)}
                        onClick={upgrade.bind(null, target)}
                     >
                        +{target - data.level}
                     </button>
                  </Tooltip>
               );
            })}
            <button
               className="btn f1"
               disabled={!canSpend(getBuildingValue(data.type, data.level + 1), G.save.current)}
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
                        <ResourceListComp
                           res={getTotalBuildingValue(data.type, data.level, target)}
                           showColor={false}
                        />
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
                        <ResourceListComp res={getTotalBuildingValue(data.type, data.level, 0)} showColor={false} />
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
         <div className="mx10">
            <div className="subtitle my10">{t(L.Priority)}</div>
            <Slider
               flex={1}
               min={0}
               max={10}
               step={1}
               marks={[
                  { value: 0, label: "0" },
                  { value: 5, label: "5" },
                  { value: 10, label: "10" },
               ]}
               onChange={setPriority}
               value={data.priority}
            />
         </div>
         <div className="h10" />
         <div className="mx10">
            <div className="subtitle my10">
               {t(L.Capacity)}
               <Tooltip label={t(L.MatchCapacityTooltip)}>
                  <div className="mi text-space pointer" onClick={matchCapacityCached}>
                     wand_stars
                  </div>
               </Tooltip>
            </div>
            <Slider
               flex={1}
               min={0}
               max={100}
               step={1}
               marks={[
                  { value: 0, label: "0%" },
                  { value: 50, label: "50%" },
                  { value: 100, label: "100%" },
               ]}
               onChange={setCapacity}
               value={Math.round(data.capacity * 100)}
            />
            <div className="h20" />
         </div>
      </>
   );
}

function _BoosterComp({ building }: { building: Building }): React.ReactNode {
   const def = Config.Buildings[building];
   if (!isBooster(building)) {
      return null;
   }
   const booster = def as IBoosterDefinition;
   return (
      <div className="mx10">
         <div className="row">
            <div className="f1">{t(L.BoostEffect)}</div>
            <div>{booster.desc()}</div>
         </div>
         <div className="row">
            <div className="f1">{t(L.BoostRange)}</div>
            <Tooltip
               p={5}
               disabled={!AbilityRangeImage[booster.range]}
               label={<Image radius="sm" w={200} src={AbilityRangeImage[booster.range]} />}
            >
               <div className="text-space">{AbilityRangeLabel[booster.range]()}</div>
            </Tooltip>
         </div>
         <div className="row">
            <div className="f1">{t(L.BoosterLifeTime)}</div>
            <Tooltip label={t(L.BoosterLifeTimeDesc, booster.lifeTime)}>
               <div>{booster.lifeTime}</div>
            </Tooltip>
         </div>
      </div>
   );
}

const BoosterComp = memo(_BoosterComp, (oldProps, newProps) => {
   return oldProps.building === newProps.building;
});
