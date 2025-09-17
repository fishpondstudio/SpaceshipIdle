import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { showWarning } from "@spaceship-idle/shared/src/game/logic/AlertLogic";
import { getBuildingCost, getTotalBuildingCost } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { refundResource, resourceOf, trySpendResource } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import type { Tile } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { type ReactNode, useCallback } from "react";
import { G } from "../utils/Global";
import { useShortcut } from "../utils/ShortcutHook";
import { FloatingTip } from "./components/FloatingTip";
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
            if (
               trySpendResource(
                  "XP",
                  getTotalBuildingCost(data.type, data.level, data.level + 1),
                  G.save.state.resources,
               )
            ) {
               ++data.level;
               ++success;
            }
            ++total;
         }
      }
      if (success < total) {
         showWarning(t(L.BatchOperationResult, success, total));
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
               refundResource(
                  "XP",
                  getTotalBuildingCost(data.type, data.level, data.level - 1),
                  G.save.state.resources,
               );
               --data.level;
               ++success;
            }
            ++total;
         }
      }
      if (success < total) {
         showWarning(t(L.BatchOperationResult, success, total));
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
            <FloatingTip label={t(L.DistributeEvenlyDesc)}>
               <button
                  className="btn w100"
                  style={{ flex: 2 }}
                  onClick={() => {
                     const resources = new Map();
                     for (const tile of tiles) {
                        const data = G.save.state.tiles.get(tile);
                        if (data) {
                           if (data.level > 1) {
                              const xp = getTotalBuildingCost(data.type, data.level, 1);
                              refundResource("XP", xp, resources);
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
                              if (trySpendResource("XP", getBuildingCost(data.type, data.level + 1), resources)) {
                                 ++data.level;
                                 shouldContinue = true;
                              }
                           }
                        }
                     }

                     refundResource("XP", resourceOf("XP", resources).current, resources);
                     GameStateUpdated.emit();
                  }}
               >
                  {t(L.DistributeExistingUpgradesEvenly)}
               </button>
            </FloatingTip>
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
                           refundResource("XP", xp, G.save.state.resources);
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
                           if (
                              trySpendResource("XP", getBuildingCost(data.type, data.level + 1), G.save.state.resources)
                           ) {
                              ++data.level;
                              shouldContinue = true;
                           }
                        }
                     }
                  }

                  GameStateUpdated.emit();
               }}
            >
               {t(L.InvestAllXpAndRedistributeEvenly)}
            </button>
         </div>
      </SidebarComp>
   );
}
