import { Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import {
   getBuildingTypes,
   getBuildingValue,
   getTopEndBuildings,
   getTotalBuildingValue,
   isBooster,
   tryDeductResources,
   trySpend,
} from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { mapSafeAdd, round, type Tile } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { useCallback, type ReactNode } from "react";
import { ShipScene } from "../scenes/ShipScene";
import { G } from "../utils/Global";
import { useShortcut } from "../utils/ShortcutHook";
import { RenderHTML } from "./components/RenderHTMLComp";
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

   const matchCapacityCached = useCallback(() => {
      for (const tile of tiles) {
         G.runtime.get(tile)?.matchCapacity();
      }
      GameStateUpdated.emit();
   }, [tiles]);

   useShortcut("MatchCapacityToAmmoProduction", matchCapacityCached, [matchCapacityCached]);

   const setPriority = useCallback(
      (p: number) => {
         for (const tile of tiles) {
            const data = G.save.current.tiles.get(tile);
            if (data) {
               data.priority = p;
            }
         }
         GameStateUpdated.emit();
      },
      [tiles],
   );

   const setCapacity = useCallback(
      (p: number) => {
         for (const tile of tiles) {
            const data = G.save.current.tiles.get(tile);
            if (data) {
               data.capacity = round(p / 100, 1);
            }
         }
         GameStateUpdated.emit();
      },
      [tiles],
   );

   useShortcut("Priority0", setPriority.bind(null, 0), [setPriority]);
   useShortcut("Priority10", setPriority.bind(null, 10), [setPriority]);

   useShortcut("Capacity0", setCapacity.bind(null, 0), [setCapacity]);
   useShortcut("Capacity100", setCapacity.bind(null, 100), [setCapacity]);

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
         <div className="divider my10" />
         <div className="title">{t(L.Priority)}</div>
         <div className="divider my10" />
         <div className="mx10" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => {
               return (
                  <button className="btn" key={p} onClick={setPriority.bind(null, p)}>
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
                  <button key={p} className="btn" onClick={setCapacity.bind(null, p)}>
                     {p}
                  </button>
               );
            })}
            <Tooltip label={t(L.MatchCapacityTooltip)}>
               <button className="btn" onClick={matchCapacityCached}>
                  <div className="mi">wand_stars</div>
               </button>
            </Tooltip>
         </div>
         <div className="divider my10" />
         <div className="mx10">
            <Tooltip multiline maw="30vw" label={<RenderHTML html={t(L.SelectTopEndBuildingsTooltipHTML)} />}>
               <button
                  className="btn w100"
                  onClick={() => {
                     const buildings = getTopEndBuildings(getBuildingTypes(G.save.current.tiles));
                     const tiles = new Set<Tile>();
                     for (const [tile, data] of G.save.current.tiles) {
                        if (buildings.has(data.type)) {
                           tiles.add(tile);
                        }
                     }
                     console.log(tiles);
                     G.scene.getCurrent(ShipScene)?.selectTiles(tiles);
                  }}
               >
                  {t(L.SelectTopEndBuildings)}
               </button>
            </Tooltip>
         </div>
      </SidebarComp>
   );
}
