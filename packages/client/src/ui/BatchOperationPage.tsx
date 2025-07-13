import { Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import {
   getBuildingValue,
   getTotalBuildingValue,
   isBooster,
   tryDeductResources,
   trySpend,
} from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { mapSafeAdd, round, type Tile } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { type ReactNode, useCallback } from "react";
import { G } from "../utils/Global";
import { useShortcut } from "../utils/ShortcutHook";
import { SidebarComp } from "./components/SidebarComp";

export function BatchOperationPage({ selectedTiles }: { selectedTiles: Set<Tile> }): ReactNode {
   const tiles = new Set<Tile>();
   for (const tile of selectedTiles) {
      if (G.save.current.tiles.has(tile)) {
         tiles.add(tile);
      }
   }

   const upgrade = useCallback(() => {
      let success = 0;
      let total = 0;
      for (const tile of tiles) {
         const data = G.save.current.tiles.get(tile);
         if (data && !isBooster(data.type)) {
            if (trySpend(getTotalBuildingValue(data.type, data.level, data.level + 1), G.save.current)) {
               ++data.level;
               ++success;
            }
            ++total;
         }
      }
      if (success < total) {
         notifications.show({
            message: t(L.BatchOperationResult, success, total),
            position: "top-center",
            color: "yellow",
            withBorder: true,
         });
      }
      GameStateUpdated.emit();
   }, [tiles]);

   useShortcut("Upgrade1", upgrade, [upgrade]);

   const downgrade = useCallback(() => {
      let success = 0;
      let total = 0;
      for (const tile of tiles) {
         const data = G.save.current.tiles.get(tile);
         if (data && !isBooster(data.type)) {
            if (data.level > 1) {
               getTotalBuildingValue(data.type, data.level, data.level - 1).forEach((amount, res) => {
                  mapSafeAdd(G.save.current.resources, res, amount);
               });
               --data.level;
               ++success;
            }
            ++total;
         }
      }
      if (success < total) {
         notifications.show({
            message: t(L.BatchOperationResult, success, total),
            position: "top-center",
            color: "yellow",
            withBorder: true,
         });
      }
      GameStateUpdated.emit();
   }, [tiles]);

   useShortcut("Downgrade1", downgrade, [downgrade]);

   return (
      <SidebarComp title={t(L.SelectedXModules, tiles.size)}>
         <div className="h10" />
         <div className="title">{t(L.Upgrade)}</div>
         <div className="divider my10" />
         <div className="mx10 row">
            <button className="f1 btn" onClick={upgrade}>
               +1
            </button>
            <button className="f1 btn" onClick={downgrade}>
               -1
            </button>
            <Tooltip label={t(L.DistributeEvenlyDesc)}>
               <button
                  className="btn"
                  style={{ flex: 2 }}
                  onClick={() => {
                     const resources = G.save.current.resources;
                     G.save.current.resources = new Map();

                     for (const tile of tiles) {
                        const data = G.save.current.tiles.get(tile);
                        if (data) {
                           if (data.level > 1) {
                              getTotalBuildingValue(data.type, data.level, 1).forEach((amount, res) => {
                                 mapSafeAdd(G.save.current.resources, res, amount);
                              });
                              data.level = 1;
                           }
                        }
                     }

                     let shouldContinue = true;
                     while (shouldContinue) {
                        shouldContinue = false;
                        for (const tile of tiles) {
                           const data = G.save.current.tiles.get(tile);
                           if (data) {
                              // Here, we can use `trySpend` but we don't. `trySpend` will check max Spaceship
                              // value, which is very expensive. In this case, we know we will never hit max
                              // so skipping that check! Otherwise our while loop is too slow.
                              if (
                                 tryDeductResources(
                                    getBuildingValue(data.type, data.level + 1),
                                    G.save.current.resources,
                                 )
                              ) {
                                 ++data.level;
                                 shouldContinue = true;
                              }
                           }
                        }
                     }

                     G.save.current.resources.forEach((amount, res) => {
                        mapSafeAdd(resources, res, amount);
                     });
                     G.save.current.resources = resources;

                     GameStateUpdated.emit();
                  }}
               >
                  {t(L.DistributeEvenly)}
               </button>
            </Tooltip>
         </div>
      </SidebarComp>
   );
}
