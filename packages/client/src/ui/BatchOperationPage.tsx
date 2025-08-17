import { Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getBuildingCost, getTotalBuildingCost, trySpend } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { mapSafeAdd, type Tile } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { type ReactNode, useCallback } from "react";
import { G } from "../utils/Global";
import { useShortcut } from "../utils/ShortcutHook";
import { SidebarComp } from "./components/SidebarComp";

export function BatchOperationPage({ selectedTiles }: { selectedTiles: Set<Tile> }): ReactNode {
   const tiles = new Set<Tile>();
   for (const tile of selectedTiles) {
      if (G.save.state.tiles.has(tile)) {
         tiles.add(tile);
      }
   }

   const upgrade = useCallback(() => {
      let success = 0;
      let total = 0;
      for (const tile of tiles) {
         const data = G.save.state.tiles.get(tile);
         if (data) {
            if (trySpend(getTotalBuildingCost(data.type, data.level, data.level + 1), G.save.state)) {
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
         const data = G.save.state.tiles.get(tile);
         if (data) {
            if (data.level > 1) {
               mapSafeAdd(G.save.state.resources, "XP", getTotalBuildingCost(data.type, data.level, data.level - 1));
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
         </div>
         <div className="h10" />
         <div className="mx10">
            <Tooltip label={t(L.DistributeEvenlyDesc)}>
               <button
                  className="btn w100"
                  style={{ flex: 2 }}
                  onClick={() => {
                     const resources = G.save.state.resources;
                     G.save.state.resources = new Map();

                     for (const tile of tiles) {
                        const data = G.save.state.tiles.get(tile);
                        if (data) {
                           if (data.level > 1) {
                              const xp = getTotalBuildingCost(data.type, data.level, 1);
                              mapSafeAdd(G.save.state.resources, "XP", xp);
                              data.level = 1;
                           }
                        }
                     }

                     let shouldContinue = true;
                     while (shouldContinue) {
                        shouldContinue = false;
                        for (const tile of tiles) {
                           const data = G.save.state.tiles.get(tile);
                           if (data) {
                              if (trySpend(getBuildingCost(data.type, data.level + 1), G.save.state)) {
                                 ++data.level;
                                 shouldContinue = true;
                              }
                           }
                        }
                     }

                     const leftOver =
                        (G.save.state.resources.get("XP") ?? 0) - (G.save.state.resources.get("XPUsed") ?? 0);
                     mapSafeAdd(resources, "XPUsed", -leftOver);
                     G.save.state.resources = resources;

                     GameStateUpdated.emit();
                  }}
               >
                  Distribute Existing Upgrades Evenly
               </button>
            </Tooltip>
         </div>
         <div className="h10" />
         <div className="mx10">
            <button
               className="btn w100"
               style={{ flex: 2 }}
               onClick={() => {
                  for (const tile of tiles) {
                     const data = G.save.state.tiles.get(tile);
                     if (data) {
                        if (data.level > 1) {
                           const xp = getTotalBuildingCost(data.type, data.level, 1);
                           mapSafeAdd(G.save.state.resources, "XPUsed", -xp);
                           data.level = 1;
                        }
                     }
                  }

                  let shouldContinue = true;
                  while (shouldContinue) {
                     shouldContinue = false;
                     for (const tile of tiles) {
                        const data = G.save.state.tiles.get(tile);
                        if (data) {
                           if (trySpend(getBuildingCost(data.type, data.level + 1), G.save.state)) {
                              ++data.level;
                              shouldContinue = true;
                           }
                        }
                     }
                  }

                  GameStateUpdated.emit();
               }}
            >
               Invest All XP and Redistribute Evenly
            </button>
         </div>
      </SidebarComp>
   );
}
