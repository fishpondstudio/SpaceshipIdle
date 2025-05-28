import { Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getTotalBuildingValue, trySpend } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { mapSafeAdd, round, type Tile } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import type { ReactNode } from "react";
import { G } from "../utils/Global";
import { SidebarComp } from "./components/SidebarComp";

export function BatchOperationPage({ selectedTiles }: { selectedTiles: Set<Tile> }): ReactNode {
   const tiles = new Set<Tile>();
   for (const tile of selectedTiles) {
      if (G.save.current.tiles.has(tile)) {
         tiles.add(tile);
      }
   }
   return (
      <SidebarComp title={t(L.SelectedXModules, tiles.size)}>
         <div className="h10" />
         <div className="title">{t(L.Upgrade)}</div>
         <div className="divider my10" />
         <div className="mx10 row">
            <button
               className="f1 btn"
               onClick={() => {
                  let success = 0;
                  let total = 0;
                  for (const tile of tiles) {
                     const data = G.save.current.tiles.get(tile);
                     if (data) {
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
               }}
            >
               +1
            </button>
            <button
               className="f1 btn"
               onClick={() => {
                  let success = 0;
                  let total = 0;
                  for (const tile of tiles) {
                     const data = G.save.current.tiles.get(tile);
                     if (data) {
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
               }}
            >
               -1
            </button>
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
                           if (trySpend(getTotalBuildingValue(data.type, data.level, data.level + 1), G.save.current)) {
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
         </div>
         <div className="divider my10" />
         <div className="title">{t(L.Priority)}</div>
         <div className="divider my10" />
         <div className="mx10" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => {
               return (
                  <button
                     className="btn"
                     key={p}
                     onClick={() => {
                        for (const tile of tiles) {
                           const data = G.save.current.tiles.get(tile);
                           if (data) {
                              data.priority = p;
                           }
                        }
                        GameStateUpdated.emit();
                     }}
                  >
                     {p}
                  </button>
               );
            })}
         </div>
         <div className="divider my10" />
         <div className="title">{t(L.Capacity)}</div>
         <div className="divider my10" />
         <div className="mx10" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((p) => {
               return (
                  <button
                     key={p}
                     className="btn"
                     onClick={() => {
                        for (const tile of tiles) {
                           const data = G.save.current.tiles.get(tile);
                           if (data) {
                              data.capacity = round(p / 100, 1);
                           }
                        }
                        GameStateUpdated.emit();
                     }}
                  >
                     {p}
                  </button>
               );
            })}
            <Tooltip label={t(L.MatchCapacityTooltip)}>
               <button
                  className="btn"
                  onClick={() => {
                     for (const tile of tiles) {
                        G.runtime.get(tile)?.matchCapacity();
                     }
                     GameStateUpdated.emit();
                  }}
               >
                  <div className="mi">wand_stars</div>
               </button>
            </Tooltip>
         </div>
      </SidebarComp>
   );
}
